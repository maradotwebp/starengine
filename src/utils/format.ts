import type { IOracle, IRow } from "dataforged";

/**
 * Format a response for an oracle roll as shown to the client.
 */
export function formatOracleRoll(
  oracle: IOracle,
  roll: number,
  result: IRow,
  nestedRolls: Array<{ oracle: IOracle; roll: number; result: IRow }> = []
): string {
  let response = `## 🔮 ${sanitizeResult(result.Result)}\n`;
  if (result.Summary) {
    response += `${result.Summary}\n`;
  }
  response += `-# \`→ ${roll}\` ◇ ${oracle.Display.Title}\n`;

  for (const nested of nestedRolls) {
    response += formatNestedOracleRoll(nested.oracle, nested.roll, nested.result);
  }

  return response;
}

/**
 * Format a response for a nested oracle roll as shown to the client.
 */
export function formatNestedOracleRoll(
  oracle: IOracle,
  roll: number,
  result: IRow,
  indentLevel: number = 0
): string {
  const indent = '  '.repeat(indentLevel);
  let response = `${indent}- **${oracle.Name}**: ${sanitizeResult(result.Result)}\n`;
  if (result.Summary) {
    response += `${indent}  -# ${result.Summary}\n`;
  }
  response += `${indent}  -# \`→ ${roll}\` ◇ ${oracle.Display.Title}\n`;
  return response;
}

/**
 * Sanitize a result string to remove the link to the oracle.
 * 
 * The dataforged library uses links to other oracles in the result string. This function removes those links.
 */
export function sanitizeResult(text: string): string {
  return text.replace(
    /\[(?:⏵)?([^\]]+)\]\([^\/]+\/([^\)]+)\)/g,
    "*$1*"
  );
}
