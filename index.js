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

app.get('/', (req, res) => {
  res.send('POZ RZ PANEL LIVE 🟢');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 PANEL LIVE on port ${PORT}`);
});

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ================= ERROR =================
client.on('error', console.error);
process.on('unhandledRejection', console.error);

// ================= TOP 2 ADMIN ROLES =================
function getTopAdminRoles(guild) {
  return guild.roles.cache
    .filter(role =>
      role.name !== '@everyone' &&
      role.permissions.has(PermissionsBitField.Flags.Administrator)
    )
    .sort((a, b) => b.position - a.position)
    .first(2);
}

function canClose(member, roles) {
  return roles.some(role => member.roles.cache.has(role.id));
}

// ================= INTERACTIONS =================
client.on(Events.InteractionCreate, async (interaction) => {
  try {

    // =================================================
    // SLASH COMMANDS
    // =================================================
    if (interaction.isChatInputCommand()) {

      // ================= STORE =================
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
          .setColor(0x3498db)
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

        return interaction.reply({
          embeds: [embed],
          components: [row]
        });
      }

      // ================= HELP =================
      if (interaction.commandName === 'help') {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2ecc71)
              .setTitle('📌 COMMAND LIST')
              .setDescription(`
/store
/help
/ping
/avatar
/serverinfo
/lock
/unlock
/callnow
/move
              `)
          ]
        });
      }

      // ================= PING =================
      if (interaction.commandName === 'ping') {
        return interaction.reply(`🏓 Pong: ${client.ws.ping}ms`);
      }

      // ================= AVATAR =================
      if (interaction.commandName === 'avatar') {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865F2)
              .setTitle(`${interaction.user.username}'s Avatar`)
              .setImage(interaction.user.displayAvatarURL({ size: 1024 }))
          ]
        });
      }

      // ================= SERVERINFO =================
      if (interaction.commandName === 'serverinfo') {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x00b0f4)
              .setTitle(interaction.guild.name)
              .addFields(
                { name: '👥 Members', value: `${interaction.guild.memberCount}`, inline: true },
                { name: '📁 Channels', value: `${interaction.guild.channels.cache.size}`, inline: true },
                { name: '🎭 Roles', value: `${interaction.guild.roles.cache.size}`, inline: true }
              )
          ]
        });
      }

      // ================= LOCK =================
      if (interaction.commandName === 'lock') {

        await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: false
        });

        return interaction.reply('🔒 Channel locked.');
      }

      // ================= UNLOCK =================
      if (interaction.commandName === 'unlock') {

        await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: true
        });

        return interaction.reply('🔓 Channel unlocked.');
      }

      // ================= CALLNOW =================
      if (interaction.commandName === 'callnow') {

        const vc = interaction.member.voice.channel;

        if (!vc) {
          return interaction.reply({
            content: '❌ Join a voice channel first.',
            ephemeral: true
          });
        }

        const users = vc.members
          .filter(m => !m.user.bot)
          .map(m => `<@${m.id}>`)
          .join(' ');

        return interaction.reply(`📞 CALL NOW!\n${users}`);
      }

      // ================= MOVE =================
      if (interaction.commandName === 'move') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
          return interaction.reply({
            content: '❌ No permission.',
            ephemeral: true
          });
        }

        const vc = interaction.member.voice.channel;

        if (!vc) {
          return interaction.reply({
            content: '❌ Join voice first.',
            ephemeral: true
          });
        }

        const channels = interaction.guild.channels.cache
          .filter(c => c.type === ChannelType.GuildVoice);

        const target = channels.find(c => c.id !== vc.id);

        if (!target) {
          return interaction.reply('❌ No other voice channel found.');
        }

        await interaction.member.voice.setChannel(target);

        return interaction.reply(`🚚 Moved to **${target.name}**`);
      }
    }

    // =================================================
    // BUTTONS
    // =================================================
    if (interaction.isButton()) {

      const adminRoles = getTopAdminRoles(interaction.guild);

      if (adminRoles.length === 0) {
        return interaction.reply({
          content: '❌ No admin roles found.',
          ephemeral: true
        });
      }

      const mentions = adminRoles.map(r => `<@&${r.id}>`).join(' ');

      // ================= CREATE TICKET =================
      if (interaction.customId === 'buy' || interaction.customId === 'contact') {

        await interaction.deferReply({ ephemeral: true });

        const channel = await interaction.guild.channels.create({
          name:
            interaction.customId === 'buy'
              ? `ticket-${interaction.user.username}`
              : `support-${interaction.user.username}`,

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
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels
              ]
            },
            ...adminRoles.map(role => ({
              id: role.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages
              ]
            }))
          ]
        });

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('🔒 Close Ticket')
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
          content: mentions,
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865F2)
              .setTitle('🎫 NEW TICKET')
              .setDescription(`
👤 User: <@${interaction.user.id}>
🔔 Staff: ${mentions}

Please wait for support.
              `)
          ],
          components: [closeRow]
        });

        return interaction.editReply(`✅ Ticket created: ${channel}`);
      }

      // ================= CLOSE TICKET =================
      if (interaction.customId === 'close_ticket') {

        if (!canClose(interaction.member, adminRoles)) {
          return interaction.reply({
            content: '❌ Only top admins can close tickets.',
            ephemeral: true
          });
        }

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle('🔒 Closing Ticket')
              .setDescription('Deleting in **3 seconds...**')
          ]
        });

        setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 3000);
      }
    }

  } catch (err) {
    console.error(err);

    if (!interaction.replied && !interaction.deferred) {
      interaction.reply({
        content: '❌ Something went wrong.',
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);