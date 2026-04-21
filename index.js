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

// ================= TICKET DATABASE =================
const ticketData = new Map();

// ================= EXPRESS =================
const app = express();
app.use(express.json());

// ---- DASHBOARD PAGE ----
app.get('/', (req, res) => {
  const open    = [...ticketData.values()].filter(t => t.status === 'OPEN').length;
  const claimed = [...ticketData.values()].filter(t => t.status === 'CLAIMED').length;
  const closed  = [...ticketData.values()].filter(t => t.status === 'CLOSED').length;

  const ticketRows = [...ticketData.entries()].map(([id, t], i) => {
    const statusClass = t.status.toLowerCase();
    const ownerTag = t.ownerTag || t.owner;
    const item = t.item || 'Support';
    const ago = t.createdAt ? timeAgo(t.createdAt) : '–';
    return `
      <div class="queue-item">
        <div class="q-num">${i + 1}</div>
        <div class="q-avatar ${statusClass}">${ownerTag[0].toUpperCase()}</div>
        <div class="q-info">
          <div class="q-name">ticket-${ownerTag}</div>
          <div class="q-meta">${item} · ${ago}</div>
        </div>
        <div class="q-badge ${statusClass}">${t.status}</div>
      </div>`;
  }).join('') || `<div class="empty-state">No tickets yet. Queue is silent 🎧</div>`;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>POZ RZ SHOP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green: #1DB954;
      --green-dim: rgba(29,185,84,0.15);
      --green-hover: #1ed760;
      --black: #0a0a0a;
      --dark: #141414;
      --card: #1c1c1c;
      --hover: #252525;
      --border: rgba(255,255,255,0.07);
      --text: #fff;
      --muted: #8a8a8a;
      --blue: #1EAAE8;
      --red: #E85555;
      --font: 'Figtree', sans-serif;
    }
    html, body { min-height: 100vh; background: var(--black); color: var(--text); font-family: var(--font); }

    /* === LAYOUT === */
    .layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }

    /* === SIDEBAR === */
    .sidebar {
      background: #0f0f0f;
      border-right: 1px solid var(--border);
      padding: 28px 20px;
      display: flex; flex-direction: column; gap: 32px;
      position: sticky; top: 0; height: 100vh; overflow-y: auto;
    }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .logo-circle {
      width: 42px; height: 42px; border-radius: 50%;
      background: var(--green);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .logo-name { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-name span { color: var(--green); }
    .logo-sub { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }

    .nav-section { display: flex; flex-direction: column; gap: 4px; }
    .nav-label { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; padding-left: 12px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px;
      font-size: 14px; font-weight: 600; color: var(--muted);
      cursor: pointer; transition: all 0.15s; text-decoration: none;
    }
    .nav-item:hover, .nav-item.active { background: var(--card); color: var(--text); }
    .nav-item.active { color: var(--green); }
    .nav-icon { font-size: 16px; width: 20px; text-align: center; }

    .sidebar-footer { margin-top: auto; }
    .bot-status {
      display: flex; align-items: center; gap: 10px;
      background: var(--card); padding: 12px 14px; border-radius: 10px;
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .status-info { flex: 1; min-width: 0; }
    .status-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status-label { font-size: 11px; color: var(--green); }

    /* === MAIN === */
    .main { padding: 0; overflow-y: auto; }

    /* === HERO / TOPBAR === */
    .hero {
      background: linear-gradient(180deg, #1a3d27 0%, #0f2218 55%, transparent 100%);
      padding: 40px 36px 32px;
    }
    .hero-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
    .hero-title { font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
    .hero-title span { color: var(--green); }
    .hero-sub { font-size: 13px; color: var(--muted); margin-top: 6px; }
    .refresh-btn {
      background: var(--card); border: 1px solid var(--border);
      color: var(--muted); padding: 8px 14px; border-radius: 20px;
      font-size: 12px; font-weight: 600; cursor: pointer;
      font-family: var(--font); transition: all 0.15s; letter-spacing: 0.5px;
    }
    .refresh-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

    /* === STAT CARDS === */
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .stat-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 12px; padding: 18px 20px;
    }
    .stat-num { font-size: 32px; font-weight: 900; line-height: 1; }
    .stat-label { font-size: 11px; color: var(--muted); margin-top: 5px; letter-spacing: 1.5px; text-transform: uppercase; }
    .stat-card.open .stat-num { color: var(--green); }
    .stat-card.claimed .stat-num { color: var(--blue); }
    .stat-card.closed .stat-num { color: var(--red); }

    /* === CONTENT === */
    .content { padding: 28px 36px 48px; display: flex; flex-direction: column; gap: 36px; }

    /* === STORE SECTION === */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .section-title { font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }

    .store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
    .store-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px; padding: 18px 14px;
      cursor: pointer; transition: all 0.18s;
      position: relative; overflow: hidden;
    }
    .store-card::after {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; background: var(--green); opacity: 0; transition: opacity 0.15s;
    }
    .store-card:hover { background: var(--hover); transform: translateY(-2px); }
    .store-card:hover::after { opacity: 1; }
    .store-icon { font-size: 22px; margin-bottom: 10px; }
    .store-name { font-size: 13px; font-weight: 700; margin-bottom: 7px; }
    .store-price {
      font-size: 12px; font-weight: 700; color: var(--green);
      background: var(--green-dim); display: inline-block;
      padding: 3px 9px; border-radius: 20px;
    }

    /* === NOW PLAYING === */
    .now-playing {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px; padding: 20px;
    }
    .np-inner { display: flex; align-items: center; gap: 16px; }
    .np-art {
      width: 58px; height: 58px; border-radius: 8px; flex-shrink: 0;
      background: linear-gradient(135deg, #1DB954, #0d7a35);
      display: flex; align-items: center; justify-content: center; font-size: 24px;
    }
    .np-info { flex: 1; min-width: 0; }
    .np-title { font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .np-meta { font-size: 12px; color: var(--muted); margin-top: 3px; }
    .np-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 11px; border-radius: 20px; }
    .np-badge.open { background: var(--green-dim); color: var(--green); }
    .np-badge.claimed { background: rgba(30,170,232,0.15); color: var(--blue); }
    .np-badge.closed { background: rgba(232,85,85,0.15); color: var(--red); }

    .progress-area { margin-top: 14px; }
    .progress-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: visible; position: relative; cursor: pointer; }
    .progress-fill { height: 100%; background: var(--green); border-radius: 2px; width: 35%; transition: width 0.5s linear; position: relative; }
    .progress-fill::after {
      content: ''; width: 12px; height: 12px; background: #fff; border-radius: 50%;
      position: absolute; right: -6px; top: -4px;
    }
    .np-controls { display: flex; align-items: center; gap: 10px; margin-top: 16px; justify-content: flex-end; }
    .ctrl-btn {
      border: none; border-radius: 20px; padding: 8px 18px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      font-family: var(--font); letter-spacing: 0.8px; text-transform: uppercase;
      transition: all 0.14s;
    }
    .ctrl-btn.claim { background: var(--blue); color: #fff; }
    .ctrl-btn.claim:hover { filter: brightness(1.2); }
    .ctrl-btn.close { background: var(--red); color: #fff; }
    .ctrl-btn.close:hover { filter: brightness(1.2); }

    /* === QUEUE === */
    .queue { display: flex; flex-direction: column; gap: 6px; }
    .queue-item {
      display: flex; align-items: center; gap: 13px;
      background: var(--card); border: 1px solid var(--border);
      padding: 11px 16px; border-radius: 10px;
      cursor: pointer; transition: background 0.13s;
    }
    .queue-item:hover { background: var(--hover); }
    .q-num { font-size: 12px; color: var(--muted); width: 18px; text-align: center; flex-shrink: 0; }
    .q-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; flex-shrink: 0;
    }
    .q-avatar.open    { background: var(--green-dim); color: var(--green); }
    .q-avatar.claimed { background: rgba(30,170,232,0.15); color: var(--blue); }
    .q-avatar.closed  { background: rgba(232,85,85,0.15); color: var(--red); }
    .q-info { flex: 1; min-width: 0; }
    .q-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .q-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .q-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 9px; border-radius: 20px; flex-shrink: 0; }
    .q-badge.open    { background: var(--green-dim); color: var(--green); }
    .q-badge.claimed { background: rgba(30,170,232,0.15); color: var(--blue); }
    .q-badge.closed  { background: rgba(232,85,85,0.15); color: var(--red); }
    .empty-state { font-size: 13px; color: var(--muted); padding: 24px; text-align: center; }

    /* === SCROLLBAR === */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }

    @media (max-width: 768px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .hero, .content { padding-left: 20px; padding-right: 20px; }
    }
  </style>
</head>
<body>
<div class="layout">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="logo-area">
      <div class="logo-circle">🎫</div>
      <div>
        <div class="logo-name">POZ <span>RZ</span></div>
        <div class="logo-sub">POZ RZ SHOP</div>
      </div>
    </div>

    <nav class="nav-section">
      <div class="nav-label">Menu</div>
      <a class="nav-item active" href="/"><span class="nav-icon">🏠</span> Dashboard</a>
      <a class="nav-item" href="/api/tickets"><span class="nav-icon">🎫</span> Tickets (JSON)</a>
    </nav>

    <nav class="nav-section">
      <div class="nav-label">Store</div>
      <div class="nav-item"><span class="nav-icon">💎</span> Coins &amp; Guns</div>
      <div class="nav-item"><span class="nav-icon">🔓</span> Unbans</div>
      <div class="nav-item"><span class="nav-icon">💊</span> Specials</div>
    </nav>

    <div class="sidebar-footer">
      <div class="bot-status">
        <div class="status-dot"></div>
        <div class="status-info">
          <div class="status-name">POZ RZ SHOP</div>
          <div class="status-label">Online</div>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">
    <div class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-title">Good evening,<br><span>Admin 👑</span></div>
          <div class="hero-sub">POZ RZ SHOP · Live</div>
        </div>
        <button class="refresh-btn" onclick="location.reload()">↻ Refresh</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card open">
          <div class="stat-num">${open}</div>
          <div class="stat-label">Open</div>
        </div>
        <div class="stat-card claimed">
          <div class="stat-num">${claimed}</div>
          <div class="stat-label">Claimed</div>
        </div>
        <div class="stat-card closed">
          <div class="stat-num">${closed}</div>
          <div class="stat-label">Closed</div>
        </div>
      </div>
    </div>

    <div class="content">

      <!-- STORE -->
      <section>
        <div class="section-header">
          <div class="section-title">Store tracks</div>
        </div>
        <div class="store-grid">
          <div class="store-card"><div class="store-icon">💎</div><div class="store-name">Coins Guns</div><div class="store-price">$20–$30</div></div>
          <div class="store-card"><div class="store-icon">👕</div><div class="store-name">Clothing Import</div><div class="store-price">$25</div></div>
          <div class="store-card"><div class="store-icon">🔫</div><div class="store-name">Gun Import</div><div class="store-price">$30</div></div>
          <div class="store-card"><div class="store-icon">🚫</div><div class="store-name">TX Unban</div><div class="store-price">$10</div></div>
          <div class="store-card"><div class="store-icon">🔓</div><div class="store-name">AC Unban</div><div class="store-price">$25</div></div>
          <div class="store-card"><div class="store-icon">💊</div><div class="store-name">Personal Drug</div><div class="store-price">$35</div></div>
          <div class="store-card"><div class="store-icon">💰</div><div class="store-name">10k Diamonds</div><div class="store-price">$10</div></div>
          <div class="store-card"><div class="store-icon">🕹️</div><div class="store-name">TX No-Clip / mo</div><div class="store-price">$20</div></div>
        </div>
      </section>

      <!-- TICKET QUEUE -->
      <section>
        <div class="section-header">
          <div class="section-title">Ticket queue</div>
        </div>
        <div class="queue">
          ${ticketRows}
        </div>
      </section>

    </div>
  </main>
</div>

<script>
  // Animate progress bar
  let p = 20;
  const bar = document.getElementById && document.createElement('div');
  setInterval(() => {
    p = (p + 0.3) % 100;
    document.querySelectorAll('.progress-fill').forEach(el => {
      el.style.width = p.toFixed(1) + '%';
    });
  }, 300);
</script>
</body>
</html>`);
});

// ---- TICKETS API ----
app.get('/api/tickets', (req, res) => {
  const tickets = [...ticketData.entries()].map(([id, data]) => ({ id, ...data }));
  res.json({ total: tickets.length, tickets });
});

app.listen(process.env.PORT || 5000, () => {
  console.log('🔥 POZ RZ SHOP LIVE — Dashboard at http://localhost:5000');
});

// ================= READY =================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

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
          new ButtonBuilder().setCustomId('buy').setLabel('🛒 Buy Now').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('contact').setLabel('📩 Contact Admin').setStyle(ButtonStyle.Primary)
        );
        const embed = new EmbedBuilder()
          .setColor(0x4B6FFF)
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
          .setThumbnail(process.env.BANNER_URL || 'https://cdn.discordapp.com/attachments/1471825509859201129/1496007390435213332/content.png?ex=69e850f4&is=69e6ff74&hm=68a994f7f65a7055be920b5803d74c440f3335be77dba38ee25e4eae83049352&')
          .setFooter({ text: 'POZ RZ SHOP' });
        return interaction.reply({ embeds: [embed], components: [row] });
      }

      // ================= DASHBOARD =================
      if (interaction.commandName === 'dashboard') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return interaction.reply({ content: '❌ Admin only', ephemeral: true });
        }
        const open    = [...ticketData.values()].filter(t => t.status === 'OPEN').length;
        const claimed = [...ticketData.values()].filter(t => t.status === 'CLAIMED').length;
        const closed  = [...ticketData.values()].filter(t => t.status === 'CLOSED').length;
        const host = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x1DB954)
              .setTitle('👑 POZ RZ SHOP DASHBOARD')
              .addFields(
                { name: '🟢 Open',     value: `${open}`,    inline: true },
                { name: '📌 Claimed', value: `${claimed}`, inline: true },
                { name: '🔴 Closed',  value: `${closed}`,  inline: true },
                { name: '🌐 Web Dashboard', value: host, inline: false }
              )
              .setFooter({ text: 'POZ RZ SHOP' })
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
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id,  allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: client.user.id,       allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
          ]
        });

        ticketData.set(channel.id, {
          owner: interaction.user.id,
          ownerTag: interaction.user.username,
          item: interaction.customId === 'buy' ? 'Purchase' : 'Contact',
          status: 'OPEN',
          claimedBy: null,
          createdAt: Date.now()
        });

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('claim').setLabel('📌 Claim').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('close').setLabel('🔒 Close').setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
          .setColor(0x4B6FFF)
          .setTitle('🎫 SUPPORT TICKET')
          .addFields(
            { name: '👤 User',    value: `<@${interaction.user.id}>`, inline: true },
            { name: '📌 Status', value: '🟢 OPEN',                   inline: true },
            { name: '🧠 System', value: 'POZ RZ SHOP ACTIVE',                inline: false }
          )
          .setThumbnail(process.env.BANNER_URL || 'https://cdn.discordapp.com/attachments/1471825509859201129/1496007390435213332/content.png?ex=69e850f4&is=69e6ff74&hm=68a994f7f65a7055be920b5803d74c440f3335be77dba38ee25e4eae83049352&')
          .setFooter({ text: 'POZ RZ SHOP' });

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
              .setColor(0x1EAAE8)
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

// ================= HELPERS =================
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ================= LOGIN =================
client.login(process.env.DISCORD_TOKEN);