import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction, MessageFlags, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder } from "discord.js";
import { starforged, type IOracleCategory } from 'dataforged';
import { findOracleById, findCategoryById, rollOnOracle, rollOnCategory, collectOracles, collectCategories } from '../utils/oracle.js';

const oracles = collectOracles(starforged["Oracle Categories"]);
const categories = collectCategories(starforged["Oracle Categories"]);

export const data = new SlashCommandBuilder()
  .setName('oracle')
  .setDescription('Roll on an oracle table or entire category.')
  .addStringOption(option =>
    option
      .setName('name')
      .setDescription('The name of the oracle table or category to roll on')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const value = interaction.options.getString('name', true);

  const [type, id] = value.split(':');
  
  if (!id) {
    await interaction.reply({ 
      content: `❌ Could not find an oracle table or category with ID "${id}".`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  switch (type) {
    case 'oracle':
      return await handleOracleRoll(interaction, id);
    case 'category':
      return await handleCategoryRoll(interaction, id);
    default:
      return await interaction.reply({ 
        content: `❌ Could not find an oracle table or category with ID "${id}".`,
        flags: MessageFlags.Ephemeral
      });
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused();
  
  const categoryOptions = categories.map(({ name, path, id }) => ({ 
    name: `📚 ${path.length > 0 ? path.join('／') + '／' : ''}${name}`, 
    value: id,
    type: 'category' as const
  }));

  const oracleOptions = oracles.map(({ name, path, id }) => ({ 
    name: `${path.join('／')}／${name}`, 
    value: id,
    type: 'oracle' as const
  }));
  
  
  const allOptions = [...categoryOptions, ...oracleOptions]
    .filter(({ name }) => name.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
    .map(({ name, value, type }) => ({ name, value: `${type}:${value}` }));
  
  await interaction.respond(allOptions);
}



async function handleOracleRoll(interaction: ChatInputCommandInteraction, id: string) {
  const oracle = findOracleById(starforged["Oracle Categories"], id);

  if (!oracle) {
    await interaction.reply({ 
      content: `❌ Oracle not found`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const { roll, result, nestedRolls, error } = rollOnOracle(oracle, starforged["Oracle Categories"]);
  
  if (error || !result) {
    await interaction.reply({ 
      content: `❌ Error: ${error || "Unknown error occurred"}`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  
  // Format the response
  let response =`# 🔮 ${result.Result}\n`;
  if (result.Summary) {
    response += `${result.Summary}\n`;
  }

  response += `-# \`→ ${roll}\` ◇ ${oracle.Display.Title}\n`;
  
  // Add nested oracle rolls if any
  if (nestedRolls) {
    for (const nested of nestedRolls) {
      response += `- **${nested.oracle.Name}**: ${nested.result.Result}\n`;
      if (nested.result.Summary) {
        response += `  -# ${nested.result.Summary}\n`;
      }
      response += `  -# \`→ ${nested.roll}\` ◇ ${nested.oracle.Display.Title}\n`;
    }
  }
  
  await interaction.reply(response);
}

async function handleCategoryRoll(interaction: ChatInputCommandInteraction, id: string) {
  const category = findCategoryById(starforged["Oracle Categories"], id);

  if (!category) {
    await interaction.reply({ 
      content: `❌ Category not found`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const results = rollOnCategory(category, starforged["Oracle Categories"]);
  
  if (results.length === 0) {
    await interaction.reply({ 
      content: `❌ Category "${category.Display.Title}" does not contain any rollable oracles.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  
  // Format the response
  let response = `# 🔮 ${category.Display.Title}\n`;
  
  for (const { oracle, roll, result, nestedRolls } of results) {
    response += `- **${oracle.Name}**: ${result.Result}\n`;
    if (result.Summary) {
      response += `  -# ${result.Summary}\n`;
    }
    response += `  -# \`→ ${roll}\` ◇ ${oracle.Display.Title}\n`;
    
    // Add nested oracle rolls if any
    if (nestedRolls) {
      for (const nested of nestedRolls) {
        response += `  - **${nested.oracle.Name}**: ${nested.result.Result}\n`;
        if (nested.result.Summary) {
          response += `    -# ${nested.result.Summary}\n`;
        }
        response += `    -# \`→ ${nested.roll}\` ◇ ${nested.oracle.Display.Title}\n`;
      }
    }
  }

  const content = new TextDisplayBuilder().setContent(response);
  const iconHrefs = getIconHrefs(category);

  if (iconHrefs.length > 0) {
    const section = new SectionBuilder().addTextDisplayComponents(content);
    const randomIconHref = iconHrefs[Math.floor(Math.random() * iconHrefs.length)]!;
    section.setThumbnailAccessory(
      new ThumbnailBuilder().setURL(randomIconHref).setDescription(category.Display.Title)
    );
    await interaction.reply({
      components: [section],
      flags: MessageFlags.IsComponentsV2
    });
  } else {
    await interaction.reply({
      components: [content],
      flags: MessageFlags.IsComponentsV2
    });
  }
}

function getIconHrefs(category: IOracleCategory): string[] {
  return [
    ...(category.Display.Images?.map(image => image.replace("../../img/raster/", "https://raw.githubusercontent.com/rsek/dataforged/refs/heads/main/img/raster/")) ?? []),
    category.Display.Icon?.replace("../../img/vector/", "https://raw.githubusercontent.com/maradotwebp/dataforged-png/refs/heads/main/img/vector/Oracles/").replace(".svg", ".png"),
  ].filter(href => href !== undefined);
}

