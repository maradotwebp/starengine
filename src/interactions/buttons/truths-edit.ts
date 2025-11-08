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
import {
	type CustomIdSchema,
	decodeCustomId,
	encodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { truthsEditModalSchema } from "../modals/truths-edit.js";

export const truthsEditSchema: CustomIdSchema<{ truthId: string }, [string]> = {
	name: "truths_edit",
	encode: ({ truthId }) => [truthId],
	decode: ([truthId]) => ({ truthId }),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, truthsEditSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { truthId } = decodeCustomId(truthsEditSchema, interaction.customId);

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
			.setCustomId(encodeCustomId(truthsEditModalSchema, { truthId }))
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
