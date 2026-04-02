import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

// Define the slash command with name and description
export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

// Execute the ping command
export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Pong! 🏓');
}