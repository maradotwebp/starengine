import type { IMove } from "dataforged";
import type { ActionRollResult } from "@/core/random";
import { removeLinks } from "@/core/sanitize";

export interface ActionRollProps {
	move: IMove;
	rollResult: ActionRollResult;
}

export function ActionRoll({ move, rollResult }: ActionRollProps): string {
	const {
		actionDie,
		stat,
		bonus,
		actionScore,
		challengeDice,
		outcome,
		hasMatch,
	} = rollResult;

	const bonusDisplay = bonus !== 0 ? ` + **${bonus}** (+bonus)` : "";
	const outcomeInfo = move.Outcomes?.[outcome];
	let outcomeText = "";
	if (outcomeInfo) {
		// Check if there's a "With a Match" variant and we have a match
		if (hasMatch && outcomeInfo["With a Match"]) {
			outcomeText = removeLinks(outcomeInfo["With a Match"].Text);
		} else {
			outcomeText = removeLinks(outcomeInfo.Text);
		}
	}
	outcomeText = outcomeText.replace(/\n\n/g, "\n");

	const content = [
		`## **${outcome}**`,
		`**${actionDie}** (+ :game_die:) + **${stat}** (+stat)${bonusDisplay} → **${actionScore}** vs ${challengeDice[0]}, ${challengeDice[1]}`,
		hasMatch ? `**MATCH!**` : undefined,
		`-# \`→ ${actionScore} vs ${challengeDice[0]}, ${challengeDice[1]}\` ◇ ${move.Display.Title}`,
		``,
		outcomeText,
	].filter((line) => line !== undefined);

	return content.join("\n");
}
