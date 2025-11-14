import type { ISettingTruth, ISettingTruthOption } from "dataforged";
import {
	ActionRowBuilder,
	type APIMessageTopLevelComponent,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import { encodeCustomId } from "@/core/custom-id";
import { truthsOpenEditModalSchema } from "@/interactions/buttons/truths-open-edit-modal";
import { truthsRerollSchema } from "@/interactions/buttons/truths-reroll";
import { Section } from "./section";
import { isSettingTruthOption, Truth } from "./truth";

export interface TruthWidgetProps {
	truth: ISettingTruth;
	/**
	 * The content of this truth.
	 *
	 * Often one particular option of the truth, but is completely user customizable and may be any string.
	 *
	 * @default "*No Option selected yet.*"
	 */
	content?: ISettingTruthOption | string;
}

export function TruthWidget({
	truth,
	content = "*No Option selected yet.*",
}: TruthWidgetProps): APIMessageTopLevelComponent[] {
	const iconHref = getTruthIconHref(truth);

	return [
		Section({
			content: Truth({ truth, content }),
			icon: iconHref
				? {
						url: iconHref,
						alt: truth.Display.Title,
					}
				: undefined,
		}),
		new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(
						encodeCustomId(truthsOpenEditModalSchema, { truthId: truth.$id }),
					)
					.setEmoji("✏️")
					.setLabel("Edit")
					.setStyle(ButtonStyle.Secondary),
				...(isSettingTruthOption(content) && content.Subtable
					? [
							new ButtonBuilder()
								.setCustomId(
									encodeCustomId(truthsRerollSchema, {
										truthId: truth.$id,
										optionId: content.$id,
									}),
								)
								.setEmoji("🔄")
								.setStyle(ButtonStyle.Secondary),
						]
					: []),
			)
			.toJSON(),
	];
}

/**
 * Get the icon href for a setting truth.
 */
function getTruthIconHref(truth: ISettingTruth): string | undefined {
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
