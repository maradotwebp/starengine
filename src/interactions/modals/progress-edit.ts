import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import {
	challengeRanks,
	getProgressTrackComponents,
} from "../../commands/progress.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";

export const interaction: AppModalInteraction = {
	customId: (customId: string) => customId.startsWith("progress_edit_modal:"),
	execute: async (interaction: ModalSubmitInteraction) => {
		const customId = interaction.customId;
		const parts = customId.replace("progress_edit_modal:", "").split(":");

		// Format: progress_edit_modal:<base64EncodedTitle>:<rank>:<currentTickCount>
		if (parts.length !== 3) {
			throw new Error(
				`Invalid progress_edit_modal customId format: ${customId}`,
			);
		}

		const [encodedTitle, oldRank, tickCountStr] = parts;

		if (!encodedTitle || !oldRank || !tickCountStr) {
			throw new Error(
				`Invalid progress_edit_modal customId format: ${customId}`,
			);
		}

		const titleInput = interaction.fields.getTextInputValue("title");
		const rankInput = interaction.fields.getStringSelectValues("rank");

		// Validate rank
		const validRank = challengeRanks.find((rank) =>
			rankInput.some((r) => rank.name.toLowerCase().includes(r.toLowerCase())),
		);

		if (!validRank) {
			throw new Error(
				`Invalid challenge rank: ${rankInput}. Valid ranks are: ${challengeRanks.map((r) => r.name).join(", ")}`,
			);
		}

		const rank = validRank.name;
		const currentTickCount = Number.parseInt(tickCountStr, 10);

		if (Number.isNaN(currentTickCount)) {
			throw new Error(`Invalid tick count in customId: ${customId}`);
		}

		const components = getProgressTrackComponents(
			titleInput,
			rank,
			currentTickCount,
		);

		if (!interaction.message) {
			throw new Error("Cannot edit message: interaction.message is null");
		}

		await interaction.deferUpdate();
		await interaction.message.edit({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
