// Discord.js and utility imports
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Resolve current file and directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Locate and load environment variables from .env file
const possiblePaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
];

for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        break;
    }
}

// Retrieve Discord credentials from environment
const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const GUILD_ID = process.env.DISCORD_GUILD_ID!;

// Collate all command files from the commands directory
const commands: unknown[] = [];
const commandsPath = join(__dirname, '../src/commands');
const categories = readdirSync(commandsPath);

for (const category of categories) {
    const files = readdirSync(join(commandsPath, category)).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    for (const file of files) {
        const command = await import(pathToFileURL(join(commandsPath, category, file)).href);
        // Extract command data if available
        if (command.data) commands.push(command.data.toJSON());
    }
}

// Initialise REST client with bot token
const rest = new REST().setToken(TOKEN);

console.log(`Registering ${commands.length} command(s)...`);

// Register slash commands with Discord API for the guild
await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
);

console.log('✅ Commands registered.');