# star-engine

This project is a Discord bot that allows for play-by-post on Discord for the Ironsworn: Starforged tabletop RPG system.

## Tech Stack
- **Runtime**: Bun (JavaScript runtime)
- **Language**: TypeScript
- **Framework**: Discord.js v14
- **Data Source**: dataforged (Ironsworn: Starforged oracle data)
- **Linter/Formatter**: Biome

## Development Commands

```bash
# Install dependencies
bun install
# Run in development mode with auto-reload
bun run dev
# Run in production mode
bun run start
# Run all tests
bun test
# Run specific test file
bun test src/core/custom-id.test.ts
# Lint and format code
bunx @biomejs/biome check --write
```

## Environment Setup

The bot requires a `.env` file with:
- `DISCORD_TOKEN`: Bot token from Discord Developer Portal

## Architecture

### Interaction Handler System

The bot uses a centralized interaction routing system in `src/index.ts`:

- **Commands** (`src/interactions/commands/`): Slash commands implementing `AppSlashCommand` interface
  - Must export a `command` object with `data`, `execute`, and optional `autocomplete` properties
  - Automatically loaded and registered at startup

- **Button Interactions** (`src/interactions/buttons/`): Button click handlers implementing `AppButtonInteraction` interface
  - Must export an `interaction` object with `customId` and `execute` properties
  - `customId` can be a string or predicate function for pattern matching

- **Modal Interactions** (`src/interactions/modals/`): Modal submit handlers implementing `AppModalInteraction` interface
  - Must export an `interaction` object with `customId` and `execute` properties
  - `customId` can be a string or predicate function for pattern matching

All interactions are stored in augmented `client.commands`, `client.buttonInteractions`, and `client.modalInteractions` Collections (see `src/types/discord.d.ts` for the module augmentation).

### Custom ID Encoding System

The bot uses a base64 encoding system (`src/core/custom-id.ts`) to embed parameters in Discord component custom IDs:

- Define a `CustomIdSchema<T, U>` with name, encode, and decode functions
- Use `encodeCustomId(schema, params)` to create custom IDs
- Use `decodeCustomId(schema, customId)` to extract parameters
- Use `matchesCustomId(customId, schema)` as a predicate in interaction handlers

This allows passing structured data through button clicks and modal submissions without database state.

### Component System

Components are reusable Discord UI builders in `src/core/components/`:

- Components return `string` or Discord API component JSON (`APIMessageTopLevelComponent[]`)
- Use Discord.js v14's new component builders (`SectionBuilder`, `TextDisplayBuilder`, etc.)
- Components are pure functions that compose smaller components

When implementing new commands/interactions, use the component system to build UIs.

### Oracle System

The bot interfaces with Ironsworn: Starforged oracles via the dataforged library:

- `src/core/oracles.ts`: Utility functions to search and traverse the oracle hierarchy
- Oracle data comes from `dataforged` package's structured JSON
- Oracles support autocomplete via pre-collected paths and aliases

## Coding conventions

- **Error Handling**: Use `throw` during commands and interactions instead of replying directly. Errors are caught by the centralized handler in `index.ts` and formatted for users.
- **JSDoc**: Prefer JSdoc comments over inline comments.
- **Code Organization**: Group related functions together. Within a group, maintain the following order:
    1. Exported constants
    2. Internal constants
    3. Exported types
    4. Internal types
    5. Exported functions
    6. Internal functions
- **Import Paths**: Use `@/` alias for imports from `src/` (configured in `tsconfig.json`) not in the same directory as the source file.
- **Biome**: Code is formatted with tabs, double quotes (see `biome.json`).

## Testing

Tests use Bun's built-in test runner. Test files use `.test.ts` suffix. See `src/core/custom-id.test.ts` for examples of:
- `describe`/`test` structure
- `expect` assertions
- Testing pure functions with various edge cases
