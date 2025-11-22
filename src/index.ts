import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	REST,
	Routes,
} from "discord.js";
import type { AppButtonInteraction } from "./types/interaction/button.ts";
import type { AppModalInteraction } from "./types/interaction/modal.ts";

import "./types/discord.d.ts";
import { serve } from "bun";
import type { AppSlashCommand } from "./types/command.ts";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

client.commands = new Collection<string, AppSlashCommand>();

client.buttonInteractions = new Collection<
	string | ((customId: string) => boolean),
	AppButtonInteraction
>();

client.modalInteractions = new Collection<
	string | ((customId: string) => boolean),
	AppModalInteraction
>();

const token = process.env.DISCORD_TOKEN as string;
if (!token) {
	throw new Error("Missing Discord token (DISCORD_TOKEN environment variable)");
}

/**
 * Load commands from the commands directory.
 */
async function loadCommands() {
	const commandsPath = join(__dirname, "interactions", "commands");
	const commandFiles = readdirSync(commandsPath).filter(
		(file) => file.endsWith(".ts") || file.endsWith(".js"),
	);

	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const module = await import(filePath);
		if ("command" in module) {
			const command = module.command as AppSlashCommand;
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "command" property.`,
			);
		}
	}
}

/**
 * Load button interactions from the interactions directory.
 */
async function loadButtonInteractions() {
	const interactionsPath = join(__dirname, "interactions", "buttons");

	const interactionFiles = readdirSync(interactionsPath).filter(
		(file) => file.endsWith(".ts") || file.endsWith(".js"),
	);

	for (const file of interactionFiles) {
		const filePath = join(interactionsPath, file);
		const interactionFile = await import(filePath);
		if ("interaction" in interactionFile) {
			const interaction = interactionFile.interaction as AppButtonInteraction;
			client.buttonInteractions.set(interaction.customId, interaction);
		} else {
			console.log(
				`[WARNING] The interaction at ${filePath} is missing a required "interaction" property.`,
			);
		}
	}
}

/**
 * Load modal interactions from the interactions directory.
 */
async function loadModalInteractions() {
	const interactionsPath = join(__dirname, "interactions", "modals");

	if (!existsSync(interactionsPath)) {
		return;
	}

	const interactionFiles = readdirSync(interactionsPath).filter(
		(file) => file.endsWith(".ts") || file.endsWith(".js"),
	);

	for (const file of interactionFiles) {
		const filePath = join(interactionsPath, file);
		const interactionFile = await import(filePath);
		if ("interaction" in interactionFile) {
			const interaction = interactionFile.interaction as AppModalInteraction;
			client.modalInteractions.set(interaction.customId, interaction);
		} else {
			console.log(
				`[WARNING] The interaction at ${filePath} is missing a required "interaction" property.`,
			);
		}
	}
}

await loadCommands();
await loadButtonInteractions();
await loadModalInteractions();

/**
 * Get a formatted error message for Discord.
 */
function getErrorMessage(error: unknown) {
	return {
		content: `❌ Error: \`${error instanceof Error ? error.message : "Unknown error occurred"}\``,
		flags: "Ephemeral" as const,
	};
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing command:`, error);
			const errorMessage = getErrorMessage(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
		}
	} else if (interaction.isAutocomplete()) {
		const command = client.commands.get(interaction.commandName);

		if (!command || !command.autocomplete) {
			console.error(
				`No autocomplete handler matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(
				`Error executing autocomplete for ${interaction.commandName}:`,
				error,
			);
		}
	} else if (interaction.isButton()) {
		const handler = client.buttonInteractions.find((handler) => {
			const customId = handler.customId;
			if (typeof customId === "string") {
				return interaction.customId === customId;
			} else {
				return customId(interaction.customId);
			}
		});

		if (!handler) {
			console.error(
				`No button interaction handler found for customId: ${interaction.customId}`,
			);
			return;
		}

		try {
			await handler.execute(interaction);
		} catch (error) {
			console.error(`Error executing button interaction:`, error);
			const errorMessage = getErrorMessage(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
		}
	} else if (interaction.isModalSubmit()) {
		const handler = client.modalInteractions.find((handler) => {
			const customId = handler.customId;
			if (typeof customId === "string") {
				return interaction.customId === customId;
			} else {
				return customId(interaction.customId);
			}
		});

		if (!handler) {
			console.error(
				`No modal interaction handler found for customId: ${interaction.customId}`,
			);
			return;
		}

		try {
			await handler.execute(interaction);
		} catch (error) {
			console.error(`Error executing modal interaction:`, error);
			const errorMessage = getErrorMessage(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
		}
	}
});

client.once(Events.ClientReady, async (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

	try {
		console.log("Started refreshing (/) commands.");

		const commandsData = Array.from(client.commands.values()).map(
			(command) => command.data,
		);

		if (process.env.NODE_ENV === "production") {
			await rest.put(Routes.applicationCommands(c.user.id), {
				body: commandsData,
			});
			console.log("Successfully reloaded application (/) commands.");
		} else {
			const guildId = process.env.DEV_GUILD_ID as string;
			if (!guildId) {
				throw new Error("Missing guild ID (DEV_GUILD_ID environment variable)");
			}
			await rest.put(Routes.applicationGuildCommands(c.user.id, guildId), {
				body: commandsData,
			});
			console.log("Successfully reloaded application guild (/) commands.");
		}

		const server = serve({
			port: 3000,
			routes: {
				"/api/health": new Response("OK"),
			},
		});

		console.log(`Healthcheck server running at ${server.url}`);
	} catch (error) {
		console.error(error);
	}
});

client.login(token);
