import { starforged } from "dataforged";
import {
	type ButtonInteraction,
	LabelBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import type { CustomIdSchema } from "../../utils/custom-id.js";
import {
	decodeCustomId,
	encodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { findMoveById } from "../../utils/move.js";
import { moveRollSelectSchema } from "../modals/move-roll.js";

export const moveRollSchema: CustomIdSchema<{ moveId: string }, [string]> = {
	name: "move_roll",
	encode: ({ moveId }) => [moveId],
	decode: ([moveId]) => ({ moveId }),
};

export const interaction: AppButtonInteraction = {
	customId: (customId) => matchesCustomId(customId, moveRollSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { moveId } = decodeCustomId(moveRollSchema, interaction.customId);

		const move = findMoveById(starforged["Move Categories"], moveId);

		if (!move) {
			throw new Error(`Could not find move with ID "${moveId}".`);
		}

		const modal = new ModalBuilder()
			.setCustomId(encodeCustomId(moveRollSelectSchema, { moveId }))
			.setTitle(`Roll: ${move.Display.Title ?? move.Name}`)
			.addLabelComponents(
				new LabelBuilder()
					.setLabel("Stat Value")
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId("stat")
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Enter your stat value (e.g., 3)")
							.setRequired(true)
							.setMinLength(1)
							.setMaxLength(2),
					),
				new LabelBuilder()
					.setLabel("Bonus/Penalty (optional)")
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId("bonus")
							.setStyle(TextInputStyle.Short)
							.setPlaceholder("Enter any adds or penalties (e.g., +2 or -1)")
							.setRequired(false)
							.setMinLength(1)
							.setMaxLength(3)
							.setValue("0"),
					),
			);

		await interaction.showModal(modal);
	},
};
