import { Events, Interaction, Collection } from 'discord.js';
import { Command } from './commandHandler.js';

// Register this handler for the InteractionCreate event
export const name = Events.InteractionCreate;

// Handle incoming interactions and route chat input commands
export async function execute(interaction: Interaction): Promise<void> {
    // Only handle slash commands
    if (!interaction.isChatInputCommand()) return;

    // Retrieve the command from the client's command collection
    const commands = (interaction.client as unknown as { commands: Collection<string, Command> }).commands;
    const command = commands.get(interaction.commandName);

    // Log and exit if command doesn't exist
    if (!command) {
        console.error(`No command found: ${interaction.commandName}`);
        return;
    }

    // Execute the command with error handling
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    }
}