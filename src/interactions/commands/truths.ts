import type { ISettingTruth } from "dataforged";
import { starforged } from "dataforged";
import type { ChatInputCommandInteraction } from "discord.js";
import {
	ActionRowBuilder,
	type APIMessageTopLevelComponent,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SectionBuilder,
	SlashCommandBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
	type TopLevelComponentData,
} from "discord.js";
import { encodeCustomId } from "@/core/custom-id.js";
import type { AppSlashCommand } from "../../types/command.js";
import { truthsOpenEditModalSchema } from "../buttons/truths-open-edit-modal.js";

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

			const components = getTruthComponents(truth, "*No Option selected yet.*");

			if (isFirstMessage) {
				await interaction.reply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
				isFirstMessage = false;
			} else {
				await interaction.followUp({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
};

/**
 * Build truth components with section and edit button.
 *
 * @example
 * const components = getTruthComponents(truth, "*No Option selected yet.*");
 * await interaction.reply({ components, flags: MessageFlags.IsComponentsV2 });
 */
export function getTruthComponents(
	truth: ISettingTruth,
	truthContent: string,
	additionalButtons: ButtonBuilder[] = [],
): (TopLevelComponentData | APIMessageTopLevelComponent)[] {
	const iconUrl = getTruthIconUrl(truth);
	const truthName = truth.Display.Title;

	const content = new TextDisplayBuilder().setContent(
		[`## ${truth.Display.Title}`, truthContent, `-# > ${truth.Character}`].join(
			"\n",
		),
	);

	const section = new SectionBuilder().addTextDisplayComponents(content);

	if (iconUrl) {
		section.setThumbnailAccessory(
			new ThumbnailBuilder().setURL(iconUrl).setDescription(truthName),
		);
	}

	const editButton = new ButtonBuilder()
		.setCustomId(
			encodeCustomId(truthsOpenEditModalSchema, { truthId: truth.$id }),
		)
		.setEmoji("✏️")
		.setLabel("Edit")
		.setStyle(ButtonStyle.Secondary);

	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(editButton, ...additionalButtons)
		.toJSON();

	return [section.toJSON(), buttonRow];
}

/**
 * Get the icon URL for a setting truth.
 */
function getTruthIconUrl(truth: ISettingTruth): string | undefined {
	const truthName = truth.Display.Title;

	if (truth.Display.Icon) {
		return truth.Display.Icon.replace(
			"../../img/vector/",
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/",
		).replace(".svg", ".png");
	}

	// Fallback: construct icon URL from truth name
	// Convert name to match filename format (e.g., "Artificial Intelligence" -> "Artificial_Intelligence")
	const iconFileName = truthName.replace(/\s+/g, "_");
	return `https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/Setting_Truths/${iconFileName}.png`;
}
