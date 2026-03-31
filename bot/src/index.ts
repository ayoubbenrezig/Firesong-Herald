// ============================================================================
// FIRESONG HERALD — Discord Bot Entry Point
// ============================================================================
// Main bot service initialization, event handlers, and startup logic.
// Uses Discord.js v14+ with TypeScript strict mode.

import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================
// Verify required environment variables are present before initializing bot.

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!DISCORD_TOKEN || !CLIENT_ID) {
    console.error(
        '❌ Missing required environment variables:\n' +
        '   - DISCORD_TOKEN (from Discord Developer Portal)\n' +
        '   - CLIENT_ID (bot application ID)\n' +
        '\n   Please check your .env file.'
    );
    process.exit(1);
}

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================
// Create Discord.js client with necessary intents.
// Intents: Guilds (for slash commands in servers)

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// ============================================================================
// EVENT HANDLERS
// ============================================================================

// Bot ready event — fires once after successful login
client.on('ready', () => {
    console.log(`✅ Bot logged in as ${client.user?.tag}`);
    console.log(`   ID: ${client.user?.id}`);
    console.log(`   Serving ${client.guilds.cache.size} guild(s)`);
});

// Interaction handler — processes slash commands and other interactions
client.on('interactionCreate', async (interaction) => {
    // Only handle slash commands for now
    if (!interaction.isChatInputCommand()) return;

    // Echo command — test slash command
    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong! 🏓');
    }
});

// Error handler — log uncaught errors
client.on('error', (error) => {
    console.error('❌ Discord.js error:', error);
});

// ============================================================================
// STARTUP
// ============================================================================

client.login(DISCORD_TOKEN);