import type { RollResult } from "./oracle";

/**
 * Format a response for an oracle roll to be shown to the client.
 */
export function formatOracleRoll({
	item,
	roll,
	result,
	nestedRolls,
}: RollResult): string {
	let response = `## 🔮 ${sanitizeResult(result.Result)}\n`;
	if (result.Summary) {
		response += `${result.Summary}\n`;
	}
	response += `-# \`→ ${roll}\` ◇ ${item.Display.Title}\n`;

	if (nestedRolls) {
		for (const nested of nestedRolls) {
			response += formatOracleRollAsList(nested);
		}
	}

	return response;
}

/**
 * Format a response for a oracle roll as a list to be shown to the client.
 */
export function formatOracleRollAsList(
	{ item, roll, result, nestedRolls }: RollResult,
	indentLevel: number = 0,
): string {
	const indent = "  ".repeat(indentLevel);
	let response = `${indent}- **${item.Name}**: ${sanitizeResult(result.Result)}\n`;
	if (result.Summary) {
		response += `${indent}  -# ${result.Summary}\n`;
	}
	response += `${indent}  -# \`→ ${roll}\` ◇ ${item.Display.Title}\n`;

	if (nestedRolls) {
		for (const nested of nestedRolls) {
			response += formatOracleRollAsList(nested, indentLevel + 1);
		}
	}

	return response;
}

/**
 * Sanitize a result string to remove the link to the oracle.
 *
 * The dataforged library uses links to other oracles in the result string. This function removes those links.
 */
export function sanitizeResult(text: string): string {
	return text.replace(/\[(?:⏵)?([^\]]+)\]\([^/]+\/([^)]+)\)/g, "*$1*");
}
