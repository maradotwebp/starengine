import { type ButtonInteraction, MessageFlags } from "discord.js";
import { getRollResponse } from "../../commands/oracle.js";
import type { AppButtonInteraction } from "../../types/interaction/button.js";
import {
	type CustomIdSchema,
	decodeCustomId,
	matchesCustomId,
} from "../../utils/custom-id.js";

export const oracleAddSchema: CustomIdSchema<{ itemId: string }, [string]> = {
	name: "oracle_add",
	encode: ({ itemId }) => [itemId],
	decode: ([itemId]) => ({ itemId }),
};

export const interaction: AppButtonInteraction = {
	customId: (customId: string) => matchesCustomId(customId, oracleAddSchema),
	execute: async (interaction: ButtonInteraction) => {
		const { itemId } = decodeCustomId(oracleAddSchema, interaction.customId);

		const components = await getRollResponse(itemId);
		await interaction.deferUpdate();
		await interaction.followUp({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
