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

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => customId.startsWith("progress_edit:"),
	execute: async (interaction: ButtonInteraction) => {
		const customId = interaction.customId;
		const parts = customId.replace("progress_edit:", "").split(":");

		// Format: progress_edit:<base64EncodedTitle>:<rank>:<currentTickCount>
		if (parts.length !== 3) {
			throw new Error(`Invalid progress_edit customId format: ${customId}`);
		}

		const [encodedTitle, rank, tickCountStr] = parts;

		if (!encodedTitle || !rank || !tickCountStr) {
			throw new Error(`Invalid progress_edit customId format: ${customId}`);
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

		const modal = new ModalBuilder()
			.setCustomId(
				`progress_edit_modal:${encodedTitle}:${rank}:${tickCountStr}`,
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
