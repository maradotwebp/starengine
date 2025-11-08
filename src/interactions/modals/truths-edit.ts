import type { IRow, ISettingTruth, ISettingTruthOption } from "dataforged";
import { starforged } from "dataforged";
import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { getTruthComponents } from "../../commands/truths.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";

export const truthsEditModalSchema: CustomIdSchema<
	{ truthId: string },
	[string]
> = {
	name: "truths_edit_modal",
	encode: ({ truthId }) => [truthId],
	decode: ([truthId]) => ({ truthId }),
};

export const interaction: AppModalInteraction = {
	customId: (customId: string) =>
		matchesCustomId(customId, truthsEditModalSchema),
	execute: async (interaction: ModalSubmitInteraction) => {
		const { truthId } = decodeCustomId(
			truthsEditModalSchema,
			interaction.customId,
		);

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
			truthContent = formatTruthDescription(selectedOption);
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

/**
 * Format a truth option, rolling on its subtable if available.
 */
function formatTruthDescription(option: ISettingTruthOption): string {
	let content = option.Description ?? "";

	// Check if the option has a subtable
	if (option.Subtable && option.Subtable.length > 0) {
		const subtableResult = rollOnSubtable(option.Subtable);
		if (subtableResult) {
			content += `\n${subtableResult}`;
		}
	}

	return content;
}

/**
 * Roll on a truth option subtable.
 */
function rollOnSubtable(subtable: IRow[]): string | null {
	const roll = Math.floor(Math.random() * 100) + 1;

	for (const row of subtable) {
		const floor = row.Floor ?? 1;
		const ceiling = row.Ceiling ?? 100;

		if (roll >= floor && roll <= ceiling) {
			const result = row.Result ?? "";
			return [
				`**${result}**`,
				row.Summary,
				`-# \`→ ${roll}\` ◇ ${row.Display?.Title ?? "Truth"}`,
			].filter(Boolean).join("\n");
		}
	}

	return null;
}
