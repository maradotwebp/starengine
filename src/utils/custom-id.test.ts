import { describe, expect, test } from "bun:test";
import type { CustomIdSchema } from "./custom-id";
import { decodeCustomId, encodeCustomId } from "./custom-id";

describe("custom-id", () => {
	describe("encode/decode", () => {
		test("simple string parameter", () => {
			const schema: CustomIdSchema<string, [string]> = {
				name: "test",
				encode: (params) => [params],
				decode: (parts) => parts[0],
			};

			const original = "hello";
			const encoded = encodeCustomId(schema, original);
			const decoded = decodeCustomId(schema, encoded);
			expect(decoded).toBe(original);
		});

		test("multiple parameters", () => {
			const schema: CustomIdSchema<{ a: string; b: string }, [string, string]> =
				{
					name: "multi",
					encode: (params) => [params.a, params.b],
					decode: (parts) => ({ a: parts[0], b: parts[1] }),
				};

			const original = { a: "foo", b: "bar" };
			const encoded = encodeCustomId(schema, original);
			const decoded = decodeCustomId(schema, encoded);
			expect(decoded).toEqual(original);
		});

		test("empty string", () => {
			const schema: CustomIdSchema<string, [string]> = {
				name: "empty",
				encode: (params) => [params],
				decode: (parts) => parts[0],
			};

			const original = "";
			const encoded = encodeCustomId(schema, original);
			const decoded = decodeCustomId(schema, encoded);
			expect(decoded).toBe(original);
		});

		test("special characters (colons)", () => {
			const schema: CustomIdSchema<string, [string]> = {
				name: "special",
				encode: (params) => [params],
				decode: (parts) => parts[0],
			};

			const original = "hello:world:test";
			const encoded = encodeCustomId(schema, original);
			const decoded = decodeCustomId(schema, encoded);
			expect(decoded).toBe(original);
		});

		test("unicode characters", () => {
			const schema: CustomIdSchema<string, [string]> = {
				name: "unicode",
				encode: (params) => [params],
				decode: (parts) => parts[0],
			};

			const original = "🚀 hello 世界";
			const encoded = encodeCustomId(schema, original);
			const decoded = decodeCustomId(schema, encoded);
			expect(decoded).toBe(original);
		});

		test("complex object with multiple types", () => {
			type Params = { userId: string; action: string; timestamp: number };
			const schema: CustomIdSchema<Params, [string, string, string]> = {
				name: "complex",
				encode: (params) => [
					params.userId,
					params.action,
					params.timestamp.toString(),
				],
				decode: (parts) => ({
					userId: parts[0],
					action: parts[1],
					timestamp: Number.parseInt(parts[2], 10),
				}),
			};

			const original: Params = {
				userId: "123456789",
				action: "edit",
				timestamp: 1234567890,
			};

			const encoded = encodeCustomId(schema, original);
			const decoded = decodeCustomId(schema, encoded);

			expect(decoded).toEqual(original);
		});

		test("array of strings", () => {
			const schema: CustomIdSchema<string[], string[]> = {
				name: "array",
				encode: (params) => params,
				decode: (parts) => parts,
			};

			const original = ["a", "b", "c", "d"];
			const encoded = encodeCustomId(schema, original);
			const decoded = decodeCustomId(schema, encoded);

			expect(decoded).toEqual(original);
		});
	});

	describe("error handling", () => {
		test("throws error for invalid schema name", () => {
			const schema: CustomIdSchema<string, [string]> = {
				name: "test",
				encode: (params) => [params],
				decode: (parts) => parts[0],
			};

			const invalidId = "wrong:data";
			expect(() => decodeCustomId(schema, invalidId)).toThrow(
				"Invalid custom ID",
			);
		});

		test("throws error for missing data", () => {
			const schema: CustomIdSchema<string, [string]> = {
				name: "test",
				encode: (params) => [params],
				decode: (parts) => parts[0],
			};

			const invalidId = "test";
			expect(() => decodeCustomId(schema, invalidId)).toThrow("Invalid data");
		});

		test("throws error for empty custom ID", () => {
			const schema: CustomIdSchema<string, [string]> = {
				name: "test",
				encode: (params) => [params],
				decode: (parts) => parts[0],
			};

			expect(() => decodeCustomId(schema, "")).toThrow("Invalid custom ID");
		});
	});
});
