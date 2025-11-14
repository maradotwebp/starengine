import { type ButtonInteraction, MessageFlags } from "discord.js";
import { OracleWidget } from "@/core/components/oracle-widget.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import { findOracle } from "@/core/oracles.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const oracleRerollSchema: CustomIdSchema<{ itemId: string }, [string]> =
	{
		name: "oracle_reroll",
		encode: ({ itemId }) => [itemId],
		decode: ([itemId]) => ({ itemId }),
	};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, oracleRerollSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { itemId } = decodeCustomId(oracleRerollSchema, interaction.customId);

		const oracle = findOracle(itemId);
		if (!oracle) {
			throw new Error(`Oracle with ID ${itemId} not found`);
		}

		await interaction.update({
			components: OracleWidget({
				item: oracle,
				value: undefined,
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
