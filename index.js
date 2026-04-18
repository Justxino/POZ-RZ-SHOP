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
    GatewayIntentBits.GuildMessages
  ]
});

// ================= EXPRESS =================
const app = express();

app.get('/', (req, res) => {
  res.send('POZ RZ PANEL LIVE 🟢');
});

app.listen(5000, '0.0.0.0', () => {
  console.log("🔥 PANEL LIVE");
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
        .setTitle('🛒 POZ RZ STORE')
        .setDescription(`
💎 Coins Guns ➜ $20-$30  
👕 Clothing Import ➜ $25  
🔫 Gun Import ➜ $30  
🚫 TX Unban ➜ $10  
🔓 AC Unban ➜ $25  
💊 Personal Drug ➜ $35  
💰 Coins ➜ 100 Diamonds = $10
        `);

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    // ================= HELP =================
    if (interaction.isChatInputCommand() && interaction.commandName === 'help') {

      const help = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('📌 POZ RZ HELP')
        .setDescription(`/store - Shop\n/help - Commands`);

      return interaction.reply({ embeds: [help] });
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {

      // 🛒 BUY → CREATE TICKET
      if (interaction.customId === 'buy') {

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
              id: interaction.client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels
              ]
            }
          ]
        });

        // CLOSE BUTTON
        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
          content: `🎫 **NEW TICKET**\nUser: ${interaction.user.tag}\n\nClick below to close this ticket.`,
          components: [closeRow]
        });

        return interaction.editReply(`✅ Ticket created: ${channel}`);
      }

      // 📩 CONTACT
      if (interaction.customId === 'contact') {
        return interaction.reply({
          content: `📩 DM <@${interaction.user.id}> for support.`,
          ephemeral: true
        });
      }

      // 🔒 CLOSE TICKET
      if (interaction.customId === 'close_ticket') {

        await interaction.reply({
          content: "🔒 Closing ticket in 3 seconds...",
          ephemeral: true
        });

        setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 3000);
      }
    }

  } catch (err) {
    console.error("ERROR:", err);

    if (!interaction.replied && !interaction.deferred) {
      interaction.reply({
        content: "❌ Something went wrong.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);