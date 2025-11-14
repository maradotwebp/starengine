import { starforged } from "dataforged";
import type { ChatInputCommandInteraction } from "discord.js";
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { TruthWidget } from "@/core/components/truth-widget";
import type { AppSlashCommand } from "../../types/command.js";

export const command: AppSlashCommand = {
	data: new SlashCommandBuilder()
		.setName("truths")
		.setDescription("List all available setting truths.")
		.toJSON(),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const truths = starforged["Setting Truths"];
		if (!truths || truths.length === 0) {
			throw new Error("No setting truths found.");
		}

		let isFirstMessage = true;
		for (const truth of truths) {
			const components = TruthWidget({
				truth,
				content: undefined,
			});

			if (isFirstMessage) {
				await interaction.reply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
				isFirstMessage = false;
			} else {
				await interaction.followUp({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
};
