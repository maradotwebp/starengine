import type { UseOracleResult } from "./oracle";

/**
 * Format a response for an oracle roll as shown to the client.
 */
export function formatOracleRoll({ oracle, roll, result, nestedRolls }: UseOracleResult): string {
  let response = `## 🔮 ${sanitizeResult(result.Result)}\n`;
  if (result.Summary) {
    response += `${result.Summary}\n`;
  }
  response += `-# \`→ ${roll}\` ◇ ${oracle.Display.Title}\n`;

  if (nestedRolls) {
    for (const nested of nestedRolls) {
      response += formatNestedOracleRoll(nested);
    }
  }

  return response;
}

/**
 * Format a response for a nested oracle roll as shown to the client.
 */
export function formatNestedOracleRoll({ oracle, roll, result }: UseOracleResult, indentLevel: number = 0): string {
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
