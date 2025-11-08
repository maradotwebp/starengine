import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

export interface AppSlashCommand {
	/**
	 * The data for the slash command.
	 */
	data: RESTPostAPIChatInputApplicationCommandsJSONBody;
	/**
	 * The function to execute when the slash command is triggered.
	 */
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	/**
	 * The function to execute when the autocomplete interaction is triggered.
	 */
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
