import { starforged } from "dataforged";
import {
	type ButtonInteraction,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import { getRollResponse } from "../../commands/oracle.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	encodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { findMoveById } from "../../utils/move.js";
import { findRollableItemById } from "../../utils/oracle.js";
import { moveOracleSelectSchema } from "../modals/move-oracle-select.js";

export const moveOracleRollSchema: CustomIdSchema<
	{ moveId: string },
	[string]
> = {
	name: "move_oracle_roll",
	encode: ({ moveId }) => [moveId],
	decode: ([moveId]) => ({ moveId }),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) =>
		matchesCustomId(customId, moveOracleRollSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { moveId } = decodeCustomId(
			moveOracleRollSchema,
			interaction.customId,
		);

		const move = findMoveById(starforged["Move Categories"], moveId);
		const oracles = move?.Oracles ?? [];

		if (oracles.length === 0) {
			throw new Error("No oracle IDs provided");
		}

		if (oracles.length === 1) {
			const components = await getRollResponse(oracles[0] as string);
			await interaction.deferUpdate();
			await interaction.followUp({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const oracleItems = oracles
				.map((oracleId) =>
					findRollableItemById(
						starforged["Oracle Categories"],
						oracleId as string,
					),
				)
				.filter((item): item is NonNullable<typeof item> => item !== null);

			if (oracleItems.length === 0) {
				throw new Error("No valid oracles found");
			}

			const modal = new ModalBuilder()
				.setCustomId(encodeCustomId(moveOracleSelectSchema, { moveId }))
				.setTitle(`Select Oracle for ${move?.Display.Title ?? "Move"}`)
				.addLabelComponents(
					new LabelBuilder()
						.setLabel("Select an oracle to roll")
						.setStringSelectMenuComponent(
							new StringSelectMenuBuilder()
								.setCustomId("oracle_select")
								.setRequired(true)
								.setOptions(
									oracleItems.map((item) => {
										return {
											label: item.Display.Title,
											value: item.$id,
										};
									}),
								),
						),
				);

			await interaction.showModal(modal);
		}
	},
};
