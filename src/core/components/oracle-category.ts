import type { IOracleCategory } from "dataforged";
import { OracleListItem } from "./oracle-list-item";
import { OracleUsage } from "./oracle-usage";

export interface OracleCategoryProps {
	category: IOracleCategory;
	/**
	 * Indent of this list item.
	 * @default 0
	 */
	indent?: number;
}

export function OracleCategory({
	category,
	indent = 0,
}: OracleCategoryProps): string {
	if (indent === 0) {
		return [
			...(category.Oracles ?? []).map((o) =>
				OracleListItem({ oracle: o, value: undefined, indent }),
			),
			...(category.Categories ?? []).map((c) =>
				OracleCategory({ category: c, indent }),
			),
			`-# ◇ ${category.Display.Title} ${OracleUsage(category.Usage)}`,
		].join("\n");
	} else {
		return [
			`${"  ".repeat(indent)}- ${category.Display.Title} ${OracleUsage(category.Usage)}`,
			...(category.Oracles ?? []).map((o) =>
				OracleListItem({ oracle: o, value: undefined, indent: indent + 1 }),
			),
			...(category.Categories ?? []).map((c) =>
				OracleCategory({ category: c, indent: indent + 1 }),
			),
		].join("\n");
	}
}
