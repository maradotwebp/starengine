import { type ButtonInteraction, MessageFlags } from "discord.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { createTruthComponents } from "../modals/truths-edit.js";

export const truthsRerollSchema: CustomIdSchema<
	{ truthId: string; optionIndex: number },
	[string, string]
> = {
	name: "truths_reroll",
	encode: ({ truthId, optionIndex }) => [truthId, optionIndex.toString()],
	decode: ([truthId, optionIndex]) => ({
		truthId,
		optionIndex: Number.parseInt(optionIndex, 10),
	}),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, truthsRerollSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { truthId, optionIndex } = decodeCustomId(
			truthsRerollSchema,
			interaction.customId,
		);

		const components = createTruthComponents(truthId, {
			selectedOptionIndex: optionIndex,
		});

		await interaction.update({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
