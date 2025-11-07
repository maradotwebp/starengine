import type { ButtonInteraction } from "discord.js";
import { getOracleRollResponse } from "../commands/oracle.js";
import type { ButtonInteractionHandler } from "../types/interaction.js";

export const handler: ButtonInteractionHandler = {
	customId: (customId: string) => customId.startsWith("oracle_nudge_down:"),
	execute: async (interaction: ButtonInteraction) => {
		const parts = interaction.customId.split(":");
		const oracleId = parts[1] as string;
		const currentRowIndex = Number.parseInt(parts[2] as string, 10);

		try {
			const newRowIndex = currentRowIndex + 1;

			const { content, components } = await getOracleRollResponse(
				oracleId,
				newRowIndex,
			);
			await interaction.update({
				content,
				components,
			});
		} catch (error) {
			console.error(`Error handling oracle nudge down:`, error);
			await interaction.reply({
				content: `❌ Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
				ephemeral: true,
			});
		}
	},
};

