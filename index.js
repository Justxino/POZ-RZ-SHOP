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
  console.log("🔥 PANEL LIVE on port 5000");
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

// ================= GET HIGHEST ADMIN ROLE =================
function getHighestAdminRole(guild) {
  const adminRoles = guild.roles.cache
    .filter(role =>
      role.name !== '@everyone' &&
      role.permissions.has(PermissionsBitField.Flags.Administrator)
    )
    .sort((a, b) => b.position - a.position);

  return adminRoles.first() || null;
}

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
          .setLabel('📩 Contact Admin')
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
🕹️ Tx-No clip per month ➜ $20
        `);

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
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

      const adminRole = getHighestAdminRole(interaction.guild);

      if (!adminRole) {
        return interaction.reply({
          content: '❌ No admin role found.',
          ephemeral: true
        });
      }

      // ================= BUY NOW =================
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
              id: adminRole.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
              ]
            },
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels
              ]
            }
          ]
        });

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger)
        );

        const ticketEmbed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🎫 NEW ORDER TICKET')
          .setDescription(`
👤 Customer: <@${interaction.user.id}>
🔔 Admins: <@&${adminRole.id}>

Please wait for support.
          `);

        await channel.send({
          content: `<@&${adminRole.id}>`,
          embeds: [ticketEmbed],
          components: [closeRow]
        });

        return interaction.editReply({
          content: `✅ Ticket created: ${channel}`
        });
      }

      // ================= CONTACT =================
      if (interaction.customId === 'contact') {

        await interaction.deferReply({ ephemeral: true });

        const channel = await interaction.guild.channels.create({
          name: `support-${interaction.user.username}`,
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
              id: adminRole.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
              ]
            },
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels
              ]
            }
          ]
        });

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger)
        );

        const supportEmbed = new EmbedBuilder()
          .setColor(0x00b0f4)
          .setTitle('📩 SUPPORT TICKET')
          .setDescription(`
👤 User: <@${interaction.user.id}>
🔔 Admins: <@&${adminRole.id}>

Staff will help you soon.
          `);

        await channel.send({
          content: `<@&${adminRole.id}>`,
          embeds: [supportEmbed],
          components: [closeRow]
        });

        return interaction.editReply({
          content: `✅ Support ticket created: ${channel}`
        });
      }

      // ================= CLOSE TICKET (ADMIN ONLY) =================
      if (interaction.customId === 'close_ticket') {

        if (!interaction.member.roles.cache.has(adminRole.id)) {
          return interaction.reply({
            content: '❌ Only admins can close this ticket.',
            ephemeral: true
          });
        }

        const closeEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🔒 Closing Ticket')
          .setDescription('This ticket will close in **3 seconds...**');

        await interaction.reply({
          embeds: [closeEmbed]
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