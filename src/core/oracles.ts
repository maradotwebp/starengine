import {
	type IOracle,
	type IOracleBase,
	type IOracleCategory,
	starforged,
} from "dataforged";

/**
 * Returns the oracle / oracle category with the given ID.
 */
export function findOracle(id: string): IOracle | IOracleCategory | undefined;
/**
 * Returns the oracle / oracle category with the given ID.
 *
 * This should only be used internally.
 */
export function findOracle(
	id: string,
	oracles: IOracleBase[],
): IOracle | IOracleCategory | undefined;
export function findOracle(
	id: string,
	oracles: IOracleBase[] = starforged["Oracle Categories"],
): IOracle | IOracleCategory | undefined {
	for (const oracle of oracles) {
		if (oracle.$id === id) return oracle;
		if (oracle.Oracles) {
			const item = findOracle(id, oracle.Oracles);
			if (item) return item;
		}
		if (oracle.Categories) {
			const item = findOracle(id, oracle.Categories);
			if (item) return item;
		}
	}
}

export interface OracleAutocomplete {
	id: string;
	path: string[];
	name: string;
	alias: string[];
}

/**
 * Returns a list of autocomplete options for oracles.
 */
export function collectOracleAutocomplete(): OracleAutocomplete[];
/**
 * Returns a list of autocomplete options for oracles.
 *
 * This should only be used internally.
 */
export function collectOracleAutocomplete(
	path: string[],
	oracles: IOracleBase[],
): OracleAutocomplete[];
export function collectOracleAutocomplete(
	path: string[] = [],
	oracles: IOracleBase[] = starforged["Oracle Categories"],
): OracleAutocomplete[] {
	const result: OracleAutocomplete[] = [];
	for (const oracle of oracles) {
		const name = oracle.Display.Title;
		result.push({
			id: oracle.$id,
			path,
			name,
			alias: oracle.Aliases ?? [],
		});
		if (oracle.Oracles) {
			result.push(
				...collectOracleAutocomplete([...path, name], oracle.Oracles),
			);
		}
		if (oracle.Categories) {
			result.push(
				...collectOracleAutocomplete([...path, name], oracle.Categories),
			);
		}
	}
	return result;
}
