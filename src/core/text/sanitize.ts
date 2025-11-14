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
