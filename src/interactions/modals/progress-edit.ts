import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import {
	challengeRanks,
	getProgressTrackComponents,
} from "../commands/progress.js";

export const progressEditSchema: CustomIdSchema<
	{ title: string; rank: string; currentTickCount: number },
	[string, string, string]
> = {
	name: "progress_edit",
	encode: ({ title, rank, currentTickCount }) => [
		title,
		rank,
		currentTickCount.toString(),
	],
	decode: ([title, rank, currentTickCount]) => ({
		title,
		rank,
		currentTickCount: Number.parseInt(currentTickCount, 10),
	}),
};

export const interaction: AppModalInteraction = {
	customId: (customId: string) => matchesCustomId(customId, progressEditSchema),
	execute: async (interaction: ModalSubmitInteraction) => {
		const { currentTickCount } = decodeCustomId(
			progressEditSchema,
			interaction.customId,
		);

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
