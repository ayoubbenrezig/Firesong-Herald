import { Events, type Guild } from 'discord.js';
import { prisma } from '../services/prisma.js';
import { sendDm, DmType } from '../services/dmService.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// GUILD CREATE EVENT
// ============================================================================
// Fired when the bot is added to a Discord server.
//
// Flow:
//   1. Check if the server is in the ApprovedServer table.
//   2. If not approved — send a DM to the owner explaining the situation,
//      then leave the server immediately.
//   3. If approved — upsert the server into the Server table and DM the owner.

// noinspection JSUnusedGlobalSymbols -- consumed dynamically by eventHandler
export const name = Events.GuildCreate;
export const once = false;

/**
 * Handles the GuildCreate event.
 *
 * @param guild - The Discord guild the bot was added to.
 */
// noinspection JSUnusedGlobalSymbols -- consumed dynamically by eventHandler
export async function execute(guild: Guild): Promise<void> {
    logger.info({ guildId: guild.id, guildName: guild.name }, 'Bot added to server');

    try {
        // ── Check approval status ─────────────────────────────────────────────
        const approved = await prisma.approvedServer.findUnique({
            where: { discordServerId: guild.id },
        });

        if (!approved) {
            await handleUnapprovedGuild(guild, null);
            return;
        }

        await handleApprovedGuild(guild, null);
    } catch (error) {
        logger.error(
            { err: error, guildId: guild.id, guildName: guild.name },
            'Unhandled error in guildCreate handler',
        );
    }
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Handles a guild that is not in the approved list.
 * Attempts to DM the inviter (or owner as fallback), then leaves the server.
 *
 * @param guild     - The unapproved guild.
 * @param invitedBy - Discord user ID of the tester who initiated the invite, if known.
 */
async function handleUnapprovedGuild(guild: Guild, invitedBy: string | null): Promise<void> {
    logger.warn(
        { guildId: guild.id, guildName: guild.name },
        'Server is not approved — bot will leave',
    );

    // DM the inviter if known, otherwise fall back to the server owner.
    try {
        const dmTarget = invitedBy
            ? await guild.client.users.fetch(invitedBy)
            : (await guild.fetchOwner()).user;

        await sendDm(dmTarget, {
            type: DmType.GuildRejected,
            serverName: guild.name,
        });
    } catch (error) {
        logger.warn(
            { err: error, guildId: guild.id },
            'Could not send rejection DM',
        );
    }

    // Leave the server regardless of whether the DM succeeded.
    try {
        await guild.leave();

        logger.info(
            { guildId: guild.id, guildName: guild.name },
            'Bot left unapproved server',
        );
    } catch (error) {
        logger.error(
            { err: error, guildId: guild.id, guildName: guild.name },
            'Failed to leave unapproved server',
        );
    }
}

/**
 * Handles a guild that is in the approved list.
 * Upserts the server record with invitedBy and DMs the inviter a welcome message.
 *
 * @param guild     - The approved guild.
 * @param invitedBy - Discord user ID of the tester who initiated the invite, if known.
 */
async function handleApprovedGuild(guild: Guild, invitedBy: string | null): Promise<void> {
    logger.info(
        { guildId: guild.id, guildName: guild.name },
        'Server is approved — registering',
    );

    // Upsert the server record — safe to call multiple times.
    try {
        await prisma.server.upsert({
            where: { discordServerId: guild.id },
            create: { discordServerId: guild.id, invitedBy },
            update: { status: 'active' },
        });

        logger.info(
            { guildId: guild.id, guildName: guild.name, invitedBy },
            'Server record upserted',
        );
    } catch (error) {
        logger.error(
            { err: error, guildId: guild.id },
            'Failed to upsert server record on guildCreate',
        );

        // Do not proceed with the DM if registration failed.
        return;
    }

    // DM the inviter if known, otherwise fall back to the server owner.
    try {
        const dmTarget = invitedBy
            ? await guild.client.users.fetch(invitedBy)
            : (await guild.fetchOwner()).user;

        await sendDm(dmTarget, {
            type: DmType.GuildApproved,
            serverName: guild.name,
        });
    } catch (error) {
        logger.warn(
            { err: error, guildId: guild.id },
            'Could not send approval DM',
        );
    }
}