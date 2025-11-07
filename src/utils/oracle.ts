import type { IOracle, IOracleCategory, IRow } from "dataforged";

// Constants
const DICE_MIN = 1;
const DICE_MAX = 100;

// Types
export interface CollectedItem {
	name: string;
	path: string[];
	id: string;
}

export type CollectedOracle = CollectedItem;
export type CollectedCategory = CollectedItem;

export interface UseOracleResult {
	oracle: IOracle;
	roll: number;
	result: IRow;
	nestedRolls?: Array<UseOracleResult>;
}

// ============================================================================
// Public API - Collection Functions
// ============================================================================

/**
 * Collect all oracle names with their IDs for autocomplete.
 *
 * @example
 * const oracles = collectOracles(starforged["Oracle Categories"]);
 * console.log(oracles);
 */
export function collectOracles(
	categories: IOracleCategory[],
	path: string[] = [],
): CollectedOracle[] {
	const oracles: CollectedOracle[] = [];

	for (const category of categories) {
		const currentPath = [...path, category.Display.Title];

		if (category.Oracles) {
			for (const oracle of category.Oracles) {
				if (oracle.Table) {
					oracles.push(...processOracle(oracle, currentPath));
				}

				if (oracle.Oracles) {
					oracles.push(
						...processOracleList(oracle.Oracles, [
							...currentPath,
							oracle.Display.Title,
						]),
					);
				}
			}
		}

		if (category.Categories) {
			oracles.push(...collectOracles(category.Categories, currentPath));
		}
	}

	return oracles;
}

/**
 * Collect all category names with their IDs for autocomplete.
 *
 * @example
 * const categories = collectCategories(starforged["Oracle Categories"]);
 * console.log(categories);
 */
export function collectCategories(
	categories: IOracleCategory[],
	path: string[] = [],
): CollectedCategory[] {
	const result: CollectedCategory[] = [];

	for (const category of categories) {
		const hasOracles = getRollableOraclesFromCategory(category).length > 0;
		if (hasOracles) {
			result.push({
				name: category.Display.Title,
				path: [...path],
				id: category.$id,
			});
		}

		if (category.Categories) {
			result.push(
				...collectCategories(category.Categories, [
					...path,
					category.Display.Title,
				]),
			);
		}
	}

	return result;
}

// ============================================================================
// Public API - Search Functions
// ============================================================================

/**
 * Find an oracle by its ID.
 *
 * @example
 * const oracle = findOracleById(starforged["Oracle Categories"], "Starforged/Oracles/Characters/Revealed_Aspect");
 * console.log(oracle);
 */
