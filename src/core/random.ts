import type { IRow } from "dataforged";

export enum ActionRollOutcome {
	StrongHit = "Strong Hit",
	WeakHit = "Weak Hit",
	Miss = "Miss",
}

export interface ActionRollResult {
	actionDie: number; // 1d6 roll
	stat: number; // Stat value provided by user
	bonus: number; // Additional bonus/penalty
	actionScore: number; // actionDie + stat + bonus
	challengeDice: [number, number]; // 2d10 rolls
	outcome: ActionRollOutcome;
	hasMatch: boolean; // True if both challenge dice are the same
}

/**
 * Generate a random integer between min and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random integer within the range of values in a row.
 */
export function randomInRow(row: Pick<IRow, "Floor" | "Ceiling">): number {
	return randomInt(row.Floor ?? 1, row.Ceiling ?? 100);
}

/**
 * Performs a complete action roll for a move
 * @param stat The stat value to add to the roll
 * @param bonus Any additional bonus or penalty to apply (default: 0)
 * @returns The complete action roll result
 */
export function performActionRoll(
	stat: number,
	bonus: number = 0,
): ActionRollResult {
	const actionDie = rollDie(6);
	const challengeDice = [rollDie(10), rollDie(10)] as [number, number];
	const actionScore = actionDie + stat + bonus;
	const outcome = calculateOutcome(actionScore, challengeDice);
	const match = hasMatch(challengeDice);

	return {
		actionDie,
		stat,
		bonus,
		actionScore,
		challengeDice,
		outcome,
		hasMatch: match,
	};
}

/**
 * Rolls a die with a given number of faces.
 */
function rollDie(faces: number): number {
	return randomInt(1, faces);
}

/**
 * Checks if both challenge dice show the same number
 * @param challengeDice The two challenge dice values
 * @returns True if both dice match
 */
function hasMatch(challengeDice: [number, number]): boolean {
	return challengeDice[0] === challengeDice[1];
}

/**
 * Determines the outcome of an action roll
 * @param actionScore The total action score (1d6 + stat + bonus)
 * @param challengeDice The two challenge dice values
 * @returns The outcome: "Strong Hit", "Weak Hit", or "Miss"
 */
function calculateOutcome(
	actionScore: number,
	challengeDice: [number, number],
): ActionRollOutcome {
	const beatsFirst = actionScore > challengeDice[0];
	const beatsSecond = actionScore > challengeDice[1];

	if (beatsFirst && beatsSecond) {
		return ActionRollOutcome.StrongHit;
	}
	if (beatsFirst || beatsSecond) {
		return ActionRollOutcome.WeakHit;
	}
	return ActionRollOutcome.Miss;
}
