import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { ActionRollWidget } from "@/core/components/action-roll-widget";
import type { CustomIdSchema } from "@/core/custom-id.js";
import { decodeCustomId, matchesCustomId } from "@/core/custom-id.js";
import { findMove } from "@/core/moves.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";
import { performActionRoll } from "../../utils/dice.js";

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

		const move = findMove(moveId);

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

		await interaction.reply({
			components: ActionRollWidget({ move, rollResult }),
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
