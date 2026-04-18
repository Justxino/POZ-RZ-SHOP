require('dotenv').config();
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  PermissionsBitField
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
    </div>
  </body>
  </html>
  `);
});

app.listen(5000, '0.0.0.0', () => {
  console.log("🔥 POZ RZ PANEL LIVE on port 5000");
});

// ================= ERROR HANDLING =================
client.on('error', (err) => {
  console.error('Discord client error:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err?.message || err);
});

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ================= INTERACTIONS =================
client.on(Events.InteractionCreate, async (interaction) => {

  try {

    // ================= STORE =================
    if (interaction.isChatInputCommand() && interaction.commandName === 'store') {

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

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    // ================= HELP =================
    if (interaction.isChatInputCommand() && interaction.commandName === 'help') {

      const help = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('📌 POZ RZ HELP')
        .setDescription(`
/store - Open shop  
/help - Commands  
        `);

      return interaction.reply({ embeds: [help] });
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {

      // 🛒 BUY BUTTON → CREATE TICKET
      if (interaction.customId === 'buy') {

        const channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: 0,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
              ]
            }
          ]
        });

        await channel.send({
          content: `🎫 New Order Ticket\nUser: ${interaction.user.tag}\nStaff will assist soon.`
        });

        return interaction.reply({
          content: `✅ Ticket created: ${channel}`,
          ephemeral: true
        });
      }

      // 📩 CONTACT BUTTON
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