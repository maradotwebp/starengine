import type { ISettingTruth, ISettingTruthOption } from "dataforged";
import { starforged } from "dataforged";
import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { getTruthComponents } from "../../commands/truths.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";

export const interaction: AppModalInteraction = {
	customId: (customId: string) => customId.startsWith("truths_edit_modal:"),
	execute: async (interaction: ModalSubmitInteraction) => {
		const customId = interaction.customId;
		const parts = customId.replace("truths_edit_modal:", "").split(":");

		// Format: truths_edit_modal:<base64EncodedTruthId>
		if (parts.length !== 1 || !parts[0]) {
			throw new Error(`Invalid truths_edit_modal customId format: ${customId}`);
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

		// Get the custom truth text or selected table option
		const customTruth = interaction.fields.getTextInputValue("truth_custom");
		const selectedOptionIndices =
			interaction.fields.getStringSelectValues("truth_table");

		let truthContent: string;

		if (customTruth?.trim()) {
			// Use custom truth text
			truthContent = customTruth.trim();
		} else if (selectedOptionIndices.length > 0) {
			// Use selected table option
			const optionIndex = Number.parseInt(
				selectedOptionIndices[0] as string,
				10,
			);
			if (
				Number.isNaN(optionIndex) ||
				optionIndex < 0 ||
				optionIndex >= truth.Table.length
			) {
				throw new Error(
					`Invalid table option index: ${selectedOptionIndices[0]}`,
				);
			}

			const selectedOption = truth.Table[optionIndex] as ISettingTruthOption;
			truthContent = selectedOption.Description ?? "";
		} else {
			// Neither provided, keep the current state
			truthContent = "*No Option selected yet.*";
		}

		const components = getTruthComponents(truth, truthContent);

		if (!interaction.message) {
			throw new Error("Cannot edit message: interaction.message is null");
		}

		await interaction.deferUpdate();
		await interaction.message.edit({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
