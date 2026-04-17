require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>POZ-RZ-SHOP Bot</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #23272a;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .card {
          background: #2c2f33;
          border-radius: 12px;
          padding: 40px 60px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }
        .status {
          display: inline-block;
          background: ${process.env.DISCORD_TOKEN ? '#43b581' : '#faa61a'};
          color: white;
          border-radius: 20px;
          padding: 6px 18px;
          font-size: 14px;
          margin-top: 10px;
        }
        h1 { color: #7289da; margin-bottom: 8px; }
        p { color: #99aab5; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>POZ-RZ-SHOP Bot</h1>
        <p>Discord Bot Status</p>
        <div class="status">${process.env.DISCORD_TOKEN ? 'Online' : 'Token not configured'}</div>
        <p style="margin-top:20px; font-size:13px; color:#72767d;">
          ${process.env.DISCORD_TOKEN
            ? 'Bot is running and connected to Discord.'
            : 'Set the DISCORD_TOKEN secret to connect this bot to Discord.'}
        </p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Status page running at http://0.0.0.0:${PORT}`);
});

if (!process.env.DISCORD_TOKEN) {
  console.warn('WARNING: DISCORD_TOKEN is not set. Bot will not connect to Discord.');
  console.warn('Add your DISCORD_TOKEN secret to enable the Discord bot.');
} else {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.commands = new Collection();

  client.once('ready', () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
      }
    }
  });

  client.login(process.env.DISCORD_TOKEN);
}
