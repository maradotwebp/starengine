import {
	type ISettingTruth,
	type ISettingTruthOption,
	starforged,
} from "dataforged";

/**
 * Find a truth by its ID.
 */
export function findTruthById(id: string): ISettingTruth | undefined;
/**
 * Find a truth by its ID.
 *
 * For internal use only.
 */
export function findTruthById(
	id: string,
	truths: ISettingTruth[],
): ISettingTruth | undefined;
export function findTruthById(
	id: string,
	truths: ISettingTruth[] = starforged["Setting Truths"],
): ISettingTruth | undefined {
	return truths.find((truth) => truth.$id === id);
}

/**
 * Find a truth option within a truth by its ID.
 */
export function findTruthOptionById(
	id: string,
	truth: ISettingTruth,
): ISettingTruthOption | undefined {
	return truth.Table.find((option) => option.$id === id);
}
