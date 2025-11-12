import type { IMove, IOracleUsage } from "dataforged";
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

	let response = `## 🔮 ${sanitizeText(result.Result)}\n`;
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

	let response = `${indent}- **${item.Name}**: ${sanitizeText(result.Result)}\n`;
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

function formatUsage(usage: IOracleUsage | undefined): string {
	const maxRolls = usage?.["Max rolls"];
	return maxRolls ? `**(🗘 1 - ${maxRolls})**` : "";
}

/**
 * Format a move for display in Discord.
 *
 * @example
 * const formatted = formatMove(move);
 * // Returns markdown formatted string with title and description
 */
export function formatMove(move: IMove): string {
	const text = move.Text
		? removeTables(sanitizeText(move.Text.replaceAll("\n\n", "\n")))
		: "";
	return [`## ${move.Display.Title}`, text ? `\n${text}` : ""].join("\n");
}

/**
 * Remove markdown tables from text, as they are handled via the Oracles property.
 *
 * @example
 * const formatted = removeTables("Roll | Result\n---|----\n1-4 | Test");
 * // Returns text with tables removed
 */
function removeTables(text: string): string {
	const lines = text.split("\n");
	const result: string[] = [];
	let i = 0;

	while (i < lines.length) {
		const currentLine = lines[i];
		if (!currentLine) {
			i++;
			continue;
		}

		// Check if this line looks like a table header (contains |)
		if (currentLine.includes("|")) {
			// Check if next line is a separator (contains - and |)
			const nextLine = lines[i + 1];
			if (nextLine?.includes("|") && nextLine.match(/^[\s\-|:]+$/)) {
				i += 2; // Skip header and separator

				// Skip all table rows
				while (i < lines.length) {
					const rowLine = lines[i];
					if (!rowLine || !rowLine.includes("|")) {
						break;
					}
					i++;
				}

				// Skip the table entirely (don't add it to result)
				continue;
			}
		}

		result.push(currentLine);
		i++;
	}

	return result.join("\n");
}

/**
 * Sanitize a string to remove links to other items.
 *
 * The dataforged library uses links to other items in the string. This function removes those links.
 *
 * @example
 * const sanitized = sanitizeResult("[Action](Starforged/Oracles/Action)");
 * console.log(sanitized); // "*Action*"
 */
export function sanitizeText(text: string): string {
	return text.replace(/\[(?:⏵)?([^\]]+)\]\([^/]+\/([^)]+)\)/g, "*$1*");
}
