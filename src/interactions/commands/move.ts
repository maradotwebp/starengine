import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import { MoveWidget } from "@/core/components/move-widget";
import { collectMoveAutocomplete, findMove } from "@/core/moves.js";
import type { AppSlashCommand } from "../../types/command.js";

const allMoves = collectMoveAutocomplete();

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
		const move = findMove(moveId);

		if (!move) {
			throw new Error(`Could not find a move with ID "${moveId}".`);
		}

		await interaction.reply({
			components: MoveWidget({ move }),
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
