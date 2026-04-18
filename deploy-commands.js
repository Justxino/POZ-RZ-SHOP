require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('store')
    .setDescription('Show Poz RZ prices'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show commands')
].map(cmd => cmd.toJSON());

if (!process.env.DISCORD_TOKEN) {
  console.error('ERROR: DISCORD_TOKEN is not set.');
  process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
  console.error('ERROR: DISCORD_CLIENT_ID is not set.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} commands...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log(`Successfully loaded ${data.length} slash commands.`);
  } catch (error) {
    console.error(error);
  }
})();