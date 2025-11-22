# 🌠 starengine

![Static Badge](https://img.shields.io/badge/App-Install-blue?style=for-the-badge&logo=discord&link=https%3A%2F%2Fdiscord.com%2Foauth2%2Fauthorize%3Fclient_id%3D1436127174825611314) ![GitHub last commit](https://img.shields.io/github/last-commit/maradotwebp/starengine?style=flat-square) ![GitHub Repo stars](https://img.shields.io/github/stars/maradotwebp/starengine?style=flat-square)


**starengine** is a Discord bot designed to allow for play of the [Ironsworn: Starforged](https://tomkinpress.com/pages/ironsworn-starforged) roleplaying system over Discord. The bot enables play-by-post gameplay with interactive commands, oracle rolls, and move resolution.

![Move Showcase](./docs/move-showcase.png)

> ## [**To install this application, click here.**](https://discord.com/oauth2/authorize?client_id=1436127174825611314)

<hr />

## Self Hosting

If you are familiar with hosting Discord bots yourself for personal use, you may deploy this bot on your own server.

Requirements
- [Bun Runtime](https://bun.sh)
- Discord bot token provided as a `DISCORD_TOKEN` environment variable.
  You can obtain one by creating a new bot application on the [Discord Developer Portal](https://discord.com/developers/applications).
  
```bash
# Install dependencies
bun install
# Run the bot
bun run start
```

## Development Setup

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

## Copyright

[© 2025 maradotwebp](LICENSE)
