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
  PermissionsBitField,
  ChannelType
} = require('discord.js');

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ================= EXPRESS =================
const app = express();
app.get('/', (req, res) => res.send('🟢 POZ RZ CRM ONLINE'));
app.listen(process.env.PORT || 5000, () => console.log('🔥 CRM LIVE'));

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ================= SIMPLE AI ENGINE =================
function aiReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("price")) return "💰 Check the store panel for updated prices.";
  if (msg.includes("hello")) return "👋 Hello! A staff member will assist you soon.";
  if (msg.includes("buy")) return "🛒 Use the store button to place an order.";
  if (msg.includes("help")) return "📌 Support is on the way. Please wait...";

  return "🧠 AI: A staff member will handle this shortly.";
}

// ================= TICKET STORAGE =================
const ticketData = new Map();

// ================= INTERACTIONS =================
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    // ================= STORE (UNCHANGED) =================
    if (interaction.isChatInputCommand() && interaction.commandName === 'store') {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('buy').setLabel('🛒 Buy').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('contact').setLabel('📩 Support').setStyle(ButtonStyle.Primary)
      );

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🛒 POZ RZ STORE')
        .setDescription(`
💎 Coins Guns ➜ $20-$30

👕 Clothing Import ➜ $25

🔫 Gun Import ➜ $30

🚫 TX Unban ➜ $10

🔓 AC Unban ➜ $25

💊 Personal Drug ➜ $35

💰 Coins ➜ 10000 Diamonds = $10

🕹️ Tx-No clip per month ➜ $20
        `);

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    // ================= CREATE TICKET =================
    if (interaction.isButton() && (interaction.customId === 'buy' || interaction.customId === 'contact')) {

      await interaction.deferReply({ ephemeral: true });

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });

      ticketData.set(channel.id, {
        owner: interaction.user.id,
        claimed: null,
        status: "🟡 OPEN"
      });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('claim').setLabel('📌 Claim').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('close').setLabel('🔒 Close').setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎫 CRM TICKET SYSTEM')
        .addFields(
          { name: '👤 User', value: `<@${interaction.user.id}>` },
          { name: '📌 Status', value: '🟡 OPEN' },
          { name: '🤖 AI', value: 'Active' }
        );

      await channel.send({ embeds: [embed], components: [buttons] });

      return interaction.editReply(`✅ Ticket created: ${channel}`);
    }

    // ================= CLAIM =================
    if (interaction.isButton() && interaction.customId === 'claim') {

      const data = ticketData.get(interaction.channel.id);
      if (!data) return;

      data.claimed = interaction.user.id;
      data.status = "🟢 CLAIMED";

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('📌 Ticket Claimed')
        .setDescription(`Claimed by <@${interaction.user.id}>`);

      return interaction.reply({ embeds: [embed] });
    }

    // ================= CLOSE =================
    if (interaction.isButton() && interaction.customId === 'close') {

      const data = ticketData.get(interaction.channel.id);
      if (!data) return;

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: '❌ Admin only', ephemeral: true });
      }

      data.status = "🔴 CLOSED";

      await interaction.reply('🔒 Closing ticket...');

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }

  } catch (err) {
    console.error(err);
  }
});

// ================= AI CHAT INSIDE TICKET =================
client.on(Events.MessageCreate, async (message) => {

  if (message.author.bot) return;
  if (!ticketData.has(message.channel.id)) return;

  const reply = aiReply(message.content);

  message.channel.send(`🧠 ${reply}`);
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);