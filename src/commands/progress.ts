import {
	type ChatInputCommandInteraction,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { AppSlashCommand } from "../types/command.js";

enum ChallengeRank {
	Troublesome = 1,
    Dangerous = 2,
    Formidable = 3,
    Extreme = 4,
    Epic = 5
}

export const command: AppSlashCommand = {
	data: new SlashCommandBuilder()
		.setName("progress")
		.setDescription("Create a progress track with a title and challenge rank.")
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription("The title of the progress track.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("rank")
				.setDescription("The challenge rank.")
				.setRequired(true)
				.addChoices(
					...Object.entries(ChallengeRank)
						.filter(([key]) => Number.isNaN(Number(key)))
						.map(([name]) => ({ name, value: name })),
				),
		)
		.toJSON(),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const title = interaction.options.getString("title", true);
		const rank = interaction.options.getString("rank", true);

		// Empty progress track (0 marks)
		const progressTrackUrl =
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/process-track-0.png";

		await interaction.reply({
			components: [
				new TextDisplayBuilder().setContent(`## ${title}`).toJSON(),
				new MediaGalleryBuilder()
					.addItems(new MediaGalleryItemBuilder().setURL(progressTrackUrl))
					.toJSON(),
				new TextDisplayBuilder().setContent(`-# **Rank**: ${rank}`).toJSON(),
			],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
