import type { IMove } from "dataforged";
import {
	ActionRowBuilder,
	type APIMessageTopLevelComponent,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import { encodeCustomId } from "@/core/custom-id";
import { moveOracleRollSchema } from "@/interactions/buttons/move-oracle-roll";
import { moveRollSchema } from "@/interactions/buttons/move-roll";
import { Move } from "./move";
import { Section } from "./section";

export interface MoveWidgetProps {
	move: IMove;
}

export function MoveWidget({
	move,
}: MoveWidgetProps): APIMessageTopLevelComponent[] {
	return [
		Section({
			content: Move({ move }),
			icon: undefined,
		}),
		new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(
						encodeCustomId(moveRollSchema, {
							moveId: move.$id,
						}),
					)
					.setDisabled(!move.Outcomes)
					.setEmoji("🎲")
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(
						encodeCustomId(moveOracleRollSchema, {
							moveId: move.$id,
						}),
					)
					.setDisabled((move.Oracles?.length ?? 0) === 0)
					.setEmoji("🔮")
					.setLabel("Roll on table")
					.setStyle(ButtonStyle.Secondary),
			)
			.toJSON(),
	];
}
