require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [];

if (!process.env.DISCORD_TOKEN) {
  console.error('ERROR: DISCORD_TOKEN is not set.');
  process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
  console.error('ERROR: DISCORD_CLIENT_ID is not set.');
  process.exit(1);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
