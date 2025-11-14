import type { IOracle } from "dataforged";
import { randomInt } from "@/core/random";
import { getRow } from "@/core/rows";
import { sanitizeText } from "@/core/text/sanitize";
import { OracleCategory } from "./oracle-category";
import { OracleListItem } from "./oracle-list-item";
import { OracleUsage } from "./oracle-usage";
import { Source } from "./source";

export interface OracleProps {
	oracle: IOracle;
	/**
	 * The exact value rolled.
	 *
	 * @default randomInt(1, 100)
	 */
	value: number | undefined;
}

export function Oracle({
	oracle,
	value = randomInt(1, 100),
}: OracleProps): string {
	if (oracle.Table) {
		const result = getRow(oracle.Table, value);
		if (!result) throw new Error(`No result found for value ${value}`);

		return [
			`## 🔮 ${sanitizeText(result.Result)}`,
			result.Summary ? sanitizeText(result.Summary) : undefined,
			Source({
				result: `${value}`,
				source: `${oracle.Name} ${OracleUsage(oracle.Usage)}`,
			}),
		]
			.filter((line) => line !== undefined)
			.join("\n");
	} else {
		return [
			...(oracle.Oracles ?? []).map((o) =>
				OracleListItem({ oracle: o, value: undefined, indent: 1 }),
			),
			...(oracle.Categories ?? []).map((c) =>
				OracleCategory({ category: c, indent: 1 }),
			),
			`-# ◇ ${oracle.Display.Title} ${OracleUsage(oracle.Usage)}`,
		].join("\n");
	}
}
