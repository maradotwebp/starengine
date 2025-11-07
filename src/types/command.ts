import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";

export interface SlashCommand {
  /**
   * The data for the slash command.
   */
  data: SlashCommandBuilder;
  /**
   * The function to execute when the slash command is triggered.
   */
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  /**
   * The function to execute when the autocomplete interaction is triggered.
   */
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

