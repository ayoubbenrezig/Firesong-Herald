import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically load and register all event handlers from the current directory
export async function loadEvents(client: Client): Promise<void> {
    // Read all files except this file, filter for TypeScript/JavaScript
    const files = readdirSync(__dirname).filter(f => f !== 'eventHandler.ts' && f !== 'eventHandler.js' && (f.endsWith('.ts') || f.endsWith('.js')));

    // Import and register each event handler
    for (const file of files) {
        const event = await import(pathToFileURL(join(__dirname, file)).href);
        if (event.name && event.execute) {
            if (event.once) {
                client.once(event.name, event.execute);
            } else {
                client.on(event.name, event.execute);
            }        }
    }
}