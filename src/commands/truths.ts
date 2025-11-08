import { starforged } from "dataforged";
import type { ChatInputCommandInteraction } from "discord.js";
import {
	MessageFlags,
	SectionBuilder,
	SlashCommandBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";
import type { AppSlashCommand } from "../types/command.js";

export const command: AppSlashCommand = {
	data: new SlashCommandBuilder()
		.setName("truths")
		.setDescription("List all available setting truths.")
		.toJSON(),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const truths = starforged["Setting Truths"];
		if (!truths || truths.length === 0) {
			throw new Error("No setting truths found.");
		}

		let isFirstMessage = true;
		for (const truth of truths) {
			if (!truth) continue;
			
			const truthName = truth.Display.Title;

			// Get icon URL from Display.Icon if available, otherwise construct from name
			let iconUrl: string | undefined;
			if (truth.Display.Icon) {
				iconUrl = truth.Display.Icon.replace(
					"../../img/vector/",
					"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/",
				).replace(".svg", ".png");
			} else {
                console.log("No icon found");
				// Fallback: construct icon URL from truth name
				// Convert name to match filename format (e.g., "Artificial Intelligence" -> "Artificial_Intelligence")
				const iconFileName = truthName.replace(/\s+/g, "_");
				iconUrl = `https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/Setting_Truths/${iconFileName}.png`;
			}

            console.log("ICON URL", iconUrl);

			const content = new TextDisplayBuilder()
				.setContent([
                    `## ${truth.Display.Title}`,
                    `*No Option selected yet.*`,
                ].join("\n"));

			const section = new SectionBuilder()
				.addTextDisplayComponents(content);

			if (iconUrl) {
				section.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(iconUrl)
						.setDescription(truthName),
				);
			}

			const component = section.toJSON();

			if (isFirstMessage) {
				await interaction.reply({
					components: [component],
					flags: MessageFlags.IsComponentsV2,
				});
				isFirstMessage = false;
			} else {
				await interaction.followUp({
					components: [component],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
};

