// ============================================================================
// FIRESONG HERALD — Discord Bot Entry Point
// ============================================================================
// Main bot service initialization, event handlers, and startup logic.
// Uses Discord.js v14+ with TypeScript strict mode.

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits } from 'discord.js';

// Load .env from project root
// Try multiple possible locations to handle different execution contexts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const possiblePaths = [
    path.resolve(__dirname, '../../.env'),      // When running from bot/ directory
    path.resolve(process.cwd(), '.env'),        // Current working directory
    path.resolve(process.cwd(), '..', '.env'),  // Parent of current directory
];

let envPath: string | null = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        envPath = p;
        console.log(`ℹ️  Loading .env from: ${p}`);
        break;
    }
}

if (envPath) {
    dotenv.config({ path: envPath });
} else {
    console.warn('⚠️  .env file not found, relying on system environment variables');
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================
// Verify required environment variables are present before initializing bot.

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    console.error(
        '❌ Missing required environment variables:\n' +
        '   - DISCORD_TOKEN (from Discord Developer Portal)\n' +
        '   - DISCORD_CLIENT_ID (bot application ID)\n' +
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