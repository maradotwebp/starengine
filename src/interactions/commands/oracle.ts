import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import { OracleWidget } from "@/core/components/oracle-widget.js";
import { collectOracleAutocomplete, findOracle } from "@/core/oracles.js";
import type { AppSlashCommand } from "../../types/command.js";

const autocompleteItems = collectOracleAutocomplete();

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
		const item = findOracle(itemId);

		if (!item) {
			throw new Error(`Could not find a rollable item with ID "${itemId}".`);
		}

		await interaction.reply({
			components: OracleWidget({
				item,
				value: undefined,
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	},
	autocomplete: async (interaction: AutocompleteInteraction) => {
		const focusedValue = interaction.options.getFocused();

		const options = autocompleteItems
			.map(({ name, path, alias, id }) => ({
				name: `${path.join("／")}${path.length > 0 ? "／" : ""}${name}`,
				alias: alias,
				value: id,
			}))
			.filter(
				({ name, alias }) =>
					name.toLowerCase().includes(focusedValue.toLowerCase()) ||
					alias.some((a) =>
						a.toLowerCase().includes(focusedValue.toLowerCase()),
					),
			)
			.slice(0, 25);

		await interaction.respond(options);
	},
};
