import { Events, Client } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client): Promise<void> {
    console.log(`✅ Bot logged in as ${client.user?.tag}`);
    console.log(`   ID: ${client.user?.id}`);
    console.log(`   Serving ${client.guilds.cache.size} guild(s)`);
}