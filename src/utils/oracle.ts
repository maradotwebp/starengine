import type { IOracle, IOracleCategory, IRow } from 'dataforged';

interface CollectedOracle {
  name: string;
  path: string[];
  id: string;
}

/**
 * Collect all oracle names with their IDs for autocomplete.
 * 
 * @example
 * const oracles = collectOracles(starforged["Oracle Categories"]);
 * console.log(oracles);
 */
export function collectOracles(categories: IOracleCategory[], path: string[] = []): Array<CollectedOracle> {
  const oracles: Array<CollectedOracle> = [];
  
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

export interface CollectedCategory {
  name: string;
  path: string[];
  id: string;
}

/**
 * Collect all category names with their IDs for autocomplete.
 * 
 * @example
 * const categories = collectCategories(starforged["Oracle Categories"]);
 * console.log(categories);
 */
export function collectCategories(categories: IOracleCategory[], path: string[] = []): Array<CollectedCategory> {
  const result: Array<CollectedCategory> = [];
  
  for (const category of categories) {
    const hasOracles = getAllOraclesFromCategory(category).length > 0;
    if (hasOracles) {
      result.push({ 
        name: category.Display.Title, 
        path: [...path], 
        id: category.$id
      });
    }
    
    if (category.Categories) {
      result.push(...collectCategories(category.Categories, [...path, category.Display.Title]));
    }
  }
  
  return result;
}

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

export interface UseOracleResult {
  oracle: IOracle;
  roll: number;
  result: IRow;
  nestedRolls?: Array<UseOracleResult>;
}

/**
 * Roll on an oracle table.
 * 
 * @example
 * const { roll, result, nestedRolls, error } = rollOnOracle(oracle, starforged["Oracle Categories"]);
 * console.log(roll, result, nestedRolls, error);
 */
export function useOracle(oracle: IOracle, categories: IOracleCategory[]): UseOracleResult {
  if (!oracle.Table || oracle.Table.length === 0) {
    throw new Error("This oracle doesn't have a rollable table.");
  }
  
  // Roll a d100
  const roll = Math.floor(Math.random() * 100) + 1;
  
  // Find the matching row
  for (const row of oracle.Table) {
    const floor = row.Floor ?? 1;
    const ceiling = row.Ceiling ?? 100;
    
    if (roll >= floor && roll <= ceiling) {
      const nestedRolls: Array<UseOracleResult> = [];
      if (row["Oracle rolls"]) {
        for (const oracleId of row["Oracle rolls"]) {
          const nestedResult = useOracle(findOracleById(categories, oracleId)!, categories);
          nestedRolls.push(nestedResult);
        }
      }
      
      return { oracle, roll, result: row, nestedRolls: nestedRolls.length > 0 ? nestedRolls : undefined };
    }
  }

  throw new Error("Could not find a matching result for the roll.");
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
 * const results = useOracleCategory(category, starforged["Oracle Categories"]);
 * console.log(results);
 */
export function useOracleCategory(category: IOracleCategory, categories: IOracleCategory[]): Array<UseOracleResult> {
  const oracles = getAllOraclesFromCategory(category);
  const results: Array<UseOracleResult> = [];
  
  for (const oracle of oracles) {
    const rollResult = useOracle(oracle, categories);
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

