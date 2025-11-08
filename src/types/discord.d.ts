import type { Collection } from "discord.js";
import type { AppSlashCommand } from "./command";
import type { AppButtonInteraction } from "./interaction";

declare module "discord.js" {
	export interface Client {
		/**
		 * A collection of slash commands.
		 */
		commands: Collection<string, AppSlashCommand>;
		/**
		 * A collection of button interactions.
		 */
		buttonInteractions: Collection<
			string | ((customId: string) => boolean),
			AppButtonInteraction
		>;
	}
}
