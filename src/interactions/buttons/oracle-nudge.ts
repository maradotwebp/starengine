import { type ButtonInteraction, MessageFlags } from "discord.js";
import { OracleWidget } from "@/core/components/oracle-widget.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "@/core/custom-id.js";
import { findOracle } from "@/core/oracles.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";

export const oracleNudgeSchema: CustomIdSchema<
	{ itemId: string; value: number },
	[string, string]
> = {
	name: "oracle_nudge",
	encode: ({ itemId, value }) => [itemId, value.toString()],
	decode: ([itemId, value]) => ({
		itemId,
		value: Number.parseInt(value, 10),
	}),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, oracleNudgeSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { itemId, value } = decodeCustomId(
			oracleNudgeSchema,
			interaction.customId,
		);

		const oracle = findOracle(itemId);
		if (!oracle) {
			throw new Error(`Oracle with ID ${itemId} not found`);
		}

		await interaction.update({
			components: OracleWidget({
				item: oracle,
				value,
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
