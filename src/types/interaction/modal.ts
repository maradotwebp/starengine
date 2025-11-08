import type { ModalSubmitInteraction } from "discord.js";

export interface AppModalInteraction {
	/**
	 * The custom ID of the modal interaction.
	 *
	 * Either a string uniquely identifying the interaction,
	 * or a function that returns a boolean indicating if the interaction should be handled.
	 */
	customId: string | ((customId: string) => boolean);
	/**
	 * The function to execute when the modal interaction is triggered.
	 */
	execute: (interaction: ModalSubmitInteraction) => Promise<void>;
}
