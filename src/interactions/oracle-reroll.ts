import { ButtonInteraction } from "discord.js";
import { getOracleRollResponse } from "../commands/oracle.js";
import type { ButtonInteractionHandler } from "../types/interaction.js";

export const handler: ButtonInteractionHandler = {
  customId: (customId: string) => customId.startsWith('oracle_reroll:'),
  execute: async (interaction: ButtonInteraction) => {
    const oracleId = interaction.customId.replace('oracle_reroll:', '');
    
    try {
      const { content, components } = await getOracleRollResponse(oracleId);
      await interaction.update({
        content,
        components
      });
    } catch (error) {
      console.error(`Error handling oracle reroll:`, error);
      await interaction.reply({
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        ephemeral: true
      });
    }
  }
};

