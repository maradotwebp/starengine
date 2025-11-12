import { starforged } from "dataforged";
import { type ButtonInteraction, MessageFlags } from "discord.js";
import { getRollResponse } from "../../commands/oracle.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { findMoveById } from "../../utils/move.js";

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
		}
	},
};
