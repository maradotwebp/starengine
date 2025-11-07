import type { IOracle, IOracleCategory, IRow } from "dataforged";

// Constants
const DICE_MIN = 1;
const DICE_MAX = 100;

// Types
/**
 * A rollable item can be either an oracle with a table, or a category/oracle with sub-oracles.
 */
export type RollableItem = IOracle | IOracleCategory;

/**
 * Collected rollable item for autocomplete.
 */
export interface CollectedRollableItem {
	name: string;
	path: string[];
	id: string;
}

/**
 * Result from rolling a rollable item.
 */
export interface RollResult {
	item: RollableItem;
	roll: number;
	result: IRow;
	nestedRolls?: Array<RollResult>;
}

// ============================================================================
// Public API - Collection Functions
// ============================================================================

/**
 * Checks if an item is rollable (has a table or rollable children).
 */
function isRollable(item: RollableItem): boolean {
	// Has a table
	if ("Table" in item && item.Table && item.Table.length > 0) {
		return true;
	}

	// Has rollable oracles
	if ("Oracles" in item && item.Oracles && item.Oracles.length > 0) {
		return item.Oracles.some(isRollable);
	}

	// Has rollable categories
	if ("Categories" in item && item.Categories && item.Categories.length > 0) {
		return item.Categories.some(isRollable);
	}

	return false;
}

/**
 * Collect all rollable items (oracles and categories) for autocomplete.
 *
 * @example
 * const items = collectRollableItems(starforged["Oracle Categories"]);
 * console.log(items);
 */
export function collectRollableItems(
	categories: IOracleCategory[],
	path: string[] = [],
): CollectedRollableItem[] {
	const items: CollectedRollableItem[] = [];

	for (const category of categories) {
		const currentPath = [...path, category.Display.Title];

		// Process the category itself if it's rollable
		if (isRollable(category)) {
			items.push({
				name: category.Display.Title,
				path: [...path],
				id: category.$id,
			});
		}

		// Process oracles in this category
		if (category.Oracles) {
			for (const oracle of category.Oracles) {
				items.push(...collectFromOracle(oracle, currentPath));
			}
		}

		// Recurse into subcategories
		if (category.Categories) {
			items.push(...collectRollableItems(category.Categories, currentPath));
		}
	}

	return items;
}

/**
 * Helper to collect rollable items from an oracle and its children.
 */
function collectFromOracle(
	oracle: IOracle,
	path: string[],
): CollectedRollableItem[] {
	const items: CollectedRollableItem[] = [];

	// Add this oracle if it's rollable
	if (isRollable(oracle)) {
		items.push({
			name: oracle.Display.Title,
			path: [...path],
			id: oracle.$id,
		});

		// Add aliases
		if (oracle.Aliases) {
			for (const alias of oracle.Aliases) {
				items.push({
					name: alias,
					path: [...path],
					id: oracle.$id,
				});
			}
		}
	}

	// Recurse into sub-oracles
	if (oracle.Oracles) {
		for (const subOracle of oracle.Oracles) {
			items.push(
				...collectFromOracle(subOracle, [...path, oracle.Display.Title]),
			);
		}
	}

	return items;
}

// ============================================================================
// Public API - Search Functions
// ============================================================================

/**
 * Find a rollable item (oracle or category) by its ID.
 *
 * @example
 * const item = findRollableItemById(starforged["Oracle Categories"], "Starforged/Oracles/Characters/Revealed_Aspect");
 * console.log(item);
 */
