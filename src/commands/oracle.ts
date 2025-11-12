import { starforged } from "dataforged";
import {
	ActionRowBuilder,
	type APIMessageTopLevelComponent,
	type AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	MessageFlags,
	SectionBuilder,
	SlashCommandBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
	type TopLevelComponentData,
} from "discord.js";
import { oracleNewSchema } from "../interactions/buttons/oracle-new.js";
import { oracleNudgeSchema } from "../interactions/buttons/oracle-nudge.js";
import { oracleRerollSchema } from "../interactions/buttons/oracle-reroll.js";
import type { AppSlashCommand } from "../types/command.js";
import { encodeCustomId } from "../utils/custom-id.js";
import { formatOracleRoll, formatOracleRollAsList } from "../utils/format.js";
import {
	collectRollableItems,
	findRollableItemById,
	findRowIndexByRoll,
	isRollable,
	type RollableItem,
	rollItem,
	rollItemAtRow,
} from "../utils/oracle.js";

const rollableItems = collectRollableItems(starforged["Oracle Categories"]);

export const command: AppSlashCommand = {
	data: new SlashCommandBuilder()
		.setName("oracle")
		.setDescription("Roll on one or multiple oracle tables.")
		.addStringOption((option) =>
			option
				.setName("table")
				.setDescription("The name of the oracle table(s) to roll on.")
				.setRequired(true)
				.setAutocomplete(true),
		)
		.toJSON(),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const itemId = interaction.options.getString("table", true);
		const item = findRollableItemById(starforged["Oracle Categories"], itemId);

		if (!item) {
			throw new Error(`Could not find a rollable item with ID "${itemId}".`);
		}

		await handleRoll(interaction, item);
	},
	autocomplete: async (interaction: AutocompleteInteraction) => {
		const focusedValue = interaction.options.getFocused();

		const allOptions = rollableItems
			.map(({ name, path, aliases, id }) => ({
				name: `${path.join("／")}${path.length > 0 ? "／" : ""}${name}`,
				aliases: aliases,
				value: id,
			}))
			.filter(
				({ name, aliases }) =>
					name.toLowerCase().includes(focusedValue.toLowerCase()) ||
					aliases.some((alias) =>
						alias.toLowerCase().includes(focusedValue.toLowerCase()),
					),
			)
			.slice(0, 25);

		await interaction.respond(allOptions);
	},
};

export async function getRollResponse(
	itemId: string,
	rowIndex?: number,
): Promise<(TopLevelComponentData | APIMessageTopLevelComponent)[]> {
	const item = findRollableItemById(starforged["Oracle Categories"], itemId);
	if (!item) {
		throw new Error("Rollable item not found");
	}

	const hasTable = "Table" in item && item.Table && item.Table.length > 0;

	if (!hasTable && rowIndex !== undefined) {
		throw new Error("Cannot use row index on an item without a table");
	}

	const result =
		rowIndex !== undefined
			? rollItemAtRow(item, rowIndex, starforged["Oracle Categories"])
			: rollItem(item, starforged["Oracle Categories"]);

	const isCategoryRoll = Array.isArray(result);
	const response = isCategoryRoll
		? result.map((result) => formatOracleRollAsList(result, 0)).join("")
		: formatOracleRoll(result);

	const buttons: ButtonBuilder[] = [];

	const addButton = new ButtonBuilder()
		.setCustomId(encodeCustomId(oracleNewSchema, { itemId }))
		.setEmoji("➕")
		.setStyle(ButtonStyle.Primary)
		.setDisabled(!(item.Usage?.["Max rolls"] || item.Usage?.Repeatable));

	const rerollButton = new ButtonBuilder()
		.setCustomId(encodeCustomId(oracleRerollSchema, { itemId }))
		.setEmoji("🔄")
		.setStyle(ButtonStyle.Secondary);

	if (isCategoryRoll) {
		buttons.push(addButton);
		buttons.push(rerollButton);
	} else {
		if (result.roll === undefined) {
			throw new Error("Invalid result: roll is undefined for table item");
		}
		const currentRowIndex =
			rowIndex !== undefined ? rowIndex : findRowIndexByRoll(item, result.roll);

		const nudgeUpButton = new ButtonBuilder()
			.setCustomId(
				encodeCustomId(oracleNudgeSchema, {
					itemId,
					targetRowIndex: currentRowIndex - 1,
				}),
			)
			.setEmoji("⬆️")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentRowIndex === 0);

		const tableLength = "Table" in item && item.Table ? item.Table.length : 0;
		const nudgeDownButton = new ButtonBuilder()
			.setCustomId(
				encodeCustomId(oracleNudgeSchema, {
					itemId,
					targetRowIndex: currentRowIndex + 1,
				}),
			)
			.setEmoji("⬇️")
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentRowIndex === tableLength - 1);

		buttons.push(addButton);
		buttons.push(nudgeUpButton);
		buttons.push(nudgeDownButton);
		buttons.push(rerollButton);
	}

	const iconHrefs = getIconHrefs(item);
	if (iconHrefs.length > 0) {
		const content = new TextDisplayBuilder().setContent(response);
		const section = new SectionBuilder().addTextDisplayComponents(content);
		const randomIconHref = iconHrefs[
			Math.floor(Math.random() * iconHrefs.length)
		] as string;
		section.setThumbnailAccessory(
			new ThumbnailBuilder()
				.setURL(randomIconHref)
				.setDescription(item.Display.Title),
		);
		return [
			section.toJSON(),
			new ActionRowBuilder<ButtonBuilder>().addComponents(buttons).toJSON(),
		];
	} else {
		return [
			new TextDisplayBuilder().setContent(response).toJSON(),
			new ActionRowBuilder<ButtonBuilder>().addComponents(buttons).toJSON(),
		];
	}
}

// ============================================================================
// Internal Functions
// ============================================================================

/**
 * Handle an oracle roll interaction.
 */
async function handleRoll(
	interaction: ChatInputCommandInteraction,
	item: RollableItem,
) {
	if (!isRollable(item)) {
		throw new Error(
			`"${item.Display.Title}" does not contain any rollable oracles.`,
		);
	}

	const components = await getRollResponse(item.$id);
	await interaction.reply({
		components,
		flags: MessageFlags.IsComponentsV2,
	});
}

/**
 * Get icon URLs for an oracle item.
 */
function getIconHrefs(item: RollableItem): string[] {
	return [
		...(item.Display.Images?.map((image) =>
			image.replace(
				"../../img/raster/",
				"https://raw.githubusercontent.com/rsek/dataforged/refs/heads/main/img/raster/",
			),
		) ?? []),
		item.Display.Icon?.replace(
			/\.\.\/\.\.\/img\/vector\/(Oracles)?/,
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/Oracles/",
		).replace(".svg", ".png"),
	].filter((href) => href !== undefined);
}
