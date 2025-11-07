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
	// Container result (oracle/category without table)
	if (!roll || !result) {
		let response = '';
		if (nestedRolls) {
			for (const nested of nestedRolls) {
				response += formatOracleRollAsList(nested);
			}
		}
		return response;
	}

	// Normal table roll
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
	root: boolean = true,
): string {
	const indent = "  ".repeat(indentLevel);
	
	// Container result (oracle/category without table) - only show nested rolls with label
	if (!roll || !result) {
		if(root) {
			let response = '';
			if (nestedRolls) {
				for (const nested of nestedRolls) {
					response += formatOracleRollAsList(nested, 0, false);
				}
			}
			response += `-# ◇ ${item.Display.Title}\n`;
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

	// Normal table roll
	let response = `${indent}- **${item.Name}**: ${sanitizeResult(result.Result)}\n`;
	if (result.Summary) {
		response += `${indent}  -# ${result.Summary}\n`;
	}
	response += `${indent}  -# \`→ ${roll}\` ◇ ${item.Display.Title}\n`;

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
 */
export function sanitizeResult(text: string): string {
	return text.replace(/\[(?:⏵)?([^\]]+)\]\([^/]+\/([^)]+)\)/g, "*$1*");
}
