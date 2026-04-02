import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Defines the structure required for a slash command
export interface Command {
    data: { name: string };
    execute: (...args: unknown[]) => Promise<void>;
}

// Loads all commands from subdirectories into the client's command collection
export async function loadCommands(client: Client & { commands: Collection<string, Command> }): Promise<void> {
    client.commands = new Collection();

    // Navigate to commands directory
    const commandsPath = join(__dirname, '../commands');
    const categories = readdirSync(commandsPath);

    for (const category of categories) {
        const files = readdirSync(join(commandsPath, category)).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
        for (const file of files) {
            const commandData = await import(pathToFileURL(join(commandsPath, category, file)).href);            // Verify the import has the required command structure before registering
            if (commandData.data && typeof commandData.execute === 'function') {
                const command = commandData as Command;
                client.commands.set(command.data.name, command);
            }
        }
    }
}