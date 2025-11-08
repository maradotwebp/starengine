import {
	ActionRowBuilder,
	type APIMessageTopLevelComponent,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	SlashCommandBuilder,
	TextDisplayBuilder,
	type TopLevelComponentData,
} from "discord.js";
import { progressEditModalSchema } from "../interactions/buttons/progress-open-edit-modal.js";
import { progressSetSchema } from "../interactions/buttons/progress-set.js";
import type { AppSlashCommand } from "../types/command.js";
import { encodeCustomId } from "../utils/custom-id.js";

interface ChallengeRank {
	/**
	 * The name of the challenge rank.
	 */
	name: string;
	/**
	 * How many ticks should be added/removed when progress is marked once.
	 */
	progressInTicks: number;
}

export const challengeRanks: ChallengeRank[] = [
	{ name: "Troublesome", progressInTicks: 12 },
	{ name: "Dangerous", progressInTicks: 8 },
	{ name: "Formidable", progressInTicks: 4 },
	{ name: "Extreme", progressInTicks: 2 },
	{ name: "Epic", progressInTicks: 1 },
];

const MIN_TICKS = 0;
const MAX_TICKS = 40;

/**
 * Get the progress track image URL for a given tick count.
 */
function getProgressTrackUrl(tickCount: number): string {
	const clampedTicks = Math.max(MIN_TICKS, Math.min(tickCount, MAX_TICKS));
	return `https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/process-track-${clampedTicks}.png`;
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
					...challengeRanks.map((rank) => ({
						name: rank.name,
						value: rank.name,
					})),
				),
		)
		.toJSON(),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const title = interaction.options.getString("title", true);
		const rank = interaction.options.getString("rank", true);

		const components = getProgressTrackComponents(title, rank, 0);

		await interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};

/**
 * Build progress track components with buttons for marking/removing progress.
 */
export function getProgressTrackComponents(
	title: string,
	rank: string,
	currentTickCount: number,
): (TopLevelComponentData | APIMessageTopLevelComponent)[] {
	const challengeRank = challengeRanks.find((r) => r.name === rank);
	if (!challengeRank) {
		throw new Error(`Invalid challenge rank: ${rank}`);
	}

	const progressInTicks = challengeRank.progressInTicks;
	const newTickCountOnMark = Math.min(
		currentTickCount + progressInTicks,
		MAX_TICKS,
	);
	const newTickCountOnRemove = Math.max(currentTickCount - progressInTicks, 0);

	const markButton = new ButtonBuilder()
		.setCustomId(
			encodeCustomId(progressSetSchema, {
				title,
				rank,
				newTickCount: newTickCountOnMark,
			}),
		)
		.setEmoji("➕")
		.setStyle(ButtonStyle.Primary)
		.setDisabled(currentTickCount >= MAX_TICKS);

	const removeButton = new ButtonBuilder()
		.setCustomId(
			encodeCustomId(progressSetSchema, {
				title,
				rank,
				newTickCount: newTickCountOnRemove,
			}),
		)
		.setEmoji("➖")
		.setStyle(ButtonStyle.Primary)
		.setDisabled(currentTickCount <= 0);

	const editButton = new ButtonBuilder()
		.setCustomId(
			encodeCustomId(progressEditModalSchema, {
				title,
				rank,
				currentTickCount,
			}),
		)
		.setEmoji("✏️")
		.setStyle(ButtonStyle.Secondary);

	return [
		new TextDisplayBuilder().setContent(`## ${title}`).toJSON(),
		new MediaGalleryBuilder()
			.addItems(
				new MediaGalleryItemBuilder().setURL(
					getProgressTrackUrl(currentTickCount),
				),
			)
			.toJSON(),
		new TextDisplayBuilder().setContent(`-# **Rank**: ${rank}`).toJSON(),
		new ActionRowBuilder()
			.addComponents(removeButton, markButton, editButton)
			.toJSON(),
	];
}
