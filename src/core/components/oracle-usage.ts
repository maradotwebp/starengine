import type { IOracleUsage } from "dataforged";

export function OracleUsage(usage: IOracleUsage | undefined): string {
	const maxRolls = usage?.["Max rolls"];
	return maxRolls ? `**(🗘 1 - ${maxRolls})**` : "";
}
