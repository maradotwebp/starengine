import { type ButtonInteraction, MessageFlags } from "discord.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { getRollResponse } from "../commands/oracle.js";

export const oracleNudgeSchema: CustomIdSchema<
	{ itemId: string; targetRowIndex: number },
	[string, string]
> = {
	name: "oracle_nudge",
	encode: ({ itemId, targetRowIndex }) => [itemId, targetRowIndex.toString()],
	decode: ([itemId, targetRowIndex]) => ({
		itemId,
		targetRowIndex: Number.parseInt(targetRowIndex, 10),
	}),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, oracleNudgeSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { itemId, targetRowIndex } = decodeCustomId(
			oracleNudgeSchema,
			interaction.customId,
		);

		const components = await getRollResponse(itemId, targetRowIndex);
		await interaction.update({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
