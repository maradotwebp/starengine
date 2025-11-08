import { type ButtonInteraction, MessageFlags } from "discord.js";
import { getRollResponse } from "../../commands/oracle.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => customId.startsWith("oracle_reroll:"),
	execute: async (interaction: ButtonInteraction) => {
		const itemId = interaction.customId.replace("oracle_reroll:", "");

		const components = await getRollResponse(itemId);
		await interaction.update({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
