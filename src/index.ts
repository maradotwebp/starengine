// import discord.js
import { Client, Events, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { SlashCommand } from "./types/command";
import "./types/discord.d.ts";

// create a new Client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Collection to store commands
client.commands = new Collection<string, SlashCommand>();

// Load commands from the commands directory
async function loadCommands() {
  const commandsPath = join(__dirname, "commands");
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// Load commands before starting the bot
await loadCommands();

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);

    if (!command || !command.autocomplete) {
      console.error(`No autocomplete handler matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(`Error executing autocomplete for ${interaction.commandName}:`, error);
    }
  }
});

// listen for the client to be ready
client.once(Events.ClientReady, async c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  
  // Register slash commands
  const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
  
  try {
    console.log('Started refreshing (/) commands.');
    
    // Get all command data
    const commandsData = Array.from(client.commands.values()).map(command => command.data.toJSON());
    
    // Register commands globally (this can take up to an hour to propagate)
    /*
    await rest.put(
      Routes.applicationCommands(c.user.id),
      { body: commandsData }
    );
    console.log('Successfully reloaded application (/) commands.');
    */

    await rest.put(
      Routes.applicationGuildCommands(c.user.id, '1436123427365851187'),
      { body: commandsData }
    );
    console.log('Successfully reloaded application guild (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

// login with the token from .env
client.login(process.env.DISCORD_TOKEN);