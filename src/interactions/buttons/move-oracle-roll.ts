import {
	type ButtonInteraction,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import { OracleWidget } from "@/core/components/oracle-widget.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	encodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import { findMove } from "@/core/moves.js";
import { findOracle } from "@/core/oracles.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
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

		const move = findMove(moveId);
		const oracles = move?.Oracles ?? [];

		if (oracles.length === 0) {
			throw new Error("No oracle IDs provided");
		}

		if (oracles.length === 1) {
			const oracle = findOracle(oracles[0] as string);
			if (!oracle) {
				throw new Error("Oracle not found");
			}

			await interaction.deferUpdate();
			await interaction.followUp({
				components: OracleWidget({
					item: oracle,
					value: undefined,
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const oracleItems = oracles
				.map((oracleId) => findOracle(oracleId))
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
