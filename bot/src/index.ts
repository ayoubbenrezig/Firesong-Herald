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
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const possiblePaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
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

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// ============================================================================
// STARTUP
// ============================================================================

async function start(): Promise<void> {
    await loadCommands(client as any);
    await loadEvents(client);
    await client.login(DISCORD_TOKEN);
}

start().catch((error) => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
});