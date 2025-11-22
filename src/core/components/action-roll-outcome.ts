import type { IMove } from "dataforged";
import type { ActionRollOutcome as IActionRollOutcome } from "@/core/random";
import { removeLinks } from "@/core/sanitize";

export interface ActionRollProps {
	move: IMove;
	outcome: IActionRollOutcome;
	hasMatch: boolean;
}

export function ActionRollOutcome({
	move,
	outcome,
	hasMatch,
}: ActionRollProps): string {
	const outcomeInfo = move.Outcomes?.[outcome];
	let outcomeText = "";
	if (outcomeInfo) {
		if (hasMatch && outcomeInfo["With a Match"]) {
			outcomeText = removeLinks(outcomeInfo["With a Match"].Text);
		} else {
			outcomeText = removeLinks(outcomeInfo.Text);
		}
	}
	outcomeText = outcomeText.replace(/\n\n/g, "\n");
	return outcomeText;
}
