import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";
import { type CustomIdSchema, matchesCustomId } from "../../utils/custom-id.js";
import { getRollResponse } from "../commands/oracle.js";

export const moveOracleSelectSchema: CustomIdSchema<
	{ moveId: string },
	[string]
> = {
	name: "move_oracle_select",
	encode: ({ moveId }) => [moveId],
	decode: ([moveId]) => ({ moveId }),
};

export const interaction: AppModalInteraction = {
	customId: (customId: string) =>
		matchesCustomId(customId, moveOracleSelectSchema),
	execute: async (interaction: ModalSubmitInteraction) => {
		const selectedOracleId =
			interaction.fields.getStringSelectValues("oracle_select")[0];

		if (!selectedOracleId) {
			throw new Error("No oracle selected");
		}

		const components = await getRollResponse(selectedOracleId);
		await interaction.deferUpdate();
		await interaction.followUp({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
