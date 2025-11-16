/**
 * Sanitize a string to remove links to other items.
 *
 * The dataforged library uses links to other items in the string. This function removes those links.
 *
 * @example
 * const sanitized = removeLinks("[Action](Starforged/Oracles/Action)");
 * console.log(sanitized); // "*Action*"
 */
export function removeLinks(text: string): string {
	return text.replace(/\[(?:⏵)?([^\]]+)\]\([^/]+\/([^)]+)\)/g, "*$1*");
}

/**
 * Remove markdown tables from text, as they are handled via the Oracles property.
 *
 * @example
 * const formatted = removeTables("Roll | Result\n---|----\n1-4 | Test");
 */
export function removeTables(text: string): string {
	return text.replace(/^.*\|.*\n[\s\-|:]+\n(?:.*\|.*\n?)*/gm, "");
}
