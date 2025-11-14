import type { IMove } from "dataforged";
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
		? removeTables(sanitizeText(move.Text.replaceAll("\n\n", "\n")))
		: "";
	return [`## ${move.Display.Title}`, text ? `\n${text}` : ""].join("\n");
}

/**
 * Remove markdown tables from text, as they are handled via the Oracles property.
 *
 * @example
 * const formatted = removeTables("Roll | Result\n---|----\n1-4 | Test");
 * // Returns text with tables removed
 */
function removeTables(text: string): string {
	const lines = text.split("\n");
	const result: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const currentLine = lines[i];
		if (!currentLine) {
			i++;
			continue;
		}

		// Check if this line looks like a table header (contains |)
		if (currentLine.includes("|")) {
			// Check if next line is a separator (contains - and |)
			const nextLine = lines[i + 1];
			if (nextLine?.includes("|") && nextLine.match(/^[\s\-|:]+$/)) {
				i += 2; // Skip header and separator

				// Skip all table rows
				while (i < lines.length) {
					const rowLine = lines[i];
					if (!rowLine || !rowLine.includes("|")) {
						break;
					}
					i++;
				}

				// Skip the table entirely (don't add it to result)
				continue;
			}
		}

		result.push(currentLine);
		i++;
	}

	return result.join("\n");
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
			outcomeText = sanitizeText(outcomeInfo["With a Match"].Text);
		} else {
			outcomeText = sanitizeText(outcomeInfo.Text);
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

/**
 * Sanitize a string to remove links to other items.
 *
 * The dataforged library uses links to other items in the string. This function removes those links.
 *
 * @example
 * const sanitized = sanitizeResult("[Action](Starforged/Oracles/Action)");
 * console.log(sanitized); // "*Action*"
 */
export function sanitizeText(text: string): string {
	return text.replace(/\[(?:⏵)?([^\]]+)\]\([^/]+\/([^)]+)\)/g, "*$1*");
}