export function findOracleById(
	categories: IOracleCategory[],
	id: string,
): IOracle | null {
	for (const category of categories) {
		if (category.Oracles) {
			for (const oracle of category.Oracles) {
				if (oracle.$id === id) {
					return oracle;
				}

				if (oracle.Oracles) {
					const found = findInOracleList(oracle.Oracles, id);
					if (found) return found;
				}
			}
		}

		if (category.Categories) {
			const found = findOracleById(category.Categories, id);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Find a category by its ID.
 *
 * @example
 * const category = findCategoryById(starforged["Oracle Categories"], "Starforged/Oracles/Characters");
 * console.log(category);
 */
export function findCategoryById(
	categories: IOracleCategory[],
	id: string,
): IOracleCategory | null {
	for (const category of categories) {
		if (category.$id === id) {
			return category;
		}

		if (category.Categories) {
			const found = findCategoryById(category.Categories, id);
			if (found) return found;
		}
	}
	return null;
}

// ============================================================================
// Public API - Oracle Rolling Functions
// ============================================================================

/**
 * Gets and validates that an oracle has a rollable table.
 * @throws {Error} If the oracle doesn't have a rollable table.
 */
function getValidatedTable(oracle: IOracle): IRow[] {
	if (!oracle.Table || oracle.Table.length === 0) {
		throw new Error("This oracle doesn't have a rollable table.");
	}
	return oracle.Table;
}

/**
 * Generates a random dice roll for d100.
 */
function rollDice(): number {
	return Math.floor(Math.random() * DICE_MAX) + DICE_MIN;
}

/**
 * Finds the matching row for a given roll value.
 */
function findRowByRoll(table: IRow[], roll: number): IRow {
	for (const row of table) {
		const floor = row.Floor ?? DICE_MIN;
		const ceiling = row.Ceiling ?? DICE_MAX;

		if (roll >= floor && roll <= ceiling) {
			return row;
		}
	}

	throw new Error("Could not find a matching result for the roll.");
}

/**
 * Processes nested oracle rolls from a row.
 */
function processNestedRolls(
	row: IRow,
	categories: IOracleCategory[],
): UseOracleResult[] | undefined {
	if (!row["Oracle rolls"]) {
		return undefined;
	}

	const nestedRolls: UseOracleResult[] = [];
	for (const oracleId of row["Oracle rolls"]) {
		const nestedOracle = findOracleById(categories, oracleId);
		if (nestedOracle) {
			nestedRolls.push(useOracle(nestedOracle, categories));
		}
	}

	return nestedRolls.length > 0 ? nestedRolls : undefined;
}

/**
 * Roll on an oracle table.
 *
 * @example
 * const { roll, result, nestedRolls } = useOracle(oracle, starforged["Oracle Categories"]);
 * console.log(roll, result, nestedRolls);
 */
export function useOracle(
	oracle: IOracle,
	categories: IOracleCategory[],
): UseOracleResult {
	const table = getValidatedTable(oracle);
	const roll = rollDice();
	const result = findRowByRoll(table, roll);
	const nestedRolls = processNestedRolls(result, categories);

	return {
		oracle,
		roll,
		result,
		nestedRolls,
	};
}

/**
 * Get the result from a specific row index in an oracle table.
 *
 * @example
 * const result = useOracleAtRow(oracle, 5, starforged["Oracle Categories"]);
 * console.log(result);
 */
export function useOracleAtRow(
	oracle: IOracle,
	rowIndex: number,
	categories: IOracleCategory[],
): UseOracleResult {
	const table = getValidatedTable(oracle);

	if (rowIndex < 0 || rowIndex >= table.length) {
		throw new Error("Row index out of bounds.");
	}

	const row = table[rowIndex] as IRow;
	const roll = row.Floor ?? DICE_MIN;
	const nestedRolls = processNestedRolls(row, categories);

	return {
		oracle,
		roll,
		result: row,
		nestedRolls,
	};
}

/**
 * Find the row index for a given roll value.
 */
export function findRowIndexByRoll(oracle: IOracle, roll: number): number {
	const table = getValidatedTable(oracle);

	for (let i = 0; i < table.length; i++) {
		const row = table[i] as IRow;
		const floor = row.Floor ?? DICE_MIN;
		const ceiling = row.Ceiling ?? DICE_MAX;

		if (roll >= floor && roll <= ceiling) {
			return i;
		}
	}

	throw new Error("Could not find a matching row for the roll.");
}

/**
 * Roll on all oracles in a category.
 *
 * @example
 * const results = useOracleCategory(category, starforged["Oracle Categories"]);
 * console.log(results);
 */
export function useOracleCategory(
	category: IOracleCategory,
	categories: IOracleCategory[],
): UseOracleResult[] {
	const oracles = getRollableOraclesFromCategory(category);
	const results: UseOracleResult[] = [];

	for (const oracle of oracles) {
		results.push(useOracle(oracle, categories));
	}

	return results;
}

// ============================================================================
// Helper Functions - Oracle Processing
// ============================================================================

/**
 * Creates collected items for an oracle including all its aliases.
 */
function processOracle(
	oracle: IOracle,
	path: string[],
): CollectedOracle[] {
	const items: CollectedOracle[] = [{
		name: oracle.Display.Title,
		path: [...path],
		id: oracle.$id,
	}];

	if (oracle.Aliases) {
		for (const alias of oracle.Aliases) {
			items.push({
				name: alias,
				path: [...path],
				id: oracle.$id,
			});
		}
	}

	return items;
}

/**
 * Recursively processes oracles from a list, including sub-oracles.
 */
function processOracleList(
	oracles: IOracle[],
	path: string[],
): CollectedOracle[] {
	const result: CollectedOracle[] = [];

	for (const oracle of oracles) {
		if (oracle.Table) {
			result.push(...processOracle(oracle, path));
		}

		if (oracle.Oracles) {
			result.push(
				...processOracleList(oracle.Oracles, [...path, oracle.Display.Title]),
			);
		}
	}

	return result;
}

/**
 * Recursively finds an oracle by ID in a list of oracles.
 */
function findInOracleList(oracles: IOracle[], id: string): IOracle | null {
	for (const oracle of oracles) {
		if (oracle.$id === id) {
			return oracle;
		}

		if (oracle.Oracles) {
			const found = findInOracleList(oracle.Oracles, id);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Recursively gets all rollable oracles from a list of oracles.
 */
function getRollableOraclesFromList(oracles: IOracle[]): IOracle[] {
	const result: IOracle[] = [];

	for (const oracle of oracles) {
		if (oracle.Table && oracle.Table.length > 0) {
			result.push(oracle);
		}

		if (oracle.Oracles) {
			result.push(...getRollableOraclesFromList(oracle.Oracles));
		}
	}

	return result;
}

/**
 * Recursively gets all rollable oracles from a category.
 */
function getRollableOraclesFromCategory(category: IOracleCategory): IOracle[] {
	const oracles: IOracle[] = [];

	if (category.Oracles) {
		for (const oracle of category.Oracles) {
			if (oracle.Table && oracle.Table.length > 0) {
				oracles.push(oracle);
			}

			if (oracle.Oracles) {
				oracles.push(...getRollableOraclesFromList(oracle.Oracles));
			}
		}
	}

	if (category.Categories) {
		for (const subcategory of category.Categories) {
			oracles.push(...getRollableOraclesFromCategory(subcategory));
		}
	}

	return oracles;
}
