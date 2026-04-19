import { ButtonInteraction } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleUserDeleteConfirm, handleUserDeleteCancel } from './userDelete.js';

// ============================================================================
// BUTTON INTERACTION HANDLER
// ============================================================================
// Routes incoming button interactions to their respective handlers by custom ID.
// Add new button handlers here as features are introduced.

/**
 * Routes a button interaction to the appropriate handler based on its custom ID.
 *
 * @param interaction - The incoming button interaction.
 */
export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    const { customId } = interaction;

    if (customId === 'user_delete_confirm') {
        await handleUserDeleteConfirm(interaction);
        return;
    }

    if (customId === 'user_delete_cancel') {
        await handleUserDeleteCancel(interaction);
        return;
    }

    logger.warn({ customId }, '⚠️ [buttonHandler] Unhandled button customId');
}