import { type ButtonInteraction, MessageFlags } from "discord.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import { getProgressTrackComponents } from "../commands/progress.js";

export const progressSetSchema: CustomIdSchema<
	{ title: string; rank: string; newTickCount: number },
	[string, string, string]
> = {
	name: "progress_set",
	encode: ({ title, rank, newTickCount }) => [
		title,
		rank,
		newTickCount.toString(),
	],
	decode: ([title, rank, newTickCount]) => ({
		title,
		rank,
		newTickCount: Number.parseInt(newTickCount, 10),
	}),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, progressSetSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { title, rank, newTickCount } = decodeCustomId(
			progressSetSchema,
			interaction.customId,
		);

		const components = getProgressTrackComponents(title, rank, newTickCount);

		await interaction.deferUpdate();
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
