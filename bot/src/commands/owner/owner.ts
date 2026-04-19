import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} from 'discord.js';
import { addAdminRole, removeAdminRole } from '../../services/ownerService.js';
import { buildEmbed, errorEmbed } from '../../utils/embed.js';
import { logger } from '../../utils/logger.js';

// ============================================================================
// OWNER COMMAND
// ============================================================================

export const data = new SlashCommandBuilder()
    .setName('owner')
    .setDescription('Owner-only server configuration commands.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
        sub
            .setName('add-admin-role')
            .setDescription('Grant a role admin access to Firesong Herald for this server.')
            .addRoleOption(opt =>
                opt
                    .setName('role')
                    .setDescription('The role to grant admin access.')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName('remove-admin-role')
            .setDescription('Revoke a role\'s admin access to Firesong Herald for this server.')
            .addRoleOption(opt =>
                opt
                    .setName('role')
                    .setDescription('The role to revoke admin access from.')
                    .setRequired(true)
            )
    );

// ============================================================================
// EXECUTE
// ============================================================================

/**
 * Handles the /owner command and its subcommands.
 * Restricted to the guild owner only.
 *
 * Subcommands:
 *   add-admin-role    — Grants a Discord role admin access to Firesong Herald for this server
 *   remove-admin-role — Revokes a Discord role's admin access to Firesong Herald for this server
 *
 * @param interaction - The slash command interaction.
 */
export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild;

    if (!guild) {
        await interaction.reply({
            content: 'This command can only be used in a server.',
            ephemeral: true,
        });
        return;
    }

    if (interaction.user.id !== guild.ownerId) {
        await interaction.reply({
            embeds: [errorEmbed('Only the server owner can use this command.', 'Access denied')],
            ephemeral: true,
        });
        return;
    }

    const subcommand = interaction.options.getSubcommand();
    const role = interaction.options.getRole('role', true);

    // ── Add admin role ────────────────────────────────────────────────────────
    if (subcommand === 'add-admin-role') {
        try {
            await addAdminRole(guild.id, role.id, interaction.user.id);

            await interaction.reply({
                embeds: [buildEmbed({
                    colour: 'owner',
                    title: 'Admin role added',
                    description: `<@&${role.id}> has been granted admin access to Firesong Herald for this server.`,
                    footer: `Actioned by ${interaction.user.username}`,
                })],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'ALREADY_EXISTS') {
                await interaction.reply({
                    embeds: [errorEmbed(`<@&${role.id}> already has admin access to Firesong Herald in this server.`, 'Already registered')],
                });
                return;
            }

            logger.error({ err: error }, '❌ [owner] add-admin-role failed');
            await interaction.reply({
                embeds: [errorEmbed('Failed to add admin role. Please try again later.', 'Something went wrong')],
                ephemeral: true,
            });
        }
    }

    // ── Remove admin role ─────────────────────────────────────────────────────
    if (subcommand === 'remove-admin-role') {
        try {
            await removeAdminRole(guild.id, role.id, interaction.user.id);

            await interaction.reply({
                embeds: [buildEmbed({
                    colour: 'owner',
                    title: 'Admin role removed',
                    description: `<@&${role.id}> no longer has admin access to Firesong Herald for this server.`,
                    footer: `Actioned by ${interaction.user.username}`,
                })],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'NOT_FOUND') {
                await interaction.reply({
                    embeds: [errorEmbed(`<@&${role.id}> does not have admin access to Firesong Herald in this server.`, 'Not found')],
                });
                return;
            }

            logger.error({ err: error }, '❌ [owner] remove-admin-role failed');
            await interaction.reply({
                embeds: [errorEmbed('Failed to remove admin role. Please try again later.', 'Something went wrong')],
                ephemeral: true,
            });
        }
    }
}