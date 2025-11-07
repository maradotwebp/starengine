import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { starforged } from 'dataforged';
import { findOracleById, rollOnOracle, collectOracles } from '../utils/oracle.js';

export const data = new SlashCommandBuilder()
  .setName('oracle')
  .setDescription('Roll on an oracle table.')
  .addStringOption(option =>
    option
      .setName('name')
      .setDescription('The name of the oracle table to roll on')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const oracleId = interaction.options.getString('name', true);

  console.log(oracleId);
  // Find the oracle by ID
  const oracle = findOracleById(starforged["Oracle Categories"], oracleId);
  
  if (!oracle) {
    await interaction.reply({ 
      content: `❌ Could not find an oracle table with ID "${oracleId}".`,
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
  
  // Collect all oracle names with their IDs
  const oracles = collectOracles(starforged["Oracle Categories"]);
  
  // Filter and limit results
  const filtered = oracles
    .filter(({ name }) => name.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25);
  
  await interaction.respond(
    filtered.map(({ name, id }) => ({ name, value: id }))
  );
}

