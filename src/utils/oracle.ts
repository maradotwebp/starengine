import type { IOracle, IOracleCategory, IRow } from 'dataforged';

// Helper function to recursively search for an oracle by name
export function findOracleByName(categories: IOracleCategory[], name: string): IOracle | null {
  const searchName = name.toLowerCase().trim();
  
  for (const category of categories) {
    // Check if this category has oracles
    if (category.Oracles) {
      for (const oracle of category.Oracles) {
        // Check if the oracle name matches
        if (oracle.Name?.toLowerCase() === searchName) {
          return oracle;
        }
        // Check aliases if they exist
        if (oracle.Aliases) {
          for (const alias of oracle.Aliases) {
            if (alias.toLowerCase() === searchName) {
              return oracle;
            }
          }
        }
      }
    }
    
    // Recursively search subcategories
    if (category.Categories) {
      const found = findOracleByName(category.Categories, name);
      if (found) return found;
    }
  }
  
  return null;
}

// Helper function to find an oracle by ID
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

// Helper function to roll on an oracle table
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

// Helper function to collect all oracle names for autocomplete
export function collectOracleNames(categories: IOracleCategory[], oracleNames: string[]): void {
  for (const category of categories) {
    if (category.Oracles) {
      for (const oracle of category.Oracles) {
        if (oracle.Name && oracle.Table) {
          oracleNames.push(oracle.Name);
          if (oracle.Aliases) {
            oracleNames.push(...oracle.Aliases);
          }
        }
      }
    }
    if (category.Categories) {
      collectOracleNames(category.Categories, oracleNames);
    }
  }
}

