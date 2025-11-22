import type { ISettingTruthOption } from "dataforged";
import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { TruthWidget } from "@/core/components/truth-widget";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import { findTruthById, findTruthOptionById } from "@/core/truths.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";

export const truthsEditSchema: CustomIdSchema<{ truthId: string }, [string]> = {
	name: "truths_edit",
	encode: ({ truthId }) => [truthId],
	decode: ([truthId]) => ({ truthId }),
};

export const interaction: AppModalInteraction = {
	customId: (customId: string) => matchesCustomId(customId, truthsEditSchema),
	execute: async (interaction: ModalSubmitInteraction) => {
		const { truthId } = decodeCustomId(truthsEditSchema, interaction.customId);

		const customTruth = interaction.fields
			.getTextInputValue("truth_custom")
			.trim();
		const selectedOptionIds =
			interaction.fields.getStringSelectValues("truth_table");

		const truth = findTruthById(truthId);
		if (!truth) throw new Error(`Truth not found with ID: ${truthId}`);

		let content: ISettingTruthOption | string | undefined;
		if (customTruth) {
			content = customTruth;
		} else {
			const selectedOptionId = selectedOptionIds[0];
			if (selectedOptionId === "random") {
				content = truth.Table[Math.floor(Math.random() * truth.Table.length)];
			} else if (selectedOptionId) {
				content = findTruthOptionById(selectedOptionId, truth);
			}
		}

		if (!interaction.message) {
			throw new Error("Cannot edit message: interaction.message is null");
		}

		await interaction.deferUpdate();
		await interaction.editReply({
			components: TruthWidget({
				truth,
				content,
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
