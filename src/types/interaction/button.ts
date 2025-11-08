import type { ButtonInteraction } from "discord.js";

export interface AppButtonInteraction {
	/**
	 * The custom ID of the button interaction.
	 *
	 * Either a string uniquely identifying the interaction,
	 * or a function that returns a boolean indicating if the interaction should be handled.
	 */
	customId: string | ((customId: string) => boolean);
	/**
	 * The function to execute when the button interaction is triggered.
	 */
	execute: (interaction: ButtonInteraction) => Promise<void>;
}
