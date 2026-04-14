import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// ============================================================================
// DEPLOY SLASH COMMANDS
// ============================================================================
// Registers all slash commands with Discord.
// Uses guild-scoped registration in development (instant update).
// Uses global registration in production (up to 1 hour propagation).

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const possiblePaths = [
    path.resolve(__dirname, '../../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
];

for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        break;
    }
}

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!TOKEN || !CLIENT_ID) {
    console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID');
    process.exit(1);
}

(async () => {
    const commands: unknown[] = [];
    const commandsPath = join(__dirname, '../commands');
    const categories = readdirSync(commandsPath);

    for (const category of categories) {
        const files = readdirSync(join(commandsPath, category)).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
        for (const file of files) {
            const command = await import(pathToFileURL(join(commandsPath, category, file)).href);
            if (command.data) commands.push(command.data.toJSON());
        }
    }

    const rest = new REST().setToken(TOKEN);

    console.log(`Registering ${commands.length} command(s) [${NODE_ENV}]...`);

    if (NODE_ENV === 'production') {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
    } else {
        if (!GUILD_ID) {
            console.error('❌ Missing DISCORD_GUILD_ID for development registration');
            process.exit(1);
        }
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
    }

    console.log('✅ Commands registered.');
})();