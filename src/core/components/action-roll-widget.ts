import type { IMove } from "dataforged";
import type { APIMessageTopLevelComponent } from "discord.js";
import type { ActionRollResult } from "@/core/random";
import { ActionRoll } from "./action-roll";
import { Section } from "./section";

export interface ActionRollWidgetProps {
	move: IMove;
	rollResult: ActionRollResult;
}

export function ActionRollWidget({
	move,
	rollResult,
}: ActionRollWidgetProps): APIMessageTopLevelComponent[] {
	const icon = {
		"Strong Hit":
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/outcomes/outcome-strong-hit.png",
		"Weak Hit":
			"https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/outcomes/outcome-weak-hit.png",
		Miss: "https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/outcomes/outcome-miss.png",
	}[rollResult.outcome];

	return [
		Section({
			content: ActionRoll({ move, rollResult }),
			icon: icon
				? {
						url: icon,
						alt: rollResult.outcome,
					}
				: undefined,
		}),
	];
}
