import type { IMove } from "dataforged";
import type { ActionRollResult } from "@/core/random";

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
	return [
		`## **${outcome}**`,
		`**${actionDie}** (+ :game_die:) + **${stat}** (+stat)${bonusDisplay} → **${actionScore}** vs ${challengeDice[0]}, ${challengeDice[1]}`,
		hasMatch ? `**MATCH!**` : undefined,
		`-# \`→ ${actionScore} vs ${challengeDice[0]}, ${challengeDice[1]}\` ◇ ${move.Display.Title}`,
		``,
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
