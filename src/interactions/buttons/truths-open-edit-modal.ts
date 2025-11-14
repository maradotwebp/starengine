import type { ISettingTruthOption } from "dataforged";
import {
	type ButtonInteraction,
	LabelBuilder,
	ModalBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	encodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import { findTruthById } from "@/core/truths.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import { truthsEditSchema } from "../modals/truths-edit.js";

export const truthsOpenEditModalSchema: CustomIdSchema<
	{ truthId: string },
	[string]
> = {
	name: "truths_open_edit_modal",
	encode: ({ truthId }) => [truthId],
	decode: ([truthId]) => ({ truthId }),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) =>
		matchesCustomId(customId, truthsOpenEditModalSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { truthId } = decodeCustomId(
			truthsOpenEditModalSchema,
			interaction.customId,
		);

		const truth = findTruthById(truthId);
		if (!truth) {
			throw new Error(`Truth not found with ID: ${truthId}`);
		}

		const modal = new ModalBuilder()
			.setCustomId(encodeCustomId(truthsEditSchema, { truthId }))
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
								{
									label: "Random Option",
									description: "Select randomly from the table.",
									value: "random",
									emoji: "🎲",
								},
								...truth.Table.map((option, index) => ({
									label: `Option ${index + 1}`,
									description: formatOptionTitle(option),
									value: option.$id,
								})),
							),
					),
			);

		await interaction.showModal(modal);
	},
};

function formatOptionTitle(option: ISettingTruthOption): string {
	if (option.Display?.Title) {
		return option.Display.Title;
	}
	const description = option.Description;
	if (description.length >= 100) {
		return `${description.slice(0, 50)}...`;
	}
	return description;
}
