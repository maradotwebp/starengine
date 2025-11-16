import { describe, expect, test } from "bun:test";
import { removeLinks, removeTables } from "./sanitize";

describe("sanitize", () => {
	describe("removeLinks", () => {
		test("handles text with no links", () => {
			const input = "This is plain text without any links";
			expect(removeLinks(input)).toBe(input);
		});

		test("converts simple link to italics", () => {
			const input = "[Action](Starforged/Oracles/Action)";
			const expected = "*Action*";
			expect(removeLinks(input)).toBe(expected);
		});

		test("converts link with arrow prefix to italics", () => {
			const input = "[⏵Theme](Starforged/Oracles/Theme)";
			const expected = "*Theme*";
			expect(removeLinks(input)).toBe(expected);
		});

		test("handles multiple links in text", () => {
			const input =
				"Roll [Action](Starforged/Oracles/Action) and [Theme](Starforged/Oracles/Theme)";
			const expected = "Roll *Action* and *Theme*";
			expect(removeLinks(input)).toBe(expected);
		});

		test("handles empty string", () => {
			const input = "";
			expect(removeLinks(input)).toBe("");
		});
	});

	describe("removeTables", () => {
		test("removes simple markdown table", () => {
			const input = "Roll | Result\n---|----\n1-4 | Test\n5-10 | Another";
			const expected = "";
			expect(removeTables(input)).toBe(expected);
		});

		test("preserves text before and after table", () => {
			const input = "Before\nRoll | Result\n---|----\n1-4 | Test\nAfter";
			const expected = "Before\nAfter";
			expect(removeTables(input)).toBe(expected);
		});

		test("removes multiple tables", () => {
			const input =
				"Text\nA | B\n---|---\n1 | 2\nMiddle\nC | D\n---|---\n3 | 4\nEnd";
			const expected = "Text\nMiddle\nEnd";
			expect(removeTables(input)).toBe(expected);
		});

		test("handles text with no tables", () => {
			const input = "This is plain text\nWith multiple lines\nNo tables here";
			expect(removeTables(input)).toBe(input);
		});

		test("handles empty string", () => {
			const input = "";
			expect(removeTables(input)).toBe("");
		});
	});
});
