import type { ButtonInteraction } from "discord.js";
import { getOracleRollResponse } from "../commands/oracle.js";
import type { ButtonInteractionHandler } from "../types/interaction.js";

export const handler: ButtonInteractionHandler = {
	customId: (customId: string) => customId.startsWith("oracle_reroll:"),
	execute: async (interaction: ButtonInteraction) => {
		const oracleId = interaction.customId.replace("oracle_reroll:", "");

		const { content, components } = await getOracleRollResponse(oracleId);
		await interaction.update({
			content,
			components,
		});
	},
};
