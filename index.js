require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

// ================= EXPRESS (KEEP ALIVE) =================
const app = express();

app.get('/', (req, res) => {
  res.send('POZ RZ Bot is running 🟢');
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Web server running on port 5000');
});

// ================= DISCORD BOT =================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ================= SLASH COMMANDS =================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 💙 STORE COMMAND (NEW PROFESSIONAL EMBED)
  if (interaction.commandName === 'store') {

    const embed = new EmbedBuilder()
      .setColor(0x3498db) // blue theme
      .setTitle('🛒 POZ RZ STORE')
      .setDescription(`
💎 **Coins Guns** ➜ $20 - $30  
👕 **Clothing Import** ➜ $25  
🔫 **Gun Import** ➜ $30  
🚫 **TX Unban** ➜ $10  
🔓 **AC Unban** ➜ $25  
💊 **Personal Drug** ➜ $35  
💰 **Coins** ➜ Every 10 Diamonds = $1
      `)
      .setFooter({ text: 'POZ RZ • Fast & Trusted Service ⚡' });

    await interaction.reply({ embeds: [embed] });
  }

  // 📌 HELP COMMAND
  if (interaction.commandName === 'help') {

    const helpEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('📌 POZ RZ HELP')
      .setDescription(`
/store - View shop prices  
/help - Show commands
      `)
      .setFooter({ text: 'POZ RZ Bot System' });

    await interaction.reply({ embeds: [helpEmbed] });
  }
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);