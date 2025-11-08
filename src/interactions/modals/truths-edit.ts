import type { IRow, ISettingTruth, ISettingTruthOption } from "dataforged";
import { starforged } from "dataforged";
import {
	type APIMessageTopLevelComponent,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	type ModalSubmitInteraction,
	type TopLevelComponentData,
} from "discord.js";
import { getTruthComponents } from "../../commands/truths.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	encodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { truthsRerollSchema } from "../buttons/truths-reroll.js";

export const truthsEditSchema: CustomIdSchema<{ truthId: string }, [string]> = {
	name: "truths_edit",
	encode: ({ truthId }) => [truthId],
	decode: ([truthId]) => ({ truthId }),
};

export const interaction: AppModalInteraction = {
	customId: (customId: string) => matchesCustomId(customId, truthsEditSchema),
	execute: async (interaction: ModalSubmitInteraction) => {
		const { truthId } = decodeCustomId(truthsEditSchema, interaction.customId);

		// Get the custom truth text or selected table option
		const customTruth = interaction.fields.getTextInputValue("truth_custom");
		const selectedOptionIndices =
			interaction.fields.getStringSelectValues("truth_table");

		const selectedOptionIndex =
			selectedOptionIndices.length > 0
				? Number.parseInt(selectedOptionIndices[0] as string, 10)
				: undefined;

		const components = createTruthComponents(truthId, {
			selectedOptionIndex,
			customTruth,
		});

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
 * Create components for a truth based on its ID and selected option or custom text.
 */
export function createTruthComponents(
	truthId: string,
	options: {
		selectedOptionIndex?: number;
		customTruth?: string;
	} = {},
): (TopLevelComponentData | APIMessageTopLevelComponent)[] {
	const { selectedOptionIndex, customTruth } = options;

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

	let truthContent: string;
	let components: (TopLevelComponentData | APIMessageTopLevelComponent)[] = [];

	if (customTruth?.trim()) {
		// Use custom truth text
		truthContent = customTruth.trim();
		components = getTruthComponents(truth, truthContent);
	} else if (
		selectedOptionIndex !== undefined &&
		selectedOptionIndex !== null
	) {
		// Use selected table option
		if (
			Number.isNaN(selectedOptionIndex) ||
			selectedOptionIndex < 0 ||
			selectedOptionIndex >= truth.Table.length
		) {
			throw new Error(`Invalid table option index: ${selectedOptionIndex}`);
		}

		const selectedOption = truth.Table[
			selectedOptionIndex
		] as ISettingTruthOption;
		truthContent = formatTruthDescription(selectedOption);

		const additionalButtons: ButtonBuilder[] = [];
		if (selectedOption.Subtable && selectedOption.Subtable.length > 0) {
			additionalButtons.push(
				new ButtonBuilder()
					.setCustomId(
						encodeCustomId(truthsRerollSchema, {
							truthId,
							optionIndex: selectedOptionIndex,
						}),
					)
					.setEmoji("🔄")
					.setStyle(ButtonStyle.Secondary),
			);
		}

		components = getTruthComponents(truth, truthContent, additionalButtons);
	} else {
		// Neither provided, keep the current state
		truthContent = "*No Option selected yet.*";
		components = getTruthComponents(truth, truthContent);
	}

	return components;
}

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
				`- **${result}**`,
				row.Summary,
				`  -# \`→ ${roll}\` ◇ ${row.Display?.Title ?? "Truth"}`,
			]
				.filter(Boolean)
				.join("\n");
		}
	}

	return null;
}
