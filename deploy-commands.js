require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, ChannelType } = require('discord.js');

// ================= DEBUG =================
console.log('CLIENT ID:', process.env.DISCORD_CLIENT_ID);
console.log('GUILD ID:', process.env.DISCORD_GUILD_ID);

// ================= VALIDATION =================
if (!process.env.DISCORD_TOKEN)      throw new Error('Missing DISCORD_TOKEN');
if (!process.env.DISCORD_CLIENT_ID)  throw new Error('Missing DISCORD_CLIENT_ID');
if (!process.env.DISCORD_GUILD_ID)   throw new Error('Missing DISCORD_GUILD_ID');

// ================= COMMANDS =================
const commands = [

  new SlashCommandBuilder()
    .setName('store')
    .setDescription('Browse and buy items from the POZ RZ SHOP'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency and status'),

  new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('View the admin dashboard (admin only)'),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show a user avatar')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get avatar of').setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show server information'),

  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel (admin only)'),

  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel (admin only)'),

  new SlashCommandBuilder()
    .setName('callnow')
    .setDescription('Ping all members currently in voice channels'),

  new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move a member to a voice channel')
    .addUserOption(option =>
      option.setName('user').setDescription('Member to move').setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Voice channel to move them to')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    ),

].map(cmd => cmd.toJSON());

// ================= REST =================
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// ================= REGISTER =================
(async () => {
  try {
    console.log('🚀 Registering slash commands...');

    // Clear old commands first
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: [] }
    );

    // Register fresh
    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log(`✅ Successfully registered ${data.length} commands:`);
    data.forEach(c => console.log(`  /${c.name} — ${c.description}`));

  } catch (err) {
    console.error('❌ Error registering commands:', err);
  }
})();