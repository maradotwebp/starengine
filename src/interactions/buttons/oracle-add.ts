import { type ButtonInteraction, MessageFlags } from "discord.js";
import { getRollResponse } from "../../commands/oracle.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => customId.startsWith("oracle_add:"),
	execute: async (interaction: ButtonInteraction) => {
		const itemId = interaction.customId.replace("oracle_add:", "");

		const components = await getRollResponse(itemId);
		await interaction.deferUpdate();
		await interaction.followUp({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};

