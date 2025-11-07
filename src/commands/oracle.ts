import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { starforged } from 'dataforged';
import { findOracleByName, rollOnOracle, collectOracleNames } from '../utils/oracle.js';

export const data = new SlashCommandBuilder()
  .setName('oracle')
  .setDescription('Roll on an oracle table from Starforged')
  .addStringOption(option =>
    option
      .setName('name')
      .setDescription('The name of the oracle table to roll on')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name', true);
  
  // Find the oracle
  const oracle = findOracleByName(starforged["Oracle Categories"], name);
  
  if (!oracle) {
    await interaction.reply({ 
      content: `❌ Could not find an oracle table named "${name}". Make sure you're using the exact name.`,
      ephemeral: true 
    });
    return;
  }
  
  // Roll on the oracle
  const { roll, result, nestedRolls, error } = rollOnOracle(oracle, starforged["Oracle Categories"]);
  
  if (error || !result) {
    await interaction.reply({ 
      content: `❌ Error: ${error || "Unknown error occurred"}`,
      ephemeral: true 
    });
    return;
  }
  
  // Format the response
  let response = `🎲 **${oracle.Name}**\n`;
  response += `Roll: **${roll}**\n`;
  response += `Result: **${result.Result}**\n`;
  
  if (result.Summary) {
    response += `\n${result.Summary}`;
  }
  
  // Add nested oracle rolls if any
  if (nestedRolls) {
    for (const nested of nestedRolls) {
      response += `\n\n🎲 **${nested.oracle.Name}**\n`;
      response += `Roll: **${nested.roll}**\n`;
      response += `Result: **${nested.result.Result}**\n`;
      if (nested.result.Summary) {
        response += `\n${nested.result.Summary}`;
      }
    }
  }
  
  await interaction.reply(response);
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused();
  
  // Collect all oracle names
  const oracleNames: string[] = [];
  collectOracleNames(starforged["Oracle Categories"], oracleNames);
  
  // Filter and limit results
  const filtered = oracleNames
    .filter(name => name.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25);
  
  await interaction.respond(
    filtered.map(name => ({ name, value: name }))
  );
}

