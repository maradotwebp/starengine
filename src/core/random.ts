import type { IRow } from "dataforged";

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
