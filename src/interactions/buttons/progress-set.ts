import { type ButtonInteraction, MessageFlags } from "discord.js";
import { getProgressTrackComponents } from "../../commands/progress.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => customId.startsWith("progress_set:"),
	execute: async (interaction: ButtonInteraction) => {
		const customId = interaction.customId;
		const parts = customId.replace("progress_set:", "").split(":");

		// Format: progress_set:<base64EncodedTitle>:<rank>:<newTickCount>
		if (parts.length !== 3) {
			throw new Error(`Invalid progress_set customId format: ${customId}`);
		}

		const [encodedTitle, rank, tickCountStr] = parts;

		if (!encodedTitle || !rank || !tickCountStr) {
			throw new Error(`Invalid progress_set customId format: ${customId}`);
		}

		// Decode title from base64
		let title: string;
		try {
			title = Buffer.from(encodedTitle, "base64").toString("utf-8");
		} catch (error) {
			throw new Error(
				`Failed to decode title from customId: ${customId}. ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		const newTickCount = Number.parseInt(tickCountStr, 10);

		if (Number.isNaN(newTickCount)) {
			throw new Error(`Invalid tick count in customId: ${customId}`);
		}

		const components = getProgressTrackComponents(title, rank, newTickCount);

		await interaction.deferUpdate();
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};

