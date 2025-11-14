import {
	type APIMessageTopLevelComponent,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";

export interface SectionProps {
	/**
	 * Markdown string.
	 *
	 * Shown on the left side.
	 */
	content: string;
	/**
	 * Icon to show on the right side.
	 */
	icon?: {
		url: string;
		alt: string;
	};
}

export function Section({
	content,
	icon,
}: SectionProps): APIMessageTopLevelComponent {
	const textDisplay = new TextDisplayBuilder().setContent(content);
	return icon
		? new SectionBuilder()
				.addTextDisplayComponents(textDisplay)
				.setThumbnailAccessory(
					new ThumbnailBuilder().setURL(icon.url).setDescription(icon.alt),
				)
				.toJSON()
		: textDisplay.toJSON();
}
