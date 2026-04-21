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

  // ================= MOVE (VOICE ONLY LOCKED) =================
  new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move a member to a voice channel')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Member to move')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Voice channel only')
        .addChannelTypes(ChannelType.GuildVoice) // 🔥 STRICT VOICE ONLY
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

// ================= REST =================
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// ================= REGISTER (FORCE REFRESH FIX) =================
(async () => {
  try {
    console.log('🚀 Registering slash commands...');

    // 🔥 THIS CLEARS OLD CACHE PROPERLY
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: [] } // clear old commands first
    );

    // 🔥 THEN RE-REGISTER CLEAN
    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log(`✅ Successfully registered ${data.length} commands`);
  } catch (err) {
    console.error('❌ Error registering commands:', err);
  }
})();