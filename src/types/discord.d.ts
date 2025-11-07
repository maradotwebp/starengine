import type { Collection } from "discord.js";
import type { SlashCommand } from "./command";
import type { ButtonInteractionHandler } from "./interaction";

declare module "discord.js" {
  export interface Client {
    /**
     * A collection of slash commands.
     */
    commands: Collection<string, SlashCommand>;
    /**
     * A collection of button interactions.
     */
    buttonInteractions: Collection<string | ((customId: string) => boolean), ButtonInteractionHandler>;
  }
}

