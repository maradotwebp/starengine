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
 * Find a category by its ID.
 * 
 * @example
 * const category = findCategoryById(starforged["Oracle Categories"], "Starforged/Oracles/Characters");
 * console.log(category);
 */
export function findCategoryById(categories: IOracleCategory[], id: string): IOracleCategory | null {
  for (const category of categories) {
    if (category.$id === id) {
      return category;
    }
    if (category.Categories) {
      const found = findCategoryById(category.Categories, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all oracles recursively from a category.
 */
function getAllOraclesFromCategory(category: IOracleCategory): IOracle[] {
  const oracles: IOracle[] = [];
  
  if (category.Oracles) {
    for (const oracle of category.Oracles) {
      if (oracle.Table && oracle.Table.length > 0) {
        oracles.push(oracle);
      }
    }
  }
  
  if (category.Categories) {
    for (const subcategory of category.Categories) {
      oracles.push(...getAllOraclesFromCategory(subcategory));
    }
  }
  
  return oracles;
}

/**
 * Roll on all oracles in a category.
 * 
 * @example
 * const results = rollOnCategory(category, starforged["Oracle Categories"]);
 * console.log(results);
 */
export function rollOnCategory(category: IOracleCategory, categories: IOracleCategory[]): Array<{ oracle: IOracle; roll: number; result: IRow; nestedRolls?: Array<{ oracle: IOracle; roll: number; result: IRow }> }> {
  const oracles = getAllOraclesFromCategory(category);
  const results: Array<{ oracle: IOracle; roll: number; result: IRow; nestedRolls?: Array<{ oracle: IOracle; roll: number; result: IRow }> }> = [];
  
  for (const oracle of oracles) {
    const rollResult = rollOnOracle(oracle, categories);
    if (rollResult.result) {
      results.push({
        oracle,
        roll: rollResult.roll,
        result: rollResult.result,
        nestedRolls: rollResult.nestedRolls
      });
    }
  }
  
  return results;
}

/**
 * Collect all oracle names with their IDs for autocomplete.
 * 
 * @example
 * const oracles = collectOracles(starforged["Oracle Categories"]);
 * console.log(oracles);
 */
export function collectOracles(categories: IOracleCategory[], path: string[] = []): Array<{ name: string; path: string[]; id: string }> {
  const oracles: Array<{ name: string; path: string[]; id: string }> = [];
  
  for (const category of categories) {
    if (category.Oracles) {
      for (const oracle of category.Oracles) {
        if (oracle.Table) {
          oracles.push({ name: oracle.Display.Title, path: [...path, category.Display.Title], id: oracle.$id });
          if (oracle.Aliases) {
            for (const alias of oracle.Aliases) {
              oracles.push({ name: alias, path: [...path, category.Display.Title], id: oracle.$id });
            }
          }
        }
      }
    }
    if (category.Categories) {
      oracles.push(...collectOracles(category.Categories, [...path, category.Display.Title]));
    }
  }
  
  return oracles;
}

/**
 * Collect all category names with their IDs for autocomplete.
 * 
 * @example
 * const categories = collectCategories(starforged["Oracle Categories"]);
 * console.log(categories);
 */
export function collectCategories(categories: IOracleCategory[], path: string[] = []): Array<{ name: string; path: string[]; id: string; hasOracles: boolean }> {
  const result: Array<{ name: string; path: string[]; id: string; hasOracles: boolean }> = [];
  
  for (const category of categories) {
    const hasOracles = getAllOraclesFromCategory(category).length > 0;
    if (hasOracles) {
      result.push({ 
        name: category.Display.Title, 
        path: [...path], 
        id: category.$id,
        hasOracles: true
      });
    }
    
    if (category.Categories) {
      result.push(...collectCategories(category.Categories, [...path, category.Display.Title]));
    }
  }
  
  return result;
}

