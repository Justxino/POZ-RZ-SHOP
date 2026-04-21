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
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ================= EXPRESS =================
const app = express();
app.get('/', (req, res) => res.send('🟢 CRM V3 ONLINE'));
app.listen(process.env.PORT || 5000, () => {
  console.log('🔥 CRM V3 LIVE');
});

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ================= TICKET DATABASE =================
const ticketData = new Map();

// ================= INTERACTIONS =================
client.on(Events.InteractionCreate, async (interaction) => {

  try {

    // =================================================
    // SLASH COMMANDS
    // =================================================
    if (interaction.isChatInputCommand()) {

      // ================= STORE (UNCHANGED) =================
      if (interaction.commandName === 'store') {

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('buy')
            .setLabel('🛒 Buy Now')
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId('contact')
            .setLabel('📩 Contact Admin')
            .setStyle(ButtonStyle.Primary)
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
          `)
          .setFooter({ text: 'CRM SYSTEM ACTIVE' });

        return interaction.reply({ embeds: [embed], components: [row] });
      }

      // ================= DASHBOARD =================
      if (interaction.commandName === 'dashboard') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({ content: '❌ Admin only', ephemeral: true });
        }

        const open = [...ticketData.values()].filter(t => t.status === 'OPEN').length;
        const claimed = [...ticketData.values()].filter(t => t.status === 'CLAIMED').length;
        const closed = [...ticketData.values()].filter(t => t.status === 'CLOSED').length;

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865F2)
              .setTitle('👑 CRM ADMIN DASHBOARD')
              .addFields(
                { name: '🟢 Open', value: `${open}`, inline: true },
                { name: '📌 Claimed', value: `${claimed}`, inline: true },
                { name: '🔴 Closed', value: `${closed}`, inline: true }
              )
              .setFooter({ text: 'LIVE CRM SYSTEM' })
          ],
          ephemeral: true
        });
      }
    }

    // =================================================
    // BUTTONS
    // =================================================
    if (interaction.isButton()) {

      // ================= CREATE TICKET =================
      if (interaction.customId === 'buy' || interaction.customId === 'contact') {

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

        // ================= SAVE TICKET =================
        ticketData.set(channel.id, {
          owner: interaction.user.id,
          status: 'OPEN',
          claimedBy: null
        });

        const buttons = new ActionRowBuilder().addComponents(
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
          .setTitle('🎫 SUPPORT TICKET')
          .addFields(
            { name: '👤 User', value: `<@${interaction.user.id}>`, inline: true },
            { name: '📌 Status', value: '🟢 OPEN', inline: true },
            { name: '🧠 System', value: 'CRM ACTIVE', inline: false }
          )
          .setFooter({ text: 'POZ RZ CRM SYSTEM' });

        await channel.send({ embeds: [embed], components: [buttons] });

        return interaction.editReply(`✅ Ticket created: ${channel}`);
      }

      // ================= CLAIM =================
      if (interaction.customId === 'claim') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return interaction.reply({ content: '❌ Staff only', ephemeral: true });
        }

        const ticket = ticketData.get(interaction.channel.id);
        if (ticket) {
          ticket.status = 'CLAIMED';
          ticket.claimedBy = interaction.user.id;
          ticketData.set(interaction.channel.id, ticket);
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
      if (interaction.customId === 'close') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({ content: '❌ Admin only', ephemeral: true });
        }

        const ticket = ticketData.get(interaction.channel.id);
        if (ticket) {
          ticket.status = 'CLOSED';
          ticketData.set(interaction.channel.id, ticket);
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
    }

  } catch (err) {
    console.error(err);
  }
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);