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
  let response =`# 🔮 ${result.Result}\n`;
  if (result.Summary) {
    response += `${result.Summary}\n`;
  }
  response += `-# \`→ ${roll}\` ◇ ${oracle.Display.Title}`;
  
  // Add nested oracle rolls if any
  if (nestedRolls) {
    for (const nested of nestedRolls) {
      response += `# 🔮 ${nested.result.Result}\n`;
      if (nested.result.Summary) {
        response += `${nested.result.Summary}\n`;
      }
      response += `-# \`→ ${nested.roll}\` ◇ ${nested.oracle.Display.Title}`;
    }
  }
  
  await interaction.reply(response);
}

const oracles = collectOracles(starforged["Oracle Categories"]);

export async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused();
  
  await interaction.respond(
    oracles
      .map(({ name, path, id }) => ({ name: `${path.join('／')}／${name}`, value: id }))
      .filter(({ name }) => name.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25)
  );
}

