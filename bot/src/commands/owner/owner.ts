import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
} from 'discord.js';
import { addAdminRole, removeAdminRole } from '../../services/ownerService.js';
import { Colours } from '../../utils/colours.js';
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
            .setDescription('Grant a role admin permissions in this server.')
            .addRoleOption(opt =>
                opt
                    .setName('role')
                    .setDescription('The role to grant admin permissions.')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName('remove-admin-role')
            .setDescription('Revoke admin permissions from a role in this server.')
            .addRoleOption(opt =>
                opt
                    .setName('role')
                    .setDescription('The role to revoke admin permissions from.')
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
 *   add-admin-role    — Grants a Discord role admin permissions in this server
 *   remove-admin-role — Revokes admin permissions from a Discord role
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
            embeds: [
                new EmbedBuilder()
                    .setColor(Colours.error)
                    .setTitle('Access denied')
                    .setDescription('Only the server owner can use this command.'),
            ],
            ephemeral: true,
        });
        return;
    }

    const subcommand = interaction.options.getSubcommand();
    const role = interaction.options.getRole('role', true);

    if (subcommand === 'add-admin-role') {
        try {
            await addAdminRole(guild.id, role.id, interaction.user.id);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.owner)
                        .setTitle('Admin role added')
                        .setDescription(`<@&${role.id}> has been granted admin permissions in this server.`)
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
                            .setTitle('Already registered')
                            .setDescription(`<@&${role.id}> already has admin permissions in this server.`),
                    ],
                });
                return;
            }

            logger.error({ err: error }, '❌ [owner] add-admin-role failed');
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.error)
                        .setTitle('Something went wrong')
                        .setDescription('Failed to add admin role. Please try again later.'),
                ],
                ephemeral: true,
            });
        }
    }

    if (subcommand === 'remove-admin-role') {
        try {
            await removeAdminRole(guild.id, role.id, interaction.user.id);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.owner)
                        .setTitle('Admin role removed')
                        .setDescription(`<@&${role.id}> no longer has admin permissions in this server.`)
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
                            .setDescription(`<@&${role.id}> does not have admin permissions in this server.`),
                    ],
                });
                return;
            }

            logger.error({ err: error }, '❌ [owner] remove-admin-role failed');
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colours.error)
                        .setTitle('Something went wrong')
                        .setDescription('Failed to remove admin role. Please try again later.'),
                ],
                ephemeral: true,
            });
        }
    }
}