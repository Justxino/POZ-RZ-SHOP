require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');

// ================= DEBUG =================
console.log('CLIENT ID:', process.env.DISCORD_CLIENT_ID);
console.log('GUILD ID:', process.env.DISCORD_GUILD_ID);

// ================= VALIDATION =================
if (!process.env.DISCORD_TOKEN) throw new Error('Missing DISCORD_TOKEN');
if (!process.env.DISCORD_CLIENT_ID) throw new Error('Missing DISCORD_CLIENT_ID');
if (!process.env.DISCORD_GUILD_ID) throw new Error('Missing DISCORD_GUILD_ID');

// ================= COMMANDS =================
const commands = [
  new SlashCommandBuilder().setName('store').setDescription('Show store'),
  new SlashCommandBuilder().setName('help').setDescription('Show commands'),

  new SlashCommandBuilder().setName('ping').setDescription('Bot latency'),
  new SlashCommandBuilder().setName('avatar').setDescription('Show user avatar'),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Server info'),

  new SlashCommandBuilder().setName('lock').setDescription('Lock channel'),
  new SlashCommandBuilder().setName('unlock').setDescription('Unlock channel'),

  new SlashCommandBuilder().setName('callnow').setDescription('Ping all VC members'),

  // ================= FIXED MOVE COMMAND =================
  new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move a member to a voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Member to move')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Target voice channel')
        .addChannelTypes(ChannelType.GuildVoice) // IMPORTANT FIX
        .setRequired(true)
    )
].map(c => c.toJSON());

// ================= REST =================
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// ================= REGISTER =================
(async () => {
  try {
    console.log('Registering slash commands...');

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log(`✅ Registered ${data.length} commands`);
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();