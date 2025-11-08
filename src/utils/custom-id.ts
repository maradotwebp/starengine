/**
 * Allows creating custom IDs that encode parameters.
 */
export interface CustomIdSchema<T, U extends string[]> {
	/**
	 * A name that uniquely identifies the schema.
	 */
	name: string;
	encode: (params: T) => U;
	decode: (parts: U) => T;
}

/**
 * Encodes parameters into a custom ID.
 * 
 * @example
 * const schema: CustomIdSchema<{ a: string; b: string }, [string, string]> = {
 *     name: "multi",
 *     encode: (params) => [params.a, params.b],
 *     decode: (parts) => ({ a: parts[0], b: parts[1] }),
 * };
 * const customId = encodeCustomId(schema, { a: "foo", b: "bar" });
 * console.log(customId); // "multi:Zm9vOmJhcg=="
 */
export function encodeCustomId<T, U extends string[]>(
	schema: CustomIdSchema<T, U>,
	params: T,
): string {
	const parts = schema.encode(params);
	const data = parts
		.map((part) => Buffer.from(part, "utf-8").toString("base64"))
		.join(":");
	return `${schema.name}:${data}`;
}

/**
 * Decodes a custom ID into parameters.
 * 
 * @example
 * const schema: CustomIdSchema<{ a: string; b: string }, [string, string]> = {
 *     name: "multi",
 *     encode: (params) => [params.a, params.b],
 *     decode: (parts) => ({ a: parts[0], b: parts[1] }),
 * };
 * const customId = "multi:Zm9vOmJhcg==";
 * const params = decodeCustomId(schema, customId);
 * console.log(params); // { a: "foo", b: "bar" }
 */
export function decodeCustomId<T, U extends string[]>(
	schema: CustomIdSchema<T, U>,
	customId: string,
): T {
	const parts = customId.split(":");
	if (parts[0] !== schema.name) {
		throw new Error(`Invalid custom ID: ${customId}`);
	}
	if (parts.length < 2) {
		throw new Error(`Invalid data: missing data in custom ID`);
	}
	const params = schema.decode(
		parts.slice(1)
			.map((part) => Buffer.from(part, "base64").toString("utf-8")) as U,
	);
	return params;
}
