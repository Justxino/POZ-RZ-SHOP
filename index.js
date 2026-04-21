require('dotenv').config();
const express = require('express');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Events,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

/* ======================================================
   CLIENT
====================================================== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

/* ======================================================
   CONFIG
====================================================== */
const PORT = process.env.PORT || 5000;

const BANNER =
  process.env.BANNER_URL ||
  'https://cdn.discordapp.com/attachments/1471825509859201129/1496007390435213332/content.png';

const COLOR = 0x4B6FFF;

/* ======================================================
   STORE ITEMS
====================================================== */
const ITEMS = [
  { label: '💎 Coins Guns', value: 'coins_guns', price: '$20-$30' },
  { label: '👕 Clothing Import', value: 'clothing', price: '$25' },
  { label: '🔫 Gun Import', value: 'gun_import', price: '$30' },
  { label: '🚫 TX Unban', value: 'tx_unban', price: '$10' },
  { label: '🔓 AC Unban', value: 'ac_unban', price: '$25' },
  { label: '💊 Personal Drug', value: 'drug', price: '$35' },
  { label: '💰 10000 Diamonds', value: 'diamonds', price: '$10' },
  { label: '🕹️ TX No-Clip / Month', value: 'noclip', price: '$20' }
];

/* ======================================================
   MEMORY TICKET DATABASE
====================================================== */
const ticketData = new Map();

/* ======================================================
   EXPRESS WEB PANEL
====================================================== */
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  const open = [...ticketData.values()].filter(t => t.status === 'OPEN').length;
  const claimed = [...ticketData.values()].filter(t => t.status === 'CLAIMED').length;
  const closed = [...ticketData.values()].filter(t => t.status === 'CLOSED').length;

  const ticketRows =
    [...ticketData.entries()]
      .map(([id, t], i) => {
        const sc = t.status.toLowerCase();
        const tag = t.ownerTag || t.owner;
        const ago = t.createdAt ? timeAgo(t.createdAt) : '-';

        return `
        <div class="queue-item">
          <div class="q-num">${i + 1}</div>
          <div class="q-avatar ${sc}">${(tag?.[0] || '?').toUpperCase()}</div>
          <div class="q-info">
            <div class="q-name">ticket-${tag}</div>
            <div class="q-meta">${t.item} · ${ago}</div>
          </div>
          <div class="q-badge ${sc}">${t.status}</div>
        </div>
      `;
      })
      .join('') || `<div class="empty">No tickets yet.</div>`;

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>POZ RZ SHOP</title>

<style>
body{
margin:0;
font-family:Arial;
background:#0d0d0d;
color:#fff;
}

.top{
padding:30px;
background:#101633;
}

.title{
font-size:38px;
font-weight:900;
}

.title span{
color:#4B6FFF;
}

.stats{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:12px;
margin-top:20px;
}

.card{
background:#1b1b1b;
padding:20px;
border-radius:12px;
}

.num{
font-size:32px;
font-weight:900;
}

.label{
font-size:12px;
color:#999;
margin-top:5px;
}

.main{
padding:30px;
}

.store{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(170px,1fr));
gap:12px;
margin-bottom:30px;
}

.store-card{
background:#1b1b1b;
padding:15px;
border-radius:12px;
}

.queue-item{
display:flex;
gap:12px;
align-items:center;
background:#1b1b1b;
padding:12px;
border-radius:10px;
margin-bottom:8px;
}

.q-avatar{
width:35px;
height:35px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
background:#4B6FFF;
font-weight:700;
}

.q-info{flex:1}
.q-meta{font-size:12px;color:#999}
.q-badge{
font-size:11px;
padding:5px 10px;
border-radius:20px;
background:#4B6FFF;
}
</style>
</head>
<body>

<div class="top">
<div class="title">POZ <span>RZ</span> SHOP</div>

<div class="stats">
<div class="card"><div class="num">${open}</div><div class="label">OPEN</div></div>
<div class="card"><div class="num">${claimed}</div><div class="label">CLAIMED</div></div>
<div class="card"><div class="num">${closed}</div><div class="label">CLOSED</div></div>
</div>
</div>

<div class="main">

<h3>Store Items</h3>
<div class="store">

<div class="store-card">💎 Coins Guns<br>$20-$30</div>
<div class="store-card">👕 Clothing Import<br>$25</div>
<div class="store-card">🔫 Gun Import<br>$30</div>
<div class="store-card">🚫 TX Unban<br>$10</div>
<div class="store-card">🔓 AC Unban<br>$25</div>
<div class="store-card">💊 Personal Drug<br>$35</div>
<div class="store-card">💰 10000 Diamonds<br>$10</div>
<div class="store-card">🕹️ TX No-Clip / Month<br>$20</div>

</div>

<h3>Ticket Queue</h3>
${ticketRows}

</div>

</body>
</html>
`);
});

app.get('/api/tickets', (req, res) => {
  res.json({
    total: ticketData.size,
    tickets: [...ticketData.entries()].map(([id, data]) => ({
      id,
      ...data
    }))
  });
});

app.listen(PORT, () => console.log('🔥 Web dashboard running'));

/* ======================================================
   READY
====================================================== */
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});
/* ======================================================
   24/7 KEEP ALIVE (REPLIT / RENDER / HOSTING FIX)
====================================================== */
const SELF_URL = process.env.SELF_URL; // your deployed URL

function keepAlive() {
  if (!SELF_URL) return;

  setInterval(() => {
    https.get(SELF_URL, (res) => {
      console.log(`🔄 Ping sent | Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log('⚠️ Keep-alive error:', err.message);
    });
  }, 4 * 60 * 1000); // every 4 minutes
}

