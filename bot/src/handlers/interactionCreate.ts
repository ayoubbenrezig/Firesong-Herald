import { Events, Interaction, Collection } from 'discord.js';
import { Command } from './commandHandler.js';
import { handleModalSubmit } from './modalSubmit.js';
import { logger } from '../utils/logger.js';

// Register this handler for the InteractionCreate event
export const name = Events.InteractionCreate;

/**
 * Handles all incoming interactions and routes them by type.
 *
 * @param interaction - The incoming Discord interaction.
 */
export async function execute(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
        const commands = (interaction.client as unknown as { commands: Collection<string, Command> }).commands;
        const command = commands.get(interaction.commandName);

        if (!command) {
            logger.error({ commandName: interaction.commandName }, '❌ [interactionCreate] Unknown command');
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            logger.error({ err: error, commandName: interaction.commandName }, '❌ [interactionCreate] Command execution failed');
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: 'Something went wrong.' });
            } else {
                await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
            }
        }

        return;
    }

    if (interaction.isModalSubmit()) {
        try {
            await handleModalSubmit(interaction);
        } catch (error) {
            logger.error({ err: error, customId: interaction.customId }, '❌ [interactionCreate] Modal submit failed');
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: 'Something went wrong.' });
            } else {
                await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
            }
        }

        return;
    }
}