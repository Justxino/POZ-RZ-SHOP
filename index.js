require('dotenv').config();
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

// ================= CLIENT =================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= EXPRESS PANEL =================
const app = express();

let orders = [];

app.get('/', (req, res) => {
  res.send(`
  <html>
  <head>
    <title>POZ RZ PANEL</title>
    <style>
      body {
        margin:0;
        font-family: Arial;
        background: linear-gradient(135deg,#0f172a,#1e3a8a);
        color:white;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
      }

      .card {
        background: rgba(255,255,255,0.08);
        padding:30px;
        border-radius:15px;
        width:400px;
        text-align:center;
      }

      h1 { color:#38bdf8; }

      .status {
        margin-top:10px;
        padding:10px;
        border-radius:10px;
        background:${process.env.DISCORD_TOKEN ? '#22c55e' : '#ef4444'};
      }

      .box {
        margin-top:20px;
        background:rgba(255,255,255,0.1);
        padding:10px;
        border-radius:10px;
      }
    </style>
  </head>

  <body>
    <div class="card">
      <h1>🛒 POZ RZ PANEL</h1>

      <div class="status">
        ${process.env.DISCORD_TOKEN ? '🟢 BOT ONLINE' : '🔴 BOT OFFLINE'}
      </div>

      <div class="box">
        📦 Orders: ${orders.length}<br>
        ⚡ System Active<br>
        🤖 Discord Connected
      </div>

      <p style="font-size:12px;color:#aaa;">
        GTA / FiveM Shop System
      </p>
    </div>
  </body>
  </html>
  `);
});

app.listen(5000, '0.0.0.0', () => {
  console.log("🔥 POZ RZ PANEL LIVE on port 5000");
});

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ================= COMMANDS =================
client.on(Events.InteractionCreate, async (interaction) => {

  try {

    // ================= STORE =================
    if (interaction.isChatInputCommand() && interaction.commandName === 'store') {

      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🛒 POZ RZ PREMIUM STORE')
        .setDescription(`
💎 Coins Guns ➜ $20-$30  
👕 Clothing Import ➜ $25  
🔫 Gun Import ➜ $30  
🚫 TX Unban ➜ $10  
🔓 AC Unban ➜ $25  
💊 Personal Drug ➜ $35  
💰 Coins ➜ 100 Diamonds = $10
        `)
        .setFooter({ text: 'POZ RZ • Premium System ⚡' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('buy')
          .setLabel('🛒 Buy Now')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('contact')
          .setLabel('📩 Contact')
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.editReply({ embeds: [embed], components: [row] });
    }

    // ================= HELP =================
    if (interaction.isChatInputCommand() && interaction.commandName === 'help') {

      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }

      const help = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('📌 POZ RZ HELP')
        .setDescription(`
/store - Open shop  
/help - Commands  
        `);

      return interaction.editReply({ embeds: [help] });
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {

      if (interaction.customId === 'buy') {

        orders.push({
          user: interaction.user.tag,
          time: new Date().toLocaleString()
        });

        return interaction.reply({
          content: `🎫 Order created! Staff will contact you soon.`,
          ephemeral: true
        });
      }

      if (interaction.customId === 'contact') {
        return interaction.reply({
          content: `📩 DM <@${interaction.user.id}> for support.`,
          ephemeral: true
        });
      }
    }

  } catch (err) {
    console.error("Error:", err);
  }

});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);