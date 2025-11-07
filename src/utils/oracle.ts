import type { IOracle, IOracleCategory, IRow } from 'dataforged';

/**
 * Find an oracle by its ID.
 * 
 * @example
 * const oracle = findOracleById(starforged["Oracle Categories"], "Starforged/Oracles/Characters/Revealed_Aspect");
 * console.log(oracle);
 */
export function findOracleById(categories: IOracleCategory[], id: string): IOracle | null {
  for (const category of categories) {
    if (category.Oracles) {
      for (const oracle of category.Oracles) {
        if (oracle.$id === id) {
          return oracle;
        }
      }
    }
    if (category.Categories) {
      const found = findOracleById(category.Categories, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Roll on an oracle table.
 * 
 * @example
 * const { roll, result, nestedRolls, error } = rollOnOracle(oracle, starforged["Oracle Categories"]);
 * console.log(roll, result, nestedRolls, error);
 */
export function rollOnOracle(oracle: IOracle, categories: IOracleCategory[]): { roll: number; result: IRow | null; nestedRolls?: Array<{ oracle: IOracle; roll: number; result: IRow }>; error?: string } {
  if (!oracle.Table || oracle.Table.length === 0) {
    return { roll: 0, result: null, error: "This oracle doesn't have a rollable table." };
  }
  
  // Roll a d100
  const roll = Math.floor(Math.random() * 100) + 1;
  
  // Find the matching row
  for (const row of oracle.Table) {
    const floor = row.Floor ?? 1;
    const ceiling = row.Ceiling ?? 100;
    
    if (roll >= floor && roll <= ceiling) {
      const nestedRolls: Array<{ oracle: IOracle; roll: number; result: IRow }> = [];
      
      // Check if this row requires additional oracle rolls
      if (row["Oracle rolls"]) {
        for (const oracleId of row["Oracle rolls"]) {
          const nestedOracle = findOracleById(categories, oracleId);
          if (nestedOracle && nestedOracle.Table) {
            const nestedRoll = Math.floor(Math.random() * 100) + 1;
            for (const nestedRow of nestedOracle.Table) {
              const nestedFloor = nestedRow.Floor ?? 1;
              const nestedCeiling = nestedRow.Ceiling ?? 100;
              if (nestedRoll >= nestedFloor && nestedRoll <= nestedCeiling) {
                nestedRolls.push({ oracle: nestedOracle, roll: nestedRoll, result: nestedRow });
                break;
              }
            }
          }
        }
      }
      
      return { roll, result: row, nestedRolls: nestedRolls.length > 0 ? nestedRolls : undefined };
    }
  }
  
  return { roll, result: null, error: "Could not find a matching result for the roll." };
}

/**
 * Collect all oracle names with their IDs for autocomplete.
 * 
 * @example
 * const oracles = collectOracles(starforged["Oracle Categories"]);
 * console.log(oracles);
 */
export function collectOracles(categories: IOracleCategory[]): Array<{ name: string; id: string }> {
  const oracles: Array<{ name: string; id: string }> = [];
  
  for (const category of categories) {
    if (category.Oracles) {
      for (const oracle of category.Oracles) {
        if (oracle.Name && oracle.Table && oracle.$id) {
          oracles.push({ name: oracle.Name, id: oracle.$id });
          if (oracle.Aliases) {
            for (const alias of oracle.Aliases) {
              oracles.push({ name: alias, id: oracle.$id });
            }
          }
        }
      }
    }
    if (category.Categories) {
      oracles.push(...collectOracles(category.Categories));
    }
  }
  
  return oracles;
}

