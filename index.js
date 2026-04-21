require('dotenv').config();
const express = require('express');
const https   = require('https');
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
const PORT   = process.env.PORT   || 5000;
const BANNER = process.env.BANNER_URL ||
  'https://cdn.discordapp.com/attachments/1471825509859201129/1496007390435213332/content.png';
const COLOR  = 0x4B6FFF;

/* ======================================================
   STORE ITEMS
====================================================== */
const ITEMS = [
  { label: '💎 Coins Guns',          value: 'coins_guns', price: '$20-$30' },
  { label: '👕 Clothing Import',     value: 'clothing',   price: '$25'     },
  { label: '🔫 Gun Import',          value: 'gun_import', price: '$30'     },
  { label: '🚫 TX Unban',            value: 'tx_unban',   price: '$10'     },
  { label: '🔓 AC Unban',            value: 'ac_unban',   price: '$25'     },
  { label: '💊 Personal Drug',       value: 'drug',       price: '$35'     },
  { label: '💰 10000 Diamonds',      value: 'diamonds',   price: '$10'     },
  { label: '🕹️ TX No-Clip / Month',  value: 'noclip',     price: '$20'     }
];

/* ======================================================
   TICKET DATABASE
====================================================== */
const ticketData = new Map();

/* ======================================================
   EXPRESS WEB PANEL
====================================================== */
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  const open    = [...ticketData.values()].filter(t => t.status === 'OPEN').length;
  const claimed = [...ticketData.values()].filter(t => t.status === 'CLAIMED').length;
  const closed  = [...ticketData.values()].filter(t => t.status === 'CLOSED').length;

  const ticketRows = [...ticketData.entries()].map(([id, t], i) => {
    const sc  = t.status.toLowerCase();
    const tag = t.ownerTag || t.owner;
    const ago = t.createdAt ? timeAgo(t.createdAt) : '-';
    return `
    <div class="queue-item">
      <div class="q-num">${i + 1}</div>
      <div class="q-avatar ${sc}">${(tag?.[0] || '?').toUpperCase()}</div>
      <div class="q-info">
        <div class="q-name">ticket-${tag}</div>
        <div class="q-meta">${t.item} &middot; ${ago}</div>
      </div>
      <div class="q-badge ${sc}">${t.status}</div>
    </div>`;
  }).join('') || '<div class="empty">No tickets yet 🎧</div>';

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>POZ RZ SHOP</title>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--poz:#4B6FFF;--green:#1DB954;--blue:#1EAAE8;--red:#E85555;--black:#0a0a0a;--card:#1c1c1c;--hover:#252525;--border:rgba(255,255,255,.07);--muted:#8a8a8a;--font:'Figtree',sans-serif;}
html,body{min-height:100vh;background:var(--black);color:#fff;font-family:var(--font);}
.layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh;}
.sidebar{background:#0f0f0f;border-right:1px solid var(--border);padding:24px 18px;display:flex;flex-direction:column;gap:28px;position:sticky;top:0;height:100vh;overflow-y:auto;}
.logo-area{display:flex;align-items:center;gap:11px;}
.logo-img{width:40px;height:40px;border-radius:50%;object-fit:cover;background:var(--poz);flex-shrink:0;}
.logo-name{font-size:17px;font-weight:800;letter-spacing:-.3px;}
.logo-name span{color:var(--poz);}
.logo-sub{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;}
.nav-label{font-size:9px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;padding-left:10px;}
.nav-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:7px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer;text-decoration:none;transition:all .15s;}
.nav-item:hover,.nav-item.active{background:var(--card);color:#fff;}
.nav-item.active{color:var(--poz);}
.sidebar-footer{margin-top:auto;}
.bot-status{display:flex;align-items:center;gap:9px;background:var(--card);padding:11px 13px;border-radius:9px;}
.status-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;flex-shrink:0;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.status-name{font-size:12px;font-weight:700;}
.status-label{font-size:10px;color:var(--green);}
.main{overflow-y:auto;}
.hero{background:linear-gradient(180deg,#0d0f2b 0%,#080a1a 55%,transparent 100%);padding:36px 32px 28px;}
.hero-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;}
.hero-title{font-size:32px;font-weight:900;letter-spacing:-1px;line-height:1.1;}
.hero-title span{color:var(--poz);}
.hero-sub{font-size:12px;color:var(--muted);margin-top:5px;}
.refresh-btn{background:var(--card);border:1px solid var(--border);color:var(--muted);padding:7px 13px;border-radius:18px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s;}
.refresh-btn:hover{color:#fff;}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.stat-card{background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:11px;padding:16px 18px;}
.stat-num{font-size:28px;font-weight:900;line-height:1;}
.stat-label{font-size:10px;color:var(--muted);margin-top:4px;letter-spacing:1.5px;text-transform:uppercase;}
.stat-card.open .stat-num{color:var(--green);}
.stat-card.claimed .stat-num{color:var(--blue);}
.stat-card.closed .stat-num{color:var(--red);}
.content{padding:24px 32px 40px;display:flex;flex-direction:column;gap:28px;}
.section-title{font-size:10px;font-weight:700;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;}
.store-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:10px;}
.store-card{background:var(--card);border:1px solid var(--border);border-radius:9px;padding:15px 12px;cursor:pointer;transition:all .18s;position:relative;overflow:hidden;}
.store-card::after{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--poz);opacity:0;transition:opacity .15s;}
.store-card:hover{background:var(--hover);transform:translateY(-2px);}
.store-card:hover::after{opacity:1;}
.store-icon{font-size:20px;margin-bottom:8px;}
.store-name{font-size:12px;font-weight:700;margin-bottom:6px;}
.store-price{font-size:11px;font-weight:700;color:var(--poz);background:rgba(75,111,255,.12);display:inline-block;padding:2px 8px;border-radius:12px;}
.queue{display:flex;flex-direction:column;gap:6px;}
.queue-item{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--border);padding:10px 14px;border-radius:9px;}
.q-num{font-size:11px;color:var(--muted);width:16px;text-align:center;flex-shrink:0;}
.q-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;}
.q-avatar.open{background:rgba(29,185,84,.15);color:var(--green);}
.q-avatar.claimed{background:rgba(30,170,232,.15);color:var(--blue);}
.q-avatar.closed{background:rgba(232,85,85,.15);color:var(--red);}
.q-info{flex:1;min-width:0;}
.q-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.q-meta{font-size:11px;color:var(--muted);margin-top:1px;}
.q-badge{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:3px 8px;border-radius:12px;flex-shrink:0;}
.q-badge.open{background:rgba(29,185,84,.15);color:var(--green);}
.q-badge.claimed{background:rgba(30,170,232,.15);color:var(--blue);}
.q-badge.closed{background:rgba(232,85,85,.15);color:var(--red);}
.empty{font-size:13px;color:var(--muted);padding:20px;text-align:center;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px;}
@media(max-width:700px){.layout{grid-template-columns:1fr;}.sidebar{display:none;}.hero,.content{padding-left:18px;padding-right:18px;}}
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="logo-area">
      <img class="logo-img" src="${BANNER}" onerror="this.style.background='#4B6FFF';this.removeAttribute('src')" alt="POZ"/>
      <div>
        <div class="logo-name">POZ <span>RZ</span></div>
        <div class="logo-sub">POZ RZ SHOP</div>
      </div>
    </div>
    <nav>
      <div class="nav-label">Menu</div>
      <a class="nav-item active" href="/">🏠 Dashboard</a>
      <a class="nav-item" href="/api/tickets">🎫 Tickets JSON</a>
    </nav>
    <nav>
      <div class="nav-label">Store</div>
      <div class="nav-item">💎 Coins &amp; Guns</div>
      <div class="nav-item">🔓 Unbans</div>
      <div class="nav-item">💊 Specials</div>
    </nav>
    <div class="sidebar-footer">
      <div class="bot-status">
        <div class="status-dot"></div>
        <div>
          <div class="status-name">POZ RZ SHOP</div>
          <div class="status-label">Online</div>
        </div>
      </div>
    </div>
  </aside>
  <main class="main">
    <div class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-title">Good evening,<br><span>Admin 👑</span></div>
          <div class="hero-sub">POZ RZ SHOP · Live Dashboard</div>
        </div>
        <button class="refresh-btn" onclick="location.reload()">↻ Refresh</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card open"><div class="stat-num">${open}</div><div class="stat-label">Open</div></div>
        <div class="stat-card claimed"><div class="stat-num">${claimed}</div><div class="stat-label">Claimed</div></div>
        <div class="stat-card closed"><div class="stat-num">${closed}</div><div class="stat-label">Closed</div></div>
      </div>
    </div>
    <div class="content">
      <section>
        <div class="section-title">Store items</div>
        <div class="store-grid">
          <div class="store-card"><div class="store-icon">💎</div><div class="store-name">Coins Guns</div><div class="store-price">$20-$30</div></div>
          <div class="store-card"><div class="store-icon">👕</div><div class="store-name">Clothing Import</div><div class="store-price">$25</div></div>
          <div class="store-card"><div class="store-icon">🔫</div><div class="store-name">Gun Import</div><div class="store-price">$30</div></div>
          <div class="store-card"><div class="store-icon">🚫</div><div class="store-name">TX Unban</div><div class="store-price">$10</div></div>
          <div class="store-card"><div class="store-icon">🔓</div><div class="store-name">AC Unban</div><div class="store-price">$25</div></div>
          <div class="store-card"><div class="store-icon">💊</div><div class="store-name">Personal Drug</div><div class="store-price">$35</div></div>
          <div class="store-card"><div class="store-icon">💰</div><div class="store-name">10k Diamonds</div><div class="store-price">$10</div></div>
          <div class="store-card"><div class="store-icon">🕹️</div><div class="store-name">TX No-Clip / mo</div><div class="store-price">$20</div></div>
        </div>
      </section>
      <section>
        <div class="section-title">Ticket queue</div>
        <div class="queue">${ticketRows}</div>
      </section>
    </div>
  </main>
