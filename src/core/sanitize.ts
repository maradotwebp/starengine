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
 * // Returns text with tables removed
 */
export function removeTables(text: string): string {
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
