import { type ButtonInteraction, MessageFlags } from "discord.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";
import { getRollResponse } from "../commands/oracle.js";

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

		const components = await getRollResponse(itemId);
		await interaction.update({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
