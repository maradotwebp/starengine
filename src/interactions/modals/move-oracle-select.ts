import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { OracleWidget } from "@/core/components/oracle-widget.js";
import { type CustomIdSchema, matchesCustomId } from "@/core/custom-id.js";
import { findOracle } from "@/core/oracles.js";
import type { AppModalInteraction } from "../../types/interaction/modal.js";

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

		const oracle = findOracle(selectedOracleId);

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
	},
};
