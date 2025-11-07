import { type IOracleCategory, starforged } from "dataforged";
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
import { formatNestedOracleRoll, formatOracleRoll } from "../utils/format.js";
import {
	collectCategories,
	collectOracles,
	findCategoryById,
	findOracleById,
	useOracle,
	useOracleCategory,
} from "../utils/oracle.js";

const oracles = collectOracles(starforged["Oracle Categories"]);
const categories = collectCategories(starforged["Oracle Categories"]);

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
	const value = interaction.options.getString("table", true);

	const [type, id] = value.split(":");

	if (!id) {
		await interaction.reply({
			content: `❌ Could not find an oracle table or category with ID "${id}".`,
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	switch (type) {
		case "oracle":
			return await handleOracleRoll(interaction, id);
		case "category":
			return await handleCategoryRoll(interaction, id);
		default:
			return await interaction.reply({
				content: `❌ Could not find an oracle table or category with ID "${id}".`,
				flags: MessageFlags.Ephemeral,
			});
	}
}

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused();

	const categoryOptions = categories.map(({ name, path, id }) => ({
		name: `📚 ${path.join("／")}${path.length > 0 ? "／" : ""}${name}`,
		value: id,
		type: "category" as const,
	}));

	const oracleOptions = oracles.map(({ name, path, id }) => ({
		name: `${path.join("／")}／${name}`,
		value: id,
		type: "oracle" as const,
	}));

	const allOptions = [...categoryOptions, ...oracleOptions]
		.filter(({ name }) =>
			name.toLowerCase().includes(focusedValue.toLowerCase()),
		)
		.slice(0, 25)
		.map(({ name, value, type }) => ({ name, value: `${type}:${value}` }));

	await interaction.respond(allOptions);
}

export async function getOracleRollResponse(
	oracleId: string,
): Promise<{ content: string; components: ActionRowBuilder<ButtonBuilder>[] }> {
	const oracle = findOracleById(starforged["Oracle Categories"], oracleId);

	if (!oracle) {
		throw new Error("Oracle not found");
	}

	const result = useOracle(oracle, starforged["Oracle Categories"]);
	const response = formatOracleRoll(result);

	const rerollButton = new ButtonBuilder()
		.setCustomId(`oracle_reroll:${oracleId}`)
		.setEmoji("🔄")
		.setStyle(ButtonStyle.Secondary);
	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		rerollButton,
	);

	return {
		content: response,
		components: [actionRow],
	};
}

async function handleOracleRoll(
	interaction: ChatInputCommandInteraction,
	id: string,
) {
	try {
		const { content, components } = await getOracleRollResponse(id);
		await interaction.reply({
			content,
			components,
		});
	} catch (error) {
		console.error(`Error handling oracle reroll:`, error);
		await interaction.reply({
			content: `❌ Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
}

async function handleCategoryRoll(
	interaction: ChatInputCommandInteraction,
	id: string,
) {
	const category = findCategoryById(starforged["Oracle Categories"], id);

	if (!category) {
		await interaction.reply({
			content: `❌ Category not found`,
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const results = useOracleCategory(category, starforged["Oracle Categories"]);

	if (results.length === 0) {
		await interaction.reply({
			content: `❌ Category "${category.Display.Title}" does not contain any rollable oracles.`,
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	// Format the response
	let response = "";
	for (const result of results) {
		response += formatNestedOracleRoll(result, 0);
		if (result.nestedRolls) {
			for (const nested of result.nestedRolls) {
				response += formatNestedOracleRoll(nested, 1);
			}
		}
	}
	response += `-# ◇ ${category.Display.Title}\n`;

	const content = new TextDisplayBuilder().setContent(response);
	const iconHrefs = getIconHrefs(category);

	// Add a thumbnail if available
	if (iconHrefs.length > 0) {
		const section = new SectionBuilder().addTextDisplayComponents(content);
		const randomIconHref = iconHrefs[
			Math.floor(Math.random() * iconHrefs.length)
		] as string;
		section.setThumbnailAccessory(
			new ThumbnailBuilder()
				.setURL(randomIconHref)
				.setDescription(category.Display.Title),
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

function getIconHrefs(category: IOracleCategory): string[] {
	return [
		...(category.Display.Images?.map((image) =>
			image.replace(
				"../../img/raster/",
				"https://raw.githubusercontent.com/rsek/dataforged/refs/heads/main/img/raster/",
			),
		) ?? []),
		category.Display.Icon?.replace(
			"../../img/vector/",
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/Oracles/",
		).replace(".svg", ".png"),
	].filter((href) => href !== undefined);
}
