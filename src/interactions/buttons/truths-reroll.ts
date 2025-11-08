import { starforged } from "dataforged";
import { type ButtonInteraction, MessageFlags } from "discord.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { findTruthById, findTruthOptionById } from "../../utils/truths.js";
import { createTruthComponents } from "../modals/truths-edit.js";

export const truthsRerollSchema: CustomIdSchema<
	{ truthId: string; optionId: string },
	[string, string]
> = {
	name: "truths_reroll",
	encode: ({ truthId, optionId }) => {
		const partialOptionId = optionId.replace(truthId, "");
		return [truthId, partialOptionId];
	},
	decode: ([truthId, partialOptionId]) => ({ truthId, optionId: `${truthId}${partialOptionId}` }),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, truthsRerollSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { truthId, optionId } = decodeCustomId(
			truthsRerollSchema,
			interaction.customId,
		);

		const truth = findTruthById(starforged["Setting Truths"], truthId);
		if (!truth) {
			throw new Error(`Truth not found with ID: ${truthId}`);
		}

		const selectedOption = findTruthOptionById(truth, optionId);
		if (!selectedOption) {
			throw new Error(`Option not found with ID: ${optionId}`);
		}

		const components = createTruthComponents(truth, {
			selectedOption,
		});

		await interaction.update({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
