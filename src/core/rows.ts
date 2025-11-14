import type { IRow } from "dataforged";

/**
 * Returns the row of oracle `rows` that matches the given `result`.
 */
export function getRow(rows: IRow[], result: number): IRow | null {
	const index = getRowIndex(rows, result);
	return index === null ? null : (rows[index] ?? null);
}

/**
 * Returns the index of the row of oracle `rows` that matches the given `result`.
 */
export function getRowIndex(rows: IRow[], result: number): number | null {
	const index = rows.findIndex((row) => {
		return (row?.Floor ?? 1) <= result && (row?.Ceiling ?? 100) >= result;
	});
	return index === -1 ? null : index;
}

/**
 * Returns the previous row of oracle `rows` that matches the given `result`.
 */
export function getPrevious(rows: IRow[], result: number): IRow | null {
	const index = getRowIndex(rows, result);
	return index === null ? null : (rows[index - 1] ?? null);
}

/**
 * Returns true if the given `result` is the first row of oracle `rows`.
 */
export function hasPrevious(rows: IRow[], result: number): boolean {
	return getPrevious(rows, result) !== null;
}

/**
 * Returns the next row of oracle `rows` that matches the given `result`.
 */
export function getNext(rows: IRow[], result: number): IRow | null {
	const index = getRowIndex(rows, result);
	return index === null ? null : (rows[index + 1] ?? null);
}

/**
 * Returns true if the given `result` is the last row of oracle `rows`.
 */
export function hasNext(rows: IRow[], result: number): boolean {
	return getNext(rows, result) !== null;
}
