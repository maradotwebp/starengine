import { type ButtonInteraction, MessageFlags } from "discord.js";
import { OracleWidget } from "@/core/components/oracle-widget.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import { findOracle } from "@/core/oracles.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const oracleNewSchema: CustomIdSchema<{ itemId: string }, [string]> = {
	name: "oracle_new",
	encode: ({ itemId }) => [itemId],
	decode: ([itemId]) => ({ itemId }),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, oracleNewSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { itemId } = decodeCustomId(oracleNewSchema, interaction.customId);

		const oracle = findOracle(itemId);
		if (!oracle) {
			throw new Error(`Oracle with ID ${itemId} not found`);
		}

		await interaction.deferUpdate();
		await interaction.followUp({
			components: OracleWidget({
				item: oracle,
				value: undefined,
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
