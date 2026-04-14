import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
} from 'discord.js';
import { checkIsAdmin, addTester, removeTester, approveServer, revokeServer } from '../../services/adminService.js';
import { Colours } from '../../utils/colours.js';
import { logger } from '../../utils/logger.js';

// ============================================================================
// ADMIN COMMAND
// ============================================================================

export const data = new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin-only management commands.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
        sub
            .setName('add-tester')
            .setDescription('Approve a Discord user as a dashboard tester.')
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
            .setDescription('Revoke dashboard tester access from a user.')
            .addUserOption(opt =>
                opt
                    .setName('user')
                    .setDescription('The user to revoke tester access from.')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName('approve-server')
            .setDescription('Approve a Discord server for bot testing.')
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
            .setDescription('Revoke bot testing approval from a Discord server.')
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
 * Restricted to users holding a registered admin role in this server.
 *
 * Subcommands:
 *   add-tester     — Approves a Discord user as a dashboard tester
 *   remove-tester  — Revokes dashboard tester access from a user
 *   approve-server — Approves a Discord server for bot testing
 *   revoke-server  — Revokes bot testing approval from a Discord server
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
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.error)
                        .setTitle('Access denied')
                        .setDescription('You do not have admin permissions in this server.'),
                ],
                ephemeral: true,
            });
            return;
        }
    } catch (error) {
        logger.error({ err: error }, '❌ [admin] Permission check failed');
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colours.error)
                    .setTitle('Something went wrong')
                    .setDescription('Failed to verify permissions. Please try again later.'),
            ],
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
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.admin)
                        .setTitle('Tester approved')
                        .setDescription(`<@${user.id}> has been approved as a dashboard tester.`)
                        .setFooter({ text: `Actioned by ${interaction.user.username}` })
                        .setTimestamp(),
                ],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'ALREADY_EXISTS') {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colours.error)
                            .setTitle('Already a tester')
                            .setDescription(`<@${user.id}> is already approved as a tester.`),
                    ],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] add-tester failed');
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.error)
                        .setTitle('Something went wrong')
                        .setDescription('Failed to add tester. Please try again later.'),
                ],
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
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.admin)
                        .setTitle('Tester removed')
                        .setDescription(`<@${user.id}> no longer has dashboard tester access.`)
                        .setFooter({ text: `Actioned by ${interaction.user.username}` })
                        .setTimestamp(),
                ],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'NOT_FOUND') {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colours.error)
                            .setTitle('Not found')
                            .setDescription(`<@${user.id}> is not currently approved as a tester.`),
                    ],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] remove-tester failed');
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.error)
                        .setTitle('Something went wrong')
                        .setDescription('Failed to remove tester. Please try again later.'),
                ],
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
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.admin)
                        .setTitle('Server approved')
                        .setDescription(`Server \`${serverId}\` has been approved for bot testing.`)
                        .setFooter({ text: `Actioned by ${interaction.user.username}` })
                        .setTimestamp(),
                ],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'ALREADY_EXISTS') {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colours.error)
                            .setTitle('Already approved')
                            .setDescription(`Server \`${serverId}\` is already approved for bot testing.`),
                    ],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] approve-server failed');
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.error)
                        .setTitle('Something went wrong')
                        .setDescription('Failed to approve server. Please try again later.'),
                ],
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
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.admin)
                        .setTitle('Server approval revoked')
                        .setDescription(`Server \`${serverId}\` has been removed from the approved testing list.`)
                        .setFooter({ text: `Actioned by ${interaction.user.username}` })
                        .setTimestamp(),
                ],
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'NOT_FOUND') {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colours.error)
                            .setTitle('Not found')
                            .setDescription(`Server \`${serverId}\` is not currently approved for bot testing.`),
                    ],
                });
                return;
            }

            logger.error({ err: error }, '❌ [admin] revoke-server failed');
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.error)
                        .setTitle('Something went wrong')
                        .setDescription('Failed to revoke server. Please try again later.'),
                ],
                ephemeral: true,
            });
        }
    }
}