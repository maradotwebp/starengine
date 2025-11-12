import type { IMove, IMoveCategory } from "dataforged";

/**
 * Represents a move.
 */
export interface CollectedMove {
	move: IMove;
	category: string;
	id: string;
	name: string;
}

/**
 * Collect all moves from move categories into a flat list.
 *
 * @example
 * const moves = collectMoves(starforged["Move Categories"]);
 * console.log(moves.length); // Total number of moves
 */
export function collectMoves(categories: IMoveCategory[]): CollectedMove[] {
	const moves: CollectedMove[] = [];

	for (const category of categories) {
		if (!category.Moves) continue;

		for (const move of category.Moves) {
			moves.push({
				move,
				category: category.Name,
				id: move.$id,
				name: move.Name,
			});
		}
	}

	return moves;
}

/**
 * Find a move by its ID.
 *
 * @example
 * const move = findMoveById(starforged["Move Categories"], "Starforged/Moves/Adventure/Face_Danger");
 */
export function findMoveById(
	categories: IMoveCategory[],
	id: string,
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
