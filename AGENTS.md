# star-engine

This project is a Discord bot that allows for play-by-post on Discord for the Ironsworn: Starforged tabletop RPG system.

## Tech Stack
- **Runtime**: Bun (JavaScript runtime)
- **Language**: TypeScript
- **Framework**: Discord.js v14
- **Data Source**: dataforged (Ironsworn: Starforged oracle data)
- **Linter/Formatter**: Biome

## Coding conventions

- Prefer JSdoc comments over inline comments.
    - For exported library functions in the `utils/` folder, also include an example in the JSDoc.
- Group related functions together. Within a group, maintain the following order:
    1. Exported constants
    2. Internal constants
    3. Exported types
    4. Internal types
    5. Exported functions
    6. Internal functions