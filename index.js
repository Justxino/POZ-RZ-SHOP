require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// ================= EXPRESS (KEEP ALIVE) =================
const app = express();
app.get('/', (req, res) => res.send('POZ RZ Bot is running'));
app.listen(5000, '0.0.0.0', () => console.log('Web server running on port 5000'));

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

  if (interaction.commandName === 'store') {
    await interaction.reply({
      content: `
💰 **POZ RZ STORE**

Coins Guns ➜ $20-$30  
Clothing Import ➜ $25  
Gun Import ➜ $30  
Tx Unban ➜ $10  
Ac Unban ➜ $25  
Personal Drug ➜ $35  
Coins ➜ Every 10 Diamonds is $1
      `
    });
  }

  if (interaction.commandName === 'help') {
    await interaction.reply({
      content: `
📌 **POZ RZ HELP**

/store - View shop prices  
/help - Show commands
      `
    });
  }
});

client.login(process.env.DISCORD_TOKEN);