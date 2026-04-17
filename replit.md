# POZ-RZ-SHOP Discord Bot

## Overview
A Discord bot project for the POZ-RZ-SHOP server. Built with discord.js v14 and Node.js 20.

## Architecture
- **Runtime:** Node.js 20
- **Main entry:** `index.js` — starts both the Discord bot and an Express status web page on port 5000
- **Commands deploy:** `deploy-commands.js` — registers slash commands with Discord API
- **Status page:** Served at port 5000 (visible in Replit preview pane)

## Project Structure
```
index.js            - Main bot entry point + Express status server
deploy-commands.js  - Script to register slash commands with Discord
package.json        - npm dependencies
.env                - Environment variables (not committed)
```

## Dependencies
- `discord.js` ^14.16.3 — Discord API client
- `dotenv` ^16.4.5 — Environment variable loading
- `express` ^4.18.2 — Status web page server

## Environment Variables / Secrets
- `DISCORD_TOKEN` — Bot token from Discord Developer Portal (required to connect)
- `DISCORD_CLIENT_ID` — Application/Client ID (required for deploy-commands.js)

## Running
- `npm start` — Starts the bot and status page
- `node deploy-commands.js` — Registers slash commands with Discord

## Notes
- The bot runs as a VM deployment (always-on) since Discord bots require persistent connections
- The status page at port 5000 shows whether the bot is connected
- Add your `DISCORD_TOKEN` secret to enable the Discord connection
