import type { IOracle } from "dataforged";
import { randomInt } from "@/core/random";
import { getRow } from "@/core/rows";
import { removeLinks } from "@/core/sanitize";
import { OracleCategory } from "./oracle-category";
import { OracleUsage } from "./oracle-usage";
import { Source } from "./source";

export interface OracleListItemProps {
	oracle: IOracle;
	/**
	 * The exact value rolled.
	 *
	 * @default randomInt(1, 100)
	 */
	value: number | undefined;
	/**
	 * Indent of this list item.
	 * @default 0
	 */
	indent?: number;
}

export function OracleListItem({
	oracle,
	value = randomInt(1, 100),
	indent = 0,
}: OracleListItemProps): string {
	if (oracle.Table) {
		const result = getRow(oracle.Table, value);
		if (!result) throw new Error(`No result found for value ${value}`);

		return [
			`- **${oracle.Display.Title ?? oracle.Name}**: ${removeLinks(result.Result)}`,
			result.Summary ? `  -# ${result.Summary}` : undefined,
			`  ${Source({
				result: `${value ?? result.Floor}`,
				source: `${oracle.Name} ${OracleUsage(oracle.Usage)}`,
			})}`,
		]
			.filter((line) => line !== undefined)
			.map((item) => `${"  ".repeat(indent)}${item}`)
			.join("\n");
	} else {
		return [
			`${"  ".repeat(indent)}- ${oracle.Display.Title} ${OracleUsage(oracle.Usage)}`,
			...(oracle.Oracles ?? []).map((o) =>
				OracleListItem({ oracle: o, value: undefined, indent: indent + 1 }),
			),
			...(oracle.Categories ?? []).map((c) =>
				OracleCategory({ category: c, indent: indent + 1 }),
			),
		].join("\n");
	}
}
