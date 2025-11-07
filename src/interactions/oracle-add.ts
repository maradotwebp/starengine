import type { ButtonInteraction } from "discord.js";
import { getOracleRollResponse } from "../commands/oracle.js";
import type { ButtonInteractionHandler } from "../types/interaction.js";

export const handler: ButtonInteractionHandler = {
	customId: (customId: string) => customId.startsWith("oracle_add:"),
	execute: async (interaction: ButtonInteraction) => {
		const oracleId = interaction.customId.replace("oracle_add:", "");

		try {
			// Get the new roll result
			const { content, components } = await getOracleRollResponse(oracleId);
			
			// Acknowledge the button click
			await interaction.deferUpdate();
			
			// Send a new follow-up message with the new roll
			await interaction.followUp({
				content,
				components,
			});
		} catch (error) {
			console.error(`Error handling oracle add:`, error);
			await interaction.reply({
				content: `❌ Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
				ephemeral: true,
			});
		}
	},
};

