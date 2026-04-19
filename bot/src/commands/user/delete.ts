import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ButtonStyle,
    InteractionContextType,
    MessageFlags,
} from 'discord.js';
import { buildEmbed } from '../../utils/embed.js';
import { buildButton, buildActionRow } from '../../utils/button.js';
import { Emoji } from '../../utils/emojis.js';
import { logger } from '../../utils/logger.js';

// ============================================================================
// /user delete
// ============================================================================
// Presents the user with a confirmation embed and two buttons.
// No text is sent — all communication is via embeds and buttons.
// Actual deletion is handled in userDelete.ts via the button handler.

export const data = new SlashCommandBuilder()
    .setName('user')
    .setDescription('Manage your Firesong Herald data')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addSubcommand(sub =>
        sub
            .setName('delete')
            .setDescription('Permanently delete your account and all associated data'),
    );

/**
 * Executes the /user delete command.
 *
 * Presents a confirmation embed with Danger and Secondary buttons.
 * The interaction is ephemeral — only the invoking user can see it.
 *
 * @param interaction - The incoming chat input command interaction.
 */
export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand !== 'delete') {
        return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const discordUserId = interaction.user.id;

    logger.info({ discordUserId }, 'User deletion confirmation prompt sent');

    const confirmEmbed = buildEmbed({
        colour: 'error',
        title: 'Delete your data?',
        description:
            `${Emoji.FeatherQuestionMark} **This is permanent and cannot be undone.**\n\n` +
            `Deleting your data will:\n\n` +
            `• Remove your account and all saved preferences\n` +
            `• Remove all your signups and RSVP history\n` +
            `• Remove you from the tester programme if applicable\n` +
            `• Remove the bot from any servers you invited it to`,
    });

    const confirmButton = buildButton({
        customId: 'user_delete_confirm',
        label: 'Yes, delete my data',
        style: ButtonStyle.Danger,
    });

    const cancelButton = buildButton({
        customId: 'user_delete_cancel',
        label: 'Cancel',
        style: ButtonStyle.Secondary,
    });

    const row = buildActionRow(confirmButton, cancelButton);

    await interaction.editReply({
        embeds: [confirmEmbed],
        components: [row],
    });
}