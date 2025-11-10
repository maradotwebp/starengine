import type { IOracleUsage } from "dataforged";
import type { RollResult } from "./oracle";

/**
 * Format a response for an oracle roll to be shown to the client.
 *
 * @example
 * const result = rollItem(item, starforged["Oracle Categories"]);
 * const formatted = formatOracleRoll(result);
 * console.log(formatted);
 */
export function formatOracleRoll({
	item,
	roll,
	result,
	nestedRolls,
}: RollResult): string {
	if (!roll || !result) {
		let response = "";
		if (nestedRolls) {
			for (const nested of nestedRolls) {
				response += formatOracleRollAsList(nested);
			}
		}
		return response;
	}

	let response = `## 🔮 ${sanitizeResult(result.Result)}\n`;
	if (result.Summary) {
		response += `${result.Summary}\n`;
	}
	response += `-# \`→ ${roll}\` ◇ ${item.Display.Title} ${formatUsage(item.Usage)}\n`;

	if (nestedRolls) {
		for (const nested of nestedRolls) {
			response += formatOracleRollAsList(nested);
		}
	}

	return response;
}

/**
 * Format a response for a oracle roll as a list to be shown to the client.
 *
 * @example
 * const result = rollItem(item, starforged["Oracle Categories"]);
 * const formatted = formatOracleRollAsList(result, 0);
 * console.log(formatted);
 */
export function formatOracleRollAsList(
	{ item, roll, result, nestedRolls }: RollResult,
	indentLevel: number = 0,
	root: boolean = true,
): string {
	const indent = "  ".repeat(indentLevel);

	if (!roll || !result) {
		if (root) {
			let response = "";
			if (nestedRolls) {
				for (const nested of nestedRolls) {
					response += formatOracleRollAsList(nested, 0, false);
				}
			}
			response += `-# ◇ ${item.Display.Title} ${formatUsage(item.Usage)}\n`;
			return response;
		} else {
			let response = `${indent}- *${item.Display.Title}*\n`;
			if (nestedRolls) {
				for (const nested of nestedRolls) {
					response += formatOracleRollAsList(nested, indentLevel + 1, false);
				}
			}
			return response;
		}
	}

	let response = `${indent}- **${item.Name}**: ${sanitizeResult(result.Result)}\n`;
	if (result.Summary) {
		response += `${indent}  -# ${result.Summary}\n`;
	}
	response += `${indent}  -# \`→ ${roll}\` ◇ ${item.Display.Title} ${formatUsage(item.Usage)}\n`;

	if (nestedRolls) {
		for (const nested of nestedRolls) {
			response += formatOracleRollAsList(nested, indentLevel + 1, false);
		}
	}

	return response;
}

/**
 * Sanitize a result string to remove the link to the oracle.
 *
 * The dataforged library uses links to other oracles in the result string. This function removes those links.
 *
 * @example
 * const sanitized = sanitizeResult("[Action](Starforged/Oracles/Action)");
 * console.log(sanitized); // "*Action*"
 */
export function sanitizeResult(text: string): string {
	return text.replace(/\[(?:⏵)?([^\]]+)\]\([^/]+\/([^)]+)\)/g, "*$1*");
}

function formatUsage(usage: IOracleUsage|undefined): string {
	const maxRolls = usage?.["Max rolls"];
	return maxRolls ? `**(🗘 1 - ${maxRolls})**` : "";
}
