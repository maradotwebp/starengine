import type { IOracle, IOracleCategory, IRow } from "dataforged";

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
 *
 * For items with tables: roll and result are present.
 * For container items (categories/oracles without tables): roll and result are undefined, only nestedRolls present.
 */
export interface RollResult {
	item: RollableItem;
	roll?: number;
	result?: IRow;
	nestedRolls?: Array<RollResult>;
}

/**
 * Minimum value for dice rolls.
 */
const DICE_MIN = 1;

/**
 * Maximum value for dice rolls.
 */
const DICE_MAX = 100;

/**
 * Checks if an item is rollable (has a table or rollable children).
 *
 * @example
 * const item = findRollableItemById(starforged["Oracle Categories"], "Starforged/Oracles/Characters/Revealed_Aspect");
 * if (isRollable(item)) {
 *   console.log("This item can be rolled");
 * }
 */
export function isRollable(item: RollableItem): boolean {
	if ("Table" in item && item.Table && item.Table.length > 0) {
		return true;
	}

	if ("Oracles" in item && item.Oracles && item.Oracles.length > 0) {
		return item.Oracles.some(isRollable);
	}

	if ("Categories" in item && item.Categories && item.Categories.length > 0) {
		return item.Categories.some(isRollable);
	}

	return false;
}

// ============================================================================
// Collection Functions
// ============================================================================

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

		if (isRollable(category)) {
			items.push({
				name: category.Display.Title,
				path: [...path],
				id: category.$id,
			});
		}

		if (category.Oracles) {
			for (const oracle of category.Oracles) {
				items.push(...collectFromOracle(oracle, currentPath));
			}
		}

		if (category.Categories) {
			items.push(...collectRollableItems(category.Categories, currentPath));
		}
	}

	return items;
}

// ============================================================================
// Search Functions
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
		if (category.$id === id) {
			return category;
		}

		if (category.Oracles) {
			for (const oracle of category.Oracles) {
				const found = findInOracleTree(oracle, id);
				if (found) return found;
			}
		}

		if (category.Categories) {
			const found = findRollableItemById(category.Categories, id);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Find the row index for a given roll value in a rollable item with a table.
 *
 * @example
 * const item = findRollableItemById(starforged["Oracle Categories"], "Starforged/Oracles/Characters/Revealed_Aspect");
 * const rowIndex = findRowIndexByRoll(item, 42);
 * console.log(`Roll 42 corresponds to row ${rowIndex}`);
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

// ============================================================================
// Rolling Functions
// ============================================================================

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

	const nestedRolls: RollResult[] = [];

	if ("Oracles" in item && item.Oracles) {
		for (const oracle of item.Oracles) {
			if (isRollable(oracle)) {
				const result = rollItem(oracle, categories);
				if (Array.isArray(result)) {
					nestedRolls.push(...result);
				} else {
					nestedRolls.push(result);
				}
			}
		}
	}

	if ("Categories" in item && item.Categories) {
		for (const category of item.Categories) {
			if (isRollable(category)) {
				const result = rollItem(category, categories);
				if (Array.isArray(result)) {
					nestedRolls.push(...result);
				} else {
					nestedRolls.push(result);
				}
			}
		}
	}

	return [
		{
			item,
			nestedRolls,
		},
	];
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

// ============================================================================
// Internal Functions
// ============================================================================

/**
 * Helper to collect rollable items from an oracle and its children.
 */
function collectFromOracle(
	oracle: IOracle,
	path: string[],
): CollectedRollableItem[] {
	const items: CollectedRollableItem[] = [];

	if (isRollable(oracle)) {
		items.push({
			name: oracle.Display.Title,
			path: [...path],
			id: oracle.$id,
		});

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

	if (oracle.Oracles) {
		for (const subOracle of oracle.Oracles) {
			items.push(
				...collectFromOracle(subOracle, [...path, oracle.Display.Title]),
			);
		}
	}

	return items;
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
