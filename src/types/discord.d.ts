import type { Collection } from "discord.js";
import type { SlashCommand } from "./command";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, SlashCommand>;
  }
}

