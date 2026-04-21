node -e "
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');
const commands = [
  { name: 'store', description: 'Browse and buy items' },
  { name: 'help', description: 'Show all commands' },
  { name: 'ping', description: 'Check bot latency' },
  { name: 'dashboard', description: 'Admin dashboard' },
  { name: 'serverinfo', description: 'Server information' },
  { name: 'lock', description: 'Lock channel' },
  { name: 'unlock', description: 'Unlock channel' },
  { name: 'callnow', description: 'Ping VC members' },
];
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: [] })
  .then(() => rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: commands }))
  .then(d => console.log('✅ Registered ' + d.length + ' commands'))
  .catch(console.error);
"