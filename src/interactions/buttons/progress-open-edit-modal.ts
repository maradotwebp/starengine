import {
	type ButtonInteraction,
	LabelBuilder,
	ModalBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { challengeRanks } from "../../commands/progress.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	encodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { progressEditSchema } from "../modals/progress-edit.js";

export const progressEditModalSchema: CustomIdSchema<
	{ title: string; rank: string; currentTickCount: number },
	[string, string, string]
> = {
	name: "progress_open_edit_modal",
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

export const interaction: AppButtonInteraction = {
	customId: (customId: string) =>
		matchesCustomId(customId, progressEditModalSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { title, rank, currentTickCount } = decodeCustomId(
			progressEditModalSchema,
			interaction.customId,
		);

		const modal = new ModalBuilder()
			.setCustomId(
				encodeCustomId(progressEditSchema, {
					title,
					rank,
					currentTickCount,
				}),
			)
			.setTitle("Edit Progress Track")
			.addLabelComponents(
				new LabelBuilder()
					.setLabel("Title")
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId("title")
							.setStyle(TextInputStyle.Short)
							.setValue(title)
							.setRequired(true)
							.setMaxLength(100),
					),
				new LabelBuilder()
					.setLabel("Challenge Rank")
					.setStringSelectMenuComponent(
						new StringSelectMenuBuilder()
							.setCustomId("rank")
							.setMaxValues(1)
							.setMinValues(1)
							.setOptions(
								...challengeRanks.map((r) => ({
									label: r.name,
									value: r.name,
								})),
							),
					),
			);

		await interaction.showModal(modal);
	},
};
