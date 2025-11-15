import { type IMove, type IMoveCategory, starforged } from "dataforged";

/**
 * Returns the move with the given ID.
 */
export function findMove(id: string): IMove | undefined;
/**
 * Returns the move with the given ID.
 *
 * This should only be used internally.
 */
export function findMove(
	id: string,
	categories: IMoveCategory[],
): IMove | undefined;
export function findMove(
	id: string,
	categories: IMoveCategory[] = starforged["Move Categories"],
): IMove | undefined {
	for (const category of categories) {
		if (!category.Moves) continue;

		for (const move of category.Moves) {
			if (move.$id === id) {
				return move;
			}
		}
	}

	return undefined;
}

export interface MoveAutocomplete {
	id: string;
	category: string;
	name: string;
	move: IMove;
}

/**
 * Returns a list of autocomplete options for moves.
 */
export function collectMoveAutocomplete(): MoveAutocomplete[];
/**
 * Returns a list of autocomplete options for moves.
 *
 * This should only be used internally.
 */
export function collectMoveAutocomplete(
	categories: IMoveCategory[],
): MoveAutocomplete[];
export function collectMoveAutocomplete(
	categories: IMoveCategory[] = starforged["Move Categories"],
): MoveAutocomplete[] {
	const result: MoveAutocomplete[] = [];

	for (const category of categories) {
		if (!category.Moves) continue;

		for (const move of category.Moves) {
			result.push({
				id: move.$id,
				category: category.Name,
				name: move.Name,
				move,
			});
		}
	}

	return result;
}
