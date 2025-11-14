import { starforged } from "dataforged";
import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { moveOracleRollSchema } from "../interactions/buttons/move-oracle-roll.js";
import { moveRollSchema } from "../interactions/buttons/move-roll.js";
import type { AppSlashCommand } from "../types/command.js";
import { encodeCustomId } from "../utils/custom-id.js";
import { formatMove } from "../utils/format.js";
import { collectMoves, findMoveById } from "../utils/move.js";

const allMoves = collectMoves(starforged["Move Categories"]);

export const command: AppSlashCommand = {
	data: new SlashCommandBuilder()
		.setName("move")
		.setDescription("Execute a move.")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("The name of the move.")
				.setRequired(true)
				.setAutocomplete(true),
		)
		.toJSON(),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const moveId = interaction.options.getString("name", true);
		const move = findMoveById(starforged["Move Categories"], moveId);

		if (!move) {
			throw new Error(`Could not find a move with ID "${moveId}".`);
		}

		const formattedMove = formatMove(move);
		const content = new TextDisplayBuilder().setContent(formattedMove);

		await interaction.reply({
			components: [
				content.toJSON(),
				new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setCustomId(
								encodeCustomId(moveRollSchema, {
									moveId: move.$id,
								}),
							)
							.setDisabled(!move.Outcomes)
							.setEmoji("🎲")
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId(
								encodeCustomId(moveOracleRollSchema, {
									moveId: move.$id,
								}),
							)
							.setDisabled((move.Oracles?.length ?? 0) === 0)
							.setEmoji("🔮")
							.setLabel("Roll on table")
							.setStyle(ButtonStyle.Secondary),
					)
					.toJSON(),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
	autocomplete: async (interaction: AutocompleteInteraction) => {
		const focusedValue = interaction.options.getFocused();

		const filteredMoves = allMoves
			.filter(({ name, category: categoryName }) => {
				const searchText = focusedValue.toLowerCase();
				return (
					name.toLowerCase().includes(searchText) ||
					categoryName.toLowerCase().includes(searchText)
				);
			})
			.slice(0, 25)
			.map(({ name, category: categoryName, id }) => ({
				name: `${categoryName}／${name}`,
				value: id,
			}));

		await interaction.respond(filteredMoves);
	},
};
