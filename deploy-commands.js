const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('store')
    .setDescription('Show Poz RZ prices'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show commands')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }
})();
