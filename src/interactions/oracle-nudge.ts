import type { ButtonInteraction } from "discord.js";
import { getRollResponse } from "../commands/oracle.js";
import type { ButtonInteractionHandler } from "../types/interaction.js";

export const handler: ButtonInteractionHandler = {
	customId: (customId: string) => customId.startsWith("oracle_nudge:"),
	execute: async (interaction: ButtonInteraction) => {
		const parts = interaction.customId.split(":");
		const itemId = parts[1] as string;
		const targetRowIndex = Number.parseInt(parts[2] as string, 10);

		const { content, components } = await getRollResponse(
			itemId,
			targetRowIndex,
		);
		await interaction.update({
			content,
			components,
		});
	},
};
