export interface ActionRollResult {
	actionDie: number; // 1d6 roll
	stat: number; // Stat value provided by user
	bonus: number; // Additional bonus/penalty
	actionScore: number; // actionDie + stat + bonus
	challengeDice: [number, number]; // 2d10 rolls
	outcome: "Strong Hit" | "Weak Hit" | "Miss";
	hasMatch: boolean; // True if both challenge dice are the same
}

/**
 * Rolls a single six-sided die (1d6)
 * @returns A number between 1 and 6
 */
export function rollActionDie(): number {
	return Math.floor(Math.random() * 6) + 1;
}

/**
 * Rolls two ten-sided dice (2d10) for challenge dice
 * @returns A tuple of two numbers, each between 1 and 10
 */
export function rollChallengeDice(): [number, number] {
	const die1 = Math.floor(Math.random() * 10) + 1;
	const die2 = Math.floor(Math.random() * 10) + 1;
	return [die1, die2];
}

/**
 * Checks if both challenge dice show the same number
 * @param challengeDice The two challenge dice values
 * @returns True if both dice match
 */
export function hasMatch(challengeDice: [number, number]): boolean {
	return challengeDice[0] === challengeDice[1];
}

/**
 * Determines the outcome of an action roll
 * @param actionScore The total action score (1d6 + stat + bonus)
 * @param challengeDice The two challenge dice values
 * @returns The outcome: "Strong Hit", "Weak Hit", or "Miss"
 */
export function calculateOutcome(
	actionScore: number,
	challengeDice: [number, number],
): "Strong Hit" | "Weak Hit" | "Miss" {
	const beatsFirst = actionScore > challengeDice[0];
	const beatsSecond = actionScore > challengeDice[1];

	if (beatsFirst && beatsSecond) {
		return "Strong Hit";
	}
	if (beatsFirst || beatsSecond) {
		return "Weak Hit";
	}
	return "Miss";
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
	const actionDie = rollActionDie();
	const challengeDice = rollChallengeDice();
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
