import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    InteractionContextType,
} from 'discord.js';
import { checkIsAdmin, addTester, removeTester, approveServer, revokeServer } from '../../services/adminService.js';
import { buildEmbed, errorEmbed } from '../../utils/embed.js';
import { logger } from '../../utils/logger.js';

// ============================================================================
// ADMIN COMMAND
// ============================================================================

export const data = new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin-only management commands.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(sub =>
        sub
            .setName('add-tester')
            .setDescription('Approve a Discord user as a Firesong Herald dashboard tester.')
            .addUserOption(opt =>
                opt
                    .setName('user')
                    .setDescription('The user to approve as a tester.')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName('remove-tester')
            .setDescription('Revoke a user\'s access to the Firesong Herald dashboard.')
            .addUserOption(opt =>
                opt
                    .setName('user')
                    .setDescription('The user to revoke dashboard access from.')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName('approve-server')
            .setDescription('Approve a Discord server for Firesong Herald bot testing.')
            .addStringOption(opt =>
                opt
                    .setName('server_id')
                    .setDescription('The Discord server ID to approve.')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName('revoke-server')
            .setDescription('Revoke a Discord server from Firesong Herald bot testing.')
            .addStringOption(opt =>
                opt
                    .setName('server_id')
                    .setDescription('The Discord server ID to revoke.')
                    .setRequired(true)
            )
    );

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Resolves the member's role IDs from the interaction.
 *
 * @param interaction - The slash command interaction.
 * @returns An array of Discord role snowflake IDs the member holds.
 */
function getMemberRoleIds(interaction: ChatInputCommandInteraction): string[] {
    if (!interaction.member) return [];
    return Array.isArray(interaction.member.roles)
        ? interaction.member.roles
        : [...interaction.member.roles.cache.keys()];
}

// ============================================================================
// EXECUTE
// ============================================================================

/**
 * Handles the /admin command and its subcommands.
 * Restricted to users holding a registered admin role in Firesong Herald for this server.
 *
 * Subcommands:
 *   add-tester     — Approves a Discord user as a Firesong Herald dashboard tester
 *   remove-tester  — Revokes a user's access to the Firesong Herald dashboard
 *   approve-server — Approves a Discord server for Firesong Herald bot testing
 *   revoke-server  — Revokes a Discord server from Firesong Herald bot testing
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

    try {
        const hasAccess = await checkIsAdmin(guild.id, getMemberRoleIds(interaction));

        if (!hasAccess) {
            await interaction.reply({
                embeds: [errorEmbed('You do not have admin access to Firesong Herald for this server.', 'Access denied')],
                ephemeral: true,
            });
            return;
        }
    } catch (error) {
        logger.error({ err: error }, '❌ [admin] Permission check failed');
        await interaction.reply({
            embeds: [errorEmbed('Failed to verify permissions. Please try again later.', 'Something went wrong')],
            ephemeral: true,
        });
        return;
    }

    const subcommand = interaction.options.getSubcommand();

    // ── Add tester ────────────────────────────────────────────────────────────
    if (subcommand === 'add-tester') {
        const user = interaction.options.getUser('user', true);

        try {
            await addTester(user.id, interaction.user.id);

            await interaction.reply({
                embeds: [buildEmbed({
                    colour: 'admin',
                    title: 'Tester approved',
                    description: `<@${user.id}> has been approved as a Firesong Herald dashboard tester.`,
                    footer: `Actioned by ${interaction.user.username}`,
                })],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'ALREADY_EXISTS') {
                await interaction.reply({
                    embeds: [errorEmbed(`<@${user.id}> is already approved as a Firesong Herald dashboard tester.`, 'Already a tester')],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] add-tester failed');
            await interaction.reply({
                embeds: [errorEmbed('Failed to add tester. Please try again later.', 'Something went wrong')],
                ephemeral: true,
            });
        }
    }

    // ── Remove tester ─────────────────────────────────────────────────────────
    if (subcommand === 'remove-tester') {
        const user = interaction.options.getUser('user', true);

        try {
            await removeTester(user.id, interaction.user.id);

            await interaction.reply({
                embeds: [buildEmbed({
                    colour: 'admin',
                    title: 'Tester removed',
                    description: `<@${user.id}> no longer has access to the Firesong Herald dashboard.`,
                    footer: `Actioned by ${interaction.user.username}`,
                })],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'NOT_FOUND') {
                await interaction.reply({
                    embeds: [errorEmbed(`<@${user.id}> is not currently approved as a Firesong Herald dashboard tester.`, 'Not found')],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] remove-tester failed');
            await interaction.reply({
                embeds: [errorEmbed('Failed to remove tester. Please try again later.', 'Something went wrong')],
                ephemeral: true,
            });
        }
    }

    // ── Approve server ────────────────────────────────────────────────────────
    if (subcommand === 'approve-server') {
        const serverId = interaction.options.getString('server_id', true);

        try {
            await approveServer(serverId, interaction.user.id);

            await interaction.reply({
                embeds: [buildEmbed({
                    colour: 'admin',
                    title: 'Server approved',
                    description: `Server \`${serverId}\` has been approved for Firesong Herald bot testing.`,
                    footer: `Actioned by ${interaction.user.username}`,
                })],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'ALREADY_EXISTS') {
                await interaction.reply({
                    embeds: [errorEmbed(`Server \`${serverId}\` is already approved for Firesong Herald bot testing.`, 'Already approved')],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] approve-server failed');
            await interaction.reply({
                embeds: [errorEmbed('Failed to approve server. Please try again later.', 'Something went wrong')],
                ephemeral: true,
            });
        }
    }

    // ── Revoke server ─────────────────────────────────────────────────────────
    if (subcommand === 'revoke-server') {
        const serverId = interaction.options.getString('server_id', true);

        try {
            await revokeServer(serverId, interaction.user.id);

            await interaction.reply({
                embeds: [buildEmbed({
                    colour: 'admin',
                    title: 'Server approval revoked',
                    description: `Server \`${serverId}\` has been removed from Firesong Herald bot testing.`,
                    footer: `Actioned by ${interaction.user.username}`,
                })],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'NOT_FOUND') {
                await interaction.reply({
                    embeds: [errorEmbed(`Server \`${serverId}\` is not currently approved for Firesong Herald bot testing.`, 'Not found')],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] revoke-server failed');
            await interaction.reply({
                embeds: [errorEmbed('Failed to revoke server. Please try again later.', 'Something went wrong')],
                ephemeral: true,
            });
        }
    }
}