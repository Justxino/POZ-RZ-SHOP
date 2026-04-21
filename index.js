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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

// ================= EXPRESS =================
const app = express();
app.get('/', (req, res) => res.send('🟢 CRM ONLINE'));
app.listen(process.env.PORT || 5000, () => {
  console.log('🔥 CRM PANEL LIVE');
});

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ================= SIMPLE AI =================
function aiReply(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("price")) return "💰 Check /store for prices.";
  if (msg.includes("hello")) return "👋 Hello! Support will help you soon.";
  if (msg.includes("buy")) return "🛒 Use store to purchase.";
  if (msg.includes("help")) return "📌 Staff will assist you shortly.";
  if (msg.includes("status")) return "🟢 System is online.";

  return "🧠 AI: A staff member will respond shortly.";
}

// ================= TICKETS =================
const tickets = new Map();

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
          .setCustomId('support')
          .setLabel('📩 Support')
          .setStyle(ButtonStyle.Primary)
      );

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🟦 POZ RZ CRM STORE')
        .setDescription(`
💎 Coins Guns ➜ $20-$30

👕 Clothing Import ➜ $25

🔫 Gun Import ➜ $30

🚫 TX Unban ➜ $10

🔓 AC Unban ➜ $25

💊 Personal Drug ➜ $35

💰 Coins ➜ 10000 Diamonds = $10

🕹️ Tx-No clip per month ➜ $20
        `)
        .setFooter({ text: '🧠 CRM SYSTEM ACTIVE' });

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    // ================= CREATE TICKET =================
    if (interaction.isButton() && (interaction.customId === 'buy' || interaction.customId === 'support')) {

      await interaction.deferReply({ ephemeral: true });

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
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
          },
          {
            id: client.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      tickets.set(channel.id, {
        owner: interaction.user.id
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('claim')
          .setLabel('📌 Claim')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('close')
          .setLabel('🔒 Close')
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎫 CRM TICKET SYSTEM')
        .addFields(
          { name: '👤 User', value: `<@${interaction.user.id}>`, inline: true },
          { name: '📌 Status', value: '🟡 OPEN', inline: true },
          { name: '🧠 AI', value: 'ACTIVE', inline: false }
        )
        .setFooter({ text: 'CRM SUPPORT PANEL' });

      await channel.send({ embeds: [embed], components: [row] });

      return interaction.editReply(`✅ Ticket created: ${channel}`);
    }

    // ================= CLAIM =================
    if (interaction.isButton() && interaction.customId === 'claim') {

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: '❌ Staff only', ephemeral: true });
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00b0f4)
            .setTitle('📌 Ticket Claimed')
            .setDescription(`Claimed by <@${interaction.user.id}>`)
        ]
      });
    }

    // ================= CLOSE =================
    if (interaction.isButton() && interaction.customId === 'close') {

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: '❌ Admin only', ephemeral: true });
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🔒 Closing Ticket')
            .setDescription('Deleting in 3 seconds...')
        ]
      });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }

  } catch (err) {
    console.error(err);
  }
});

// ================= AI CHAT INSIDE TICKETS =================
client.on(Events.MessageCreate, async (message) => {

  if (message.author.bot) return;
  if (!tickets.has(message.channel.id)) return;

  const reply = aiReply(message.content);

  message.channel.send(`🧠 ${reply}`);
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);