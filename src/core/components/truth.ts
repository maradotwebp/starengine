import type { ISettingTruth, ISettingTruthOption } from "dataforged";
import { TruthTable } from "./truth-table";

export interface TruthProps {
	truth: ISettingTruth;
	/**
	 * The content of this truth.
	 *
	 * Often one particular option of the truth, but is completely user customizable and may be any string.
	 *
	 * @default "*No Option selected yet.*"
	 */
	content?: ISettingTruthOption | string;
}

/**
 * Format truth content as markdown string.
 *
 * @example
 * const content = Truth({ truth, content: "*No Option selected yet.*" });
 * // Returns: "## Truth Title\n*No Option selected yet.*\n-# > Character quote"
 */
export function Truth({
	truth,
	content = "*No Option selected yet.*",
}: TruthProps): string {
	return [
		`## ${truth.Display.Title}`,
		...(isSettingTruthOption(content)
			? [
					content.Description,
					content.Subtable
						? TruthTable({
								rows: content.Subtable,
								value: undefined,
							})
						: "",
				]
			: [content]),
		`-# > ${truth.Character}`,
	].join("\n");
}

export function isSettingTruthOption(
	value: unknown,
): value is ISettingTruthOption {
	return typeof value === "object" && value !== null;
}