keepAlive();

/* ======================================================
   INTERACTIONS
====================================================== */
client.on(Events.InteractionCreate, async interaction => {
  try {
    /* ================= STORE COMMAND ================= */
    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === 'store'
    ) {
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('store_select')
          .setPlaceholder('👀 Pick an item to buy...')
          .addOptions(
            ITEMS.map(i =>
              new StringSelectMenuOptionBuilder()
                .setLabel(i.label)
                .setValue(i.value)
                .setDescription(i.price)
            )
          )
      );

      const contactRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('contact')
          .setLabel('📩 Contact Admin')
          .setStyle(ButtonStyle.Secondary)
      );

      const embed = new EmbedBuilder()
        .setColor(COLOR)
        .setTitle('🛒 POZ RZ STORE')
        .setDescription(
          '> Pick an item from the dropdown below.\n\n' +

          '💎 **Coins Guns** ➜ $20-$30\n\n' +

          '👕 **Clothing Import** ➜ $25\n\n' +

          '🔫 **Gun Import** ➜ $30\n\n' +

          '🚫 **TX Unban** ➜ $10\n\n' +

          '🔓 **AC Unban** ➜ $25\n\n' +

          '💊 **Personal Drug** ➜ $35\n\n' +

          '💰 **Coins** ➜ 10000 Diamonds = $10\n\n' +

          '🕹️ **TX No-Clip per month** ➜ $20'
        )
        .setThumbnail(BANNER)
        .setFooter({
          text: 'POZ RZ SHOP • Select an item to get started'
        });

      return interaction.reply({
        embeds: [embed],
        components: [menu, contactRow]
      });
    }

    /* ================= SELECT MENU ================= */
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === 'store_select'
    ) {
      const item = ITEMS.find(i => i.value === interaction.values[0]);
      if (!item) return;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`buy:${item.value}`)
          .setLabel(`✅ Confirm ${item.price}`)
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('❌ Cancel')
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle('Confirm Purchase')
            .setDescription(
              `You selected **${item.label}**\n\nPrice: **${item.price}**`
            )
        ],
        components: [row],
        ephemeral: true
      });
    }

    /* ================= BUTTONS ================= */
    if (interaction.isButton()) {
      if (interaction.customId === 'cancel') {
        return interaction.update({
          content: '❌ Cancelled.',
          embeds: [],
          components: []
        });
      }

      if (interaction.customId === 'contact') {
        return openTicket(interaction, 'Contact Admin', '—');
      }

      if (interaction.customId.startsWith('buy:')) {
        const item = ITEMS.find(
          x => x.value === interaction.customId.split(':')[1]
        );

        if (!item) return;

        return openTicket(interaction, item.label, item.price);
      }

      if (interaction.customId === 'claim') {
        const t = ticketData.get(interaction.channel.id);
        if (t) {
          t.status = 'CLAIMED';
          t.claimedBy = interaction.user.id;
        }

        return interaction.reply('📌 Ticket claimed.');
      }

      if (interaction.customId === 'close') {
        const t = ticketData.get(interaction.channel.id);
        if (t) t.status = 'CLOSED';

        await interaction.reply('🔒 Closing in 3 seconds...');
        setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 3000);
      }
    }
  } catch (err) {
    console.error(err);
  }
});

/* ======================================================
   OPEN TICKET
====================================================== */
async function openTicket(interaction, itemName, price) {
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

  ticketData.set(channel.id, {
    owner: interaction.user.id,
    ownerTag: interaction.user.username,
    item: itemName,
    status: 'OPEN',
    createdAt: Date.now()
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

  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(COLOR)
        .setTitle('🎫 NEW TICKET')
        .addFields(
          { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Item', value: itemName, inline: true },
          { name: 'Price', value: price, inline: true },
          { name: 'Status', value: 'OPEN', inline: true }
        )
        .setThumbnail(BANNER)
    ],
    components: [row]
  });

  return interaction.editReply({
    content: `✅ Ticket created: ${channel}`
  });
}

/* ======================================================
   HELPERS
====================================================== */
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);

  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;

  return `${Math.floor(s / 86400)}d ago`;
}

/* ======================================================
   LOGIN
====================================================== */
client.login(process.env.DISCORD_TOKEN);