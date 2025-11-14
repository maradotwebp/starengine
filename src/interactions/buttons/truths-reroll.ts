import { type ButtonInteraction, MessageFlags } from "discord.js";
import { TruthWidget } from "@/core/components/truth-widget.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import { findTruthById, findTruthOptionById } from "@/core/truths.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const truthsRerollSchema: CustomIdSchema<
	{ truthId: string; optionId: string },
	[string, string]
> = {
	name: "truths_reroll",
	encode: ({ truthId, optionId }) => {
		const partialOptionId = optionId.replace(truthId, "");
		return [truthId, partialOptionId];
	},
	decode: ([truthId, partialOptionId]) => ({
		truthId,
		optionId: `${truthId}${partialOptionId}`,
	}),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, truthsRerollSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { truthId, optionId } = decodeCustomId(
			truthsRerollSchema,
			interaction.customId,
		);

		const truth = findTruthById(truthId);
		if (!truth) {
			throw new Error(`Truth not found with ID: ${truthId}`);
		}

		const selectedOption = findTruthOptionById(optionId, truth);
		if (!selectedOption) {
			throw new Error(`Option not found with ID: ${optionId}`);
		}

		await interaction.update({
			components: TruthWidget({
				truth,
				content: selectedOption,
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
