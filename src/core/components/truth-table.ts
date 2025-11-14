import type { IRow } from "dataforged";
import { randomInt } from "@/core/random";
import { getRow } from "@/core/rows";

export interface TruthTableProps {
	rows: IRow[];
	/**
	 * The exact value rolled.
	 *
	 * @default randomInt(1, 100)
	 */
	value: number | undefined;
}

export function TruthTable({
	rows,
	value = randomInt(1, 100),
}: TruthTableProps): string | null {
	const row = getRow(rows, value);
	if (!row) throw new Error("No row found");

	return [
		`- **${row.Result}**`,
		row.Summary ?? undefined,
		`  -# \`→ ${value}\` ◇ ${row.Display?.Title ?? "Truth"}`,
	]
		.filter((l) => l !== undefined)
		.join("\n");
}
