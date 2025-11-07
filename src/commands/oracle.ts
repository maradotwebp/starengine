import { starforged } from "dataforged";
import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	MessageFlags,
	SectionBuilder,
	SlashCommandBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";
import { formatOracleRoll, formatOracleRollAsList } from "../utils/format.js";
import {
	collectRollableItems,
	findRollableItemById,
	findRowIndexByRoll,
	type RollableItem,
	rollItem,
	rollItemAtRow,
} from "../utils/oracle.js";

const rollableItems = collectRollableItems(starforged["Oracle Categories"]);

export const data = new SlashCommandBuilder()
	.setName("oracle")
	.setDescription("Roll on an oracle table or entire category.")
	.addStringOption((option) =>
		option
			.setName("table")
			.setDescription("The name of the oracle table or category to roll on")
			.setRequired(true)
			.setAutocomplete(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const itemId = interaction.options.getString("table", true);
	const item = findRollableItemById(starforged["Oracle Categories"], itemId);

	if (!item) {
		throw new Error(`Could not find a rollable item with ID "${itemId}".`);
	}

	await handleRoll(interaction, item);
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused();

	const allOptions = rollableItems
		.map(({ name, path, id }) => ({
			name: `${path.join("／")}${path.length > 0 ? "／" : ""}${name}`,
			value: id,
		}))
		.filter(({ name }) =>
			name.toLowerCase().includes(focusedValue.toLowerCase()),
		)
		.slice(0, 25);

	await interaction.respond(allOptions);
}

export async function getRollResponse(
	itemId: string,
	rowIndex?: number,
): Promise<{ content: string; components: ActionRowBuilder<ButtonBuilder>[] }> {
	const item = findRollableItemById(starforged["Oracle Categories"], itemId);
	if (!item) {
		throw new Error("Rollable item not found");
	}

	// Check if it has a table (can be rolled with row index)
	const hasTable = "Table" in item && item.Table && item.Table.length > 0;

	if (!hasTable && rowIndex !== undefined) {
		throw new Error("Cannot use row index on an item without a table");
	}

	const result =
		rowIndex !== undefined
			? rollItemAtRow(item, rowIndex, starforged["Oracle Categories"])
			: rollItem(item, starforged["Oracle Categories"]);

	// If result is an array (category roll), we can't use interactive buttons
	if (Array.isArray(result)) {
		throw new Error("Cannot get interactive response for category rolls");
	}

	const response = formatOracleRoll(result);

	// Determine current row index
	const currentRowIndex =
		rowIndex !== undefined ? rowIndex : findRowIndexByRoll(item, result.roll);

	// Create buttons
	const addButton = new ButtonBuilder()
		.setCustomId(`oracle_add:${itemId}`)
		.setEmoji("➕")
		.setStyle(ButtonStyle.Primary);

	const nudgeUpButton = new ButtonBuilder()
		.setCustomId(`oracle_nudge:${itemId}:${currentRowIndex - 1}`)
		.setEmoji("⬆️")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(currentRowIndex === 0);

	const tableLength = "Table" in item && item.Table ? item.Table.length : 0;
	const nudgeDownButton = new ButtonBuilder()
		.setCustomId(`oracle_nudge:${itemId}:${currentRowIndex + 1}`)
		.setEmoji("⬇️")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(currentRowIndex === tableLength - 1);

	const rerollButton = new ButtonBuilder()
		.setCustomId(`oracle_reroll:${itemId}`)
		.setEmoji("🔄")
		.setStyle(ButtonStyle.Secondary);

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		addButton,
		nudgeUpButton,
		nudgeDownButton,
		rerollButton,
	);

	return {
		content: response,
		components: [actionRow],
	};
}

async function handleRoll(
	interaction: ChatInputCommandInteraction,
	item: RollableItem,
) {
	// Check if it has a table
	const hasTable = "Table" in item && item.Table && item.Table.length > 0;

	// If it has a table, use interactive response
	if (hasTable) {
		const { content, components } = await getRollResponse(item.$id);
		await interaction.reply({
			content,
			components,
		});
		return;
	}

	// Otherwise, roll all sub-oracles and display results
	const results = rollItem(item, starforged["Oracle Categories"]);

	if (!Array.isArray(results) || results.length === 0) {
		throw new Error(`"${item.Display.Title}" does not contain any rollable oracles.`);
	}

	// Format the response
	let response = "";
	for (const result of results) {
		response += formatOracleRollAsList(result, 0);
		if (result.nestedRolls) {
			for (const nested of result.nestedRolls) {
				response += formatOracleRollAsList(nested, 1);
			}
		}
	}
	response += `-# ◇ ${item.Display.Title}\n`;

	const content = new TextDisplayBuilder().setContent(response);
	const iconHrefs = getIconHrefs(item);

	// Add a thumbnail if available
	if (iconHrefs.length > 0) {
		const section = new SectionBuilder().addTextDisplayComponents(content);
		const randomIconHref = iconHrefs[
			Math.floor(Math.random() * iconHrefs.length)
		] as string;
		section.setThumbnailAccessory(
			new ThumbnailBuilder()
				.setURL(randomIconHref)
				.setDescription(item.Display.Title),
		);
		await interaction.reply({
			components: [section],
			flags: MessageFlags.IsComponentsV2,
		});
	} else {
		await interaction.reply({
			components: [content],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

function getIconHrefs(item: RollableItem): string[] {
	return [
		...(item.Display.Images?.map((image) =>
			image.replace(
				"../../img/raster/",
				"https://raw.githubusercontent.com/rsek/dataforged/refs/heads/main/img/raster/",
			),
		) ?? []),
		item.Display.Icon?.replace(
			"../../img/vector/",
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/Oracles/",
		).replace(".svg", ".png"),
	].filter((href) => href !== undefined);
}
