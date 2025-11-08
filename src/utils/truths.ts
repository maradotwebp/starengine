import type { ISettingTruth, ISettingTruthOption } from "dataforged";

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Find a truth by its ID.
 */
export function findTruthById(
	truths: ISettingTruth[],
	id: string,
): ISettingTruth | undefined {
	return truths.find((truth) => truth.$id === id);
}

/**
 * Find a truth option within a truth by its ID.
 */
export function findTruthOptionById(
	truth: ISettingTruth,
	id: string,
): ISettingTruthOption | undefined {
	return truth.Table.find((option) => option.$id === id);
}
