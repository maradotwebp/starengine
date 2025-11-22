import type { IMove } from "dataforged";
import { removeLinks, removeTables } from "@/core/sanitize";

export interface MoveProps {
	move: IMove;
}

export function Move({ move }: MoveProps): string {
	const text = move.Text
		? removeTables(removeLinks(move.Text.replaceAll("\n\n", "\n")))
		: "";
	return [`## ${move.Display.Title}`, text ? `\n${text}` : ""].join("\n");
}
