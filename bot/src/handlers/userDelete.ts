import { ButtonInteraction } from 'discord.js';
import { logger } from '../utils/logger.js';
import { errorEmbed, infoEmbed, successEmbed } from '../utils/embed.js';
import { Emoji } from '../utils/emojis.js';

// ============================================================================
// USER DELETE BUTTON HANDLERS
// ============================================================================
// Handles the confirm and cancel button interactions triggered by /user delete.

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/**
 * Handles the "confirm deletion" button press.
 *
 * Calls DELETE /users/:discordUserId on the API.
 * On success, replaces the message with a farewell embed.
 * On failure, replaces the message with an error embed.
 *
 * @param interaction - The incoming button interaction.
 */
export async function handleUserDeleteConfirm(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();

    const discordUserId = interaction.user.id;

    try {
        const response = await fetch(`${API_URL}/users/${discordUserId}`, {
            method: 'DELETE',
        });

        if (response.status === 404) {
            await interaction.editReply({
                embeds: [infoEmbed(
                    `${Emoji.LurkingOwl} You don't have any data stored with Firesong Herald.`,
                )],
                components: [],
            });
            return;
        }

        if (!response.ok) {
            const body = await response.json().catch(() => ({})) as { error?: string };
            logger.error(
                { discordUserId, status: response.status, error: body.error },
                '❌ [userDelete] API returned non-OK status on user deletion',
            );

            await interaction.editReply({
                embeds: [errorEmbed(
                    `${Emoji.SadOwl} Something went wrong and your data could not be deleted.\n\n` +
                    `Please try again later or contact us in the support server.`,
                )],
                components: [],
            });
            return;
        }

        logger.info({ discordUserId }, 'User data deleted via slash command confirmation');

        await interaction.editReply({
            embeds: [successEmbed(
                `${Emoji.FeatherHeart} Your account and all associated data have been permanently deleted.\n\n` +
                `Thank you for being part of Firesong Herald. You're always welcome back.`,
                'Data deleted',
            )],
            components: [],
        });
    } catch (error) {
        logger.error({ err: error, discordUserId }, '❌ [userDelete] Unexpected error during user deletion');

        await interaction.editReply({
            embeds: [errorEmbed(
                `${Emoji.SadOwl} An unexpected error occurred. Your data has not been deleted.\n\n` +
                `Please try again later or contact us in the support server.`,
            )],
            components: [],
        });
    }
}

/**
 * Handles the "cancel deletion" button press.
 *
 * Replaces the confirmation message with a cancellation notice and removes all components.
 *
 * @param interaction - The incoming button interaction.
 */
export async function handleUserDeleteCancel(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();

    await interaction.editReply({
        embeds: [infoEmbed(
            `${Emoji.HappyOwl} No changes were made. Your data is safe.`,
            'Deletion cancelled',
        )],
        components: [],
    });

    logger.info({ discordUserId: interaction.user.id }, 'User deletion cancelled by user');
}