import type { ISettingTruth, ISettingTruthOption } from "dataforged";
import { starforged } from "dataforged";
import {
	type ButtonInteraction,
	LabelBuilder,
	ModalBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => customId.startsWith("truths_edit:"),
	execute: async (interaction: ButtonInteraction) => {
		const customId = interaction.customId;
		const parts = customId.replace("truths_edit:", "").split(":");

		// Format: truths_edit:<base64EncodedTruthId>
		if (parts.length !== 1 || !parts[0]) {
			throw new Error(`Invalid truths_edit customId format: ${customId}`);
		}

		const [encodedTruthId] = parts;

		// Decode truth ID from base64
		let truthId: string;
		try {
			truthId = Buffer.from(encodedTruthId, "base64").toString("utf-8");
		} catch (error) {
			throw new Error(
				`Failed to decode truth ID from customId: ${customId}. ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		// Find the truth by ID
		const truths = starforged["Setting Truths"];
		if (!truths) {
			throw new Error("No setting truths found.");
		}

		const truth = truths.find((t) => t?.$id === truthId) as
			| ISettingTruth
			| undefined;

		if (!truth) {
			throw new Error(`Truth not found with ID: ${truthId}`);
		}

		const formatOptionTitle = (option: ISettingTruthOption): string => {
			if (option.Display?.Title) {
				return option.Display.Title;
			}
			const description = option.Description;
			if (description.length >= 100) {
				return `${description.slice(0, 50)}...`;
			}
			return description;
		};

		const modal = new ModalBuilder()
			.setCustomId(`truths_edit_modal:${encodedTruthId}`)
			.setTitle(`Edit ${truth.Display.Title}`)
			.addLabelComponents(
				new LabelBuilder()
					.setLabel("Write your own truth...")
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId("truth_custom")
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder("Enter your custom truth text here...")
							.setRequired(false)
							.setMaxLength(2000),
					),
				new LabelBuilder()
					.setLabel("...or select from table")
					.setStringSelectMenuComponent(
						new StringSelectMenuBuilder()
							.setCustomId("truth_table")
							.setRequired(false)
							.setOptions(
								...truth.Table.map((option, index) => ({
									label: `Option ${index + 1}`,
									description: formatOptionTitle(option),
									value: index.toString(),
								})),
							),
					),
			);

		await interaction.showModal(modal);
	},
};
