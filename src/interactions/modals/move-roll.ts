import { starforged } from "dataforged";
import {
	MessageFlags,
	type ModalSubmitInteraction,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";
import type { CustomIdSchema } from "../../utils/custom-id.js";
import { decodeCustomId, matchesCustomId } from "../../utils/custom-id.js";
import { performActionRoll } from "../../utils/dice.js";
import { formatActionRollResult } from "../../utils/format.js";
import { findMoveById } from "../../utils/move.js";

export const moveRollSelectSchema: CustomIdSchema<
	{ moveId: string },
	[string]
> = {
	name: "move_roll_select",
	encode: ({ moveId }) => [moveId],
	decode: ([moveId]) => ({ moveId }),
};

export const interaction: AppModalInteraction = {
	customId: (customId) => matchesCustomId(customId, moveRollSelectSchema),
	execute: async (interaction: ModalSubmitInteraction) => {
		const { moveId } = decodeCustomId(
			moveRollSelectSchema,
			interaction.customId,
		);

		const move = findMoveById(starforged["Move Categories"], moveId);

		if (!move) {
			throw new Error(`Could not find move with ID "${moveId}".`);
		}

		if (!move.Outcomes) {
			throw new Error(
				`Move "${move.Display.Title ?? move.Name}" does not have outcomes defined.`,
			);
		}

		// Parse input values
		const statInput = interaction.fields.getTextInputValue("stat");
		const bonusInput = interaction.fields.getTextInputValue("bonus");

		// Validate stat value
		const stat = Number.parseInt(statInput, 10);
		if (Number.isNaN(stat)) {
			throw new Error(
				`Invalid stat value: "${statInput}". Please enter a number.`,
			);
		}

		// Validate bonus value
		const bonus = bonusInput ? Number.parseInt(bonusInput, 10) : 0;
		if (Number.isNaN(bonus)) {
			throw new Error(
				`Invalid bonus value: "${bonusInput}". Please enter a number.`,
			);
		}

		// Perform the action roll
		const rollResult = performActionRoll(stat, bonus);

		// Format and send the result
		const formattedResult = formatActionRollResult(move, rollResult);

		const icon = {
			"Strong Hit":
				"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/outcomes/outcome-strong-hit.png",
			"Weak Hit":
				"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/outcomes/outcome-weak-hit.png",
			Miss: "https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/outcomes/outcome-miss.png",
		}[rollResult.outcome];

		await interaction.reply({
			components: [
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(formattedResult),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder().setURL(icon),
					),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