</div>
</body>
</html>`);
});

app.get('/api/tickets', (req, res) => {
  res.json({ total: ticketData.size, tickets: [...ticketData.entries()].map(([id, d]) => ({ id, ...d })) });
});

app.listen(PORT, () => console.log(`🔥 POZ RZ SHOP LIVE on port ${PORT}`));

/* ======================================================
   KEEP ALIVE — pings itself every 4 min so Replit never sleeps
====================================================== */
function keepAlive() {
  const url = process.env.SELF_URL;
  if (!url) return console.log('⚠️  Set SELF_URL in Secrets to enable keep-alive');

  setInterval(() => {
    https.get(url, res => {
      console.log(`🔄 Keep-alive ping | ${res.statusCode}`);
    }).on('error', err => {
      console.log('⚠️  Keep-alive error:', err.message);
    });
  }, 4 * 60 * 1000);

  console.log(`✅ Keep-alive active → ${url}`);
}

/* ======================================================
   READY
====================================================== */
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  keepAlive();
});

/* ======================================================
   INTERACTIONS
====================================================== */
client.on(Events.InteractionCreate, async interaction => {
  try {

    /* ---- STORE COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'store') {
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('store_select')
          .setPlaceholder('👀 Pick an item to buy...')
          .addOptions(ITEMS.map(i =>
            new StringSelectMenuOptionBuilder()
              .setLabel(i.label)
              .setValue(i.value)
              .setDescription(i.price)
          ))
      );
      const contactRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('contact').setLabel('📩 Contact Admin').setStyle(ButtonStyle.Secondary)
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
        .setFooter({ text: 'POZ RZ SHOP • Select an item to get started' });
      return interaction.reply({ embeds: [embed], components: [menu, contactRow] });
    }

    /* ---- PING COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'ping') {
      const latency = Date.now() - interaction.createdTimestamp;
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🏓 Pong!')
            .addFields(
              { name: '⚡ Bot Latency',     value: `${latency}ms`,                        inline: true },
              { name: '📡 API Latency',     value: `${client.ws.ping}ms`,                 inline: true },
              { name: '🟢 Status',          value: 'Online',                               inline: true }
            )
            .setFooter({ text: 'POZ RZ SHOP' })
        ],
        ephemeral: true
      });
    }

    /* ---- HELP COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'help') {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x4B6FFF)
            .setTitle('📋 POZ RZ SHOP — Commands')
            .setThumbnail(BANNER)
            .setDescription('Here are all available commands:')
            .addFields(
              { name: '/store',     value: 'Browse and buy items from the shop',   inline: false },
              { name: '/ping',      value: 'Check bot latency and status',          inline: false },
              { name: '/dashboard', value: 'View admin dashboard (admin only)',     inline: false },
              { name: '/help',      value: 'Show this help menu',                  inline: false }
            )
            .setFooter({ text: 'POZ RZ SHOP • Use /store to get started' })
        ],
        ephemeral: true
      });
    }

    /* ---- AVATAR COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'avatar') {
      const target = interaction.options.getUser('user') || interaction.user;
      const url = target.displayAvatarURL({ size: 512, extension: 'png' });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle(`${target.username}'s Avatar`)
            .setImage(url)
            .setFooter({ text: 'POZ RZ SHOP' })
        ]
      });
    }

    /* ---- SERVERINFO COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'serverinfo') {
      const g = interaction.guild;
      await g.members.fetch();
      const online = g.members.cache.filter(m => m.presence?.status !== 'offline' && m.presence?.status).size;
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle(`${g.name}`)
            .setThumbnail(g.iconURL({ size: 256 }))
            .addFields(
              { name: '👑 Owner',       value: `<@${g.ownerId}>`,                           inline: true },
              { name: '👥 Members',     value: `${g.memberCount}`,                          inline: true },
              { name: '🟢 Online',      value: `${online || '—'}`,                          inline: true },
              { name: '💬 Channels',    value: `${g.channels.cache.size}`,                  inline: true },
              { name: '🎭 Roles',       value: `${g.roles.cache.size}`,                     inline: true },
              { name: '📅 Created',     value: `<t:${Math.floor(g.createdTimestamp/1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'POZ RZ SHOP' })
        ]
      });
    }

    /* ---- LOCK COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'lock') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({ content: '❌ Admin only', ephemeral: true });
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false
      });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔒 Channel Locked')
            .setDescription(`${interaction.channel} has been locked by <@${interaction.user.id}>`)
            .setFooter({ text: 'POZ RZ SHOP' })
        ]
      });
    }

    /* ---- UNLOCK COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'unlock') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({ content: '❌ Admin only', ephemeral: true });
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: null
      });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🔓 Channel Unlocked')
            .setDescription(`${interaction.channel} has been unlocked by <@${interaction.user.id}>`)
            .setFooter({ text: 'POZ RZ SHOP' })
        ]
      });
    }

    /* ---- CALLNOW COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'callnow') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({ content: '❌ Admin only', ephemeral: true });
      await interaction.guild.members.fetch();
      const vcMembers = interaction.guild.members.cache.filter(
        m => m.voice.channel && !m.user.bot
      );
      if (!vcMembers.size)
        return interaction.reply({ content: '❌ No members in voice channels.', ephemeral: true });
      const mentions = vcMembers.map(m => `<@${m.id}>`).join(' ');
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle('📢 CALL NOW')
            .setDescription(`${mentions}

Get in the call!`)
            .setFooter({ text: `POZ RZ SHOP • ${vcMembers.size} members pinged` })
        ]
      });
    }

    /* ---- MOVE COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'move') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers))
        return interaction.reply({ content: '❌ You need Move Members permission.', ephemeral: true });
      const target  = interaction.options.getMember('user');
      const channel = interaction.options.getChannel('channel');
      if (!target.voice.channel)
        return interaction.reply({ content: '❌ That user is not in a voice channel.', ephemeral: true });
      await target.voice.setChannel(channel);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle('🔀 Member Moved')
            .setDescription(`<@${target.id}> was moved to **${channel.name}** by <@${interaction.user.id}>`)
            .setFooter({ text: 'POZ RZ SHOP' })
        ]
      });
    }

    /* ---- DASHBOARD COMMAND ---- */
    if (interaction.isChatInputCommand() && interaction.commandName === 'dashboard') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return interaction.reply({ content: '❌ Admin only', ephemeral: true });
      const open    = [...ticketData.values()].filter(t => t.status === 'OPEN').length;
      const claimed = [...ticketData.values()].filter(t => t.status === 'CLAIMED').length;
      const closed  = [...ticketData.values()].filter(t => t.status === 'CLOSED').length;
      const host    = process.env.SELF_URL || `http://localhost:${PORT}`;
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLOR)
            .setTitle('👑 POZ RZ SHOP DASHBOARD')
            .setThumbnail(BANNER)
            .addFields(
              { name: '🟢 Open',          value: `${open}`,    inline: true },
              { name: '📌 Claimed',       value: `${claimed}`, inline: true },
              { name: '🔴 Closed',        value: `${closed}`,  inline: true },
              { name: '🌐 Web Dashboard', value: host,          inline: false }
            )
            .setFooter({ text: 'POZ RZ SHOP' })
        ],
        ephemeral: true
      });
    }

    /* ---- SELECT MENU ---- */
    if (interaction.isStringSelectMenu() && interaction.customId === 'store_select') {
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
            .setTitle('🛒 Confirm Purchase')
            .setDescription(`You selected **${item.label}**\n\nPrice: **${item.price}**`)
            .setThumbnail(BANNER)
            .setFooter({ text: 'POZ RZ SHOP' })
        ],
        components: [row],
        ephemeral: true
      });
    }

    /* ---- BUTTONS ---- */
    if (interaction.isButton()) {

      if (interaction.customId === 'cancel')
        return interaction.update({ content: '❌ Cancelled.', embeds: [], components: [] });

      if (interaction.customId === 'contact')
        return openTicket(interaction, 'Contact Admin', '—');

      if (interaction.customId.startsWith('buy:')) {
        const item = ITEMS.find(x => x.value === interaction.customId.split(':')[1]);
        if (!item) return;
        return openTicket(interaction, item.label, item.price);
      }

      if (interaction.customId === 'claim') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
          return interaction.reply({ content: '❌ Staff only', ephemeral: true });
        const t = ticketData.get(interaction.channel.id);
        if (t) { t.status = 'CLAIMED'; t.claimedBy = interaction.user.id; }
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x1EAAE8)
              .setTitle('📌 Ticket Claimed')
              .setDescription(`Claimed by <@${interaction.user.id}>`)
              .setFooter({ text: 'POZ RZ SHOP' })
          ]
        });
      }

      if (interaction.customId === 'close') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
          return interaction.reply({ content: '❌ Admin only', ephemeral: true });
        const t = ticketData.get(interaction.channel.id);
        if (t) t.status = 'CLOSED';
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xED4245)
              .setTitle('🔒 Closing Ticket')
              .setDescription('This ticket will be deleted in **3 seconds**...')
              .setFooter({ text: 'POZ RZ SHOP' })
          ]
        });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
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
      { id: interaction.guild.id, deny:  [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id,  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      { id: client.user.id,       allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
    ]
  });

  ticketData.set(channel.id, {
    owner:    interaction.user.id,
    ownerTag: interaction.user.username,
    item:     itemName,
    status:   'OPEN',
    claimedBy: null,
    createdAt: Date.now()
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('claim').setLabel('📌 Claim').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('close').setLabel('🔒 Close').setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(COLOR)
        .setTitle('🎫 NEW TICKET — POZ RZ SHOP')
        .setDescription(`Welcome <@${interaction.user.id}>! Staff will be with you shortly.\n\nPlease describe what you need below.`)
        .addFields(
          { name: '👤 User',    value: `<@${interaction.user.id}>`, inline: true },
          { name: '🛒 Item',    value: itemName,                     inline: true },
          { name: '💰 Price',   value: price,                        inline: true },
          { name: '📌 Status',  value: '🟢 OPEN',                   inline: true }
        )
        .setThumbnail(BANNER)
        .setFooter({ text: 'POZ RZ SHOP' })
        .setTimestamp()
    ],
    components: [row]
  });

  return interaction.editReply({ content: `✅ Ticket created: ${channel}` });
}

/* ======================================================
   HELPERS
====================================================== */
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* ======================================================
   LOGIN
====================================================== */
client.login(process.env.DISCORD_TOKEN);