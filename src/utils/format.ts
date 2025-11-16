import type { IMove } from "dataforged";
import { removeLinks, removeTables } from "@/core/sanitize.js";
import type { ActionRollResult } from "./dice.js";

/**
 * Format a move for display in Discord.
 *
 * @example
 * const formatted = formatMove(move);
 * // Returns markdown formatted string with title and description
 */
export function formatMove(move: IMove): string {
	const text = move.Text
		? removeTables(removeLinks(move.Text.replaceAll("\n\n", "\n")))
		: "";
	return [`## ${move.Display.Title}`, text ? `\n${text}` : ""].join("\n");
}

/**
 * Format an action roll result for display in Discord.
 *
 * @example
 * const rollResult = performActionRoll(3, 1);
 * const formatted = formatActionRollResult(move, rollResult);
 * // Returns formatted string with dice, outcome, and move text
 */
export function formatActionRollResult(
	move: IMove,
	rollResult: ActionRollResult,
): string {
	const {
		actionDie,
		stat,
		bonus,
		actionScore,
		challengeDice,
		outcome,
		hasMatch,
	} = rollResult;

	/*
	## Weak Hit
**4** (+ :game_die:) + **3** (+stat) → **7** vs 4, 10
➨ **MATCH!**
-# `→ 7 vs 4, 10` ◇ Check Your Gear

You have it, but must choose one.
- Your supply is diminished: Sacrifice Resources (-1)
- It's not quite right, and causes a complication or delay: Lose Momentum (-2)
	*/
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
		`-# \`→ ${actionScore} vs ${challengeDice[0]}, ${challengeDice[1]}\` ◇ Check Your Gear`,
		``,
		outcomeText,
	].filter((line) => line !== undefined);

	return content.join("\n");
}