export function findRollableItemById(
	categories: IOracleCategory[],
	id: string,
): RollableItem | null {
	for (const category of categories) {
		// Check if this category matches
		if (category.$id === id) {
			return category;
		}

		// Check oracles in this category
		if (category.Oracles) {
			for (const oracle of category.Oracles) {
				const found = findInOracleTree(oracle, id);
				if (found) return found;
			}
		}

		// Recurse into subcategories
		if (category.Categories) {
			const found = findRollableItemById(category.Categories, id);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Helper to find an item in an oracle tree.
 */
function findInOracleTree(oracle: IOracle, id: string): IOracle | null {
	if (oracle.$id === id) {
		return oracle;
	}

	if (oracle.Oracles) {
		for (const subOracle of oracle.Oracles) {
			const found = findInOracleTree(subOracle, id);
			if (found) return found;
		}
	}

	return null;
}

// ============================================================================
// Public API - Rolling Functions
// ============================================================================

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
): RollResult[] | undefined {
	if (!row["Oracle rolls"]) {
		return undefined;
	}

	const nestedRolls: RollResult[] = [];
	for (const oracleId of row["Oracle rolls"]) {
		const nestedItem = findRollableItemById(categories, oracleId);
		if (nestedItem) {
			const result = rollItem(nestedItem, categories);
			if (Array.isArray(result)) {
				nestedRolls.push(...result);
			} else {
				nestedRolls.push(result);
			}
		}
	}

	return nestedRolls.length > 0 ? nestedRolls : undefined;
}

/**
 * Gets all rollable oracles from an item (category or oracle with sub-oracles).
 */
function getAllRollableOracles(item: RollableItem): IOracle[] {
	const oracles: IOracle[] = [];

	// If it's an oracle with a table, return it
	if ("Table" in item && item.Table && item.Table.length > 0) {
		return [item as IOracle];
	}

	// Collect from oracles
	if ("Oracles" in item && item.Oracles) {
		for (const oracle of item.Oracles) {
			oracles.push(...getAllRollableOracles(oracle));
		}
	}

	// Collect from categories
	if ("Categories" in item && item.Categories) {
		for (const category of item.Categories) {
			oracles.push(...getAllRollableOracles(category));
		}
	}

	return oracles;
}

/**
 * Roll on a rollable item (oracle or category).
 * Returns a single result if the item has a table, or multiple results if it contains sub-oracles.
 *
 * @example
 * const result = rollItem(item, starforged["Oracle Categories"]);
 * if (Array.isArray(result)) {
 *   // Multiple rolls from a category
 *   console.log(result);
 * } else {
 *   // Single roll from an oracle
 *   console.log(result);
 * }
 */
export function rollItem(
	item: RollableItem,
	categories: IOracleCategory[],
): RollResult | RollResult[] {
	// If it has a table, roll on it
	if ("Table" in item && item.Table && item.Table.length > 0) {
		const roll = rollDice();
		const result = findRowByRoll(item.Table, roll);
		const nestedRolls = processNestedRolls(result, categories);

		return {
			item,
			roll,
			result,
			nestedRolls,
		};
	}

	// Otherwise, roll on all sub-oracles
	const oracles = getAllRollableOracles(item);
	const results: RollResult[] = [];

	for (const oracle of oracles) {
		const result = rollItem(oracle, categories);
		if (Array.isArray(result)) {
			results.push(...result);
		} else {
			results.push(result);
		}
	}

	return results;
}

/**
 * Roll on a rollable item at a specific row index.
 * Only works for items with a table.
 *
 * @example
 * const result = rollItemAtRow(item, 5, starforged["Oracle Categories"]);
 * console.log(result);
 */
export function rollItemAtRow(
	item: RollableItem,
	rowIndex: number,
	categories: IOracleCategory[],
): RollResult {
	if (!("Table" in item) || !item.Table || item.Table.length === 0) {
		throw new Error("This item doesn't have a rollable table.");
	}

	if (rowIndex < 0 || rowIndex >= item.Table.length) {
		throw new Error("Row index out of bounds.");
	}

	const row = item.Table[rowIndex] as IRow;
	const roll = row.Floor ?? DICE_MIN;
	const nestedRolls = processNestedRolls(row, categories);

	return {
		item,
		roll,
		result: row,
		nestedRolls,
	};
}

/**
 * Find the row index for a given roll value in a rollable item with a table.
 */
export function findRowIndexByRoll(item: RollableItem, roll: number): number {
	if (!("Table" in item) || !item.Table || item.Table.length === 0) {
		throw new Error("This item doesn't have a rollable table.");
	}

	for (let i = 0; i < item.Table.length; i++) {
		const row = item.Table[i] as IRow;
		const floor = row.Floor ?? DICE_MIN;
		const ceiling = row.Ceiling ?? DICE_MAX;

		if (roll >= floor && roll <= ceiling) {
			return i;
		}
	}

	throw new Error("Could not find a matching row for the roll.");
}
