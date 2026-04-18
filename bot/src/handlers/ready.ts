import { Events, type Client } from 'discord.js';
import { prisma } from '../services/prisma.js';
import { sendDm, DmType } from '../services/dmService.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// READY EVENT
// ============================================================================
// Fired once when the bot successfully connects to Discord.
//
// On startup, all guilds the bot is currently in are checked against the
// ApprovedServer table. Any guild not in the approved list will receive a
// rejection DM to the owner before the bot leaves.
// This guards against servers that were added while the bot was offline.

// noinspection JSUnusedGlobalSymbols -- consumed dynamically by eventHandler
export const name = Events.ClientReady;
export const once = true;

/**
 * Handles the ClientReady event.
 *
 * @param client - The connected Discord.js client.
 */
// noinspection JSUnusedGlobalSymbols -- consumed dynamically by eventHandler
export async function execute(client: Client): Promise<void> {
    logger.info(
        { tag: client.user?.tag, id: client.user?.id, guilds: client.guilds.cache.size },
        'Bot is online',
    );

    await auditGuildsOnStartup(client);
}

// ============================================================================
// STARTUP GUILD AUDIT
// ============================================================================

/**
 * Checks all guilds the bot is currently in against the ApprovedServer table.
 * Leaves any guild that is not approved, DMing the owner first.
 *
 * This handles the case where the bot was invited to a server while offline,
 * bypassing the guildCreate event handler.
 *
 * @param client - The connected Discord.js client.
 */
async function auditGuildsOnStartup(client: Client): Promise<void> {
    logger.info('Running startup guild approval audit');

    try {
        // Fetch all approved server IDs in one query.
        const approvedServers = await prisma.approvedServer.findMany({
            select: { discordServerId: true },
        });

        const approvedIds = new Set(approvedServers.map((s: { discordServerId: string }) => s.discordServerId));

        for (const [, guild] of client.guilds.cache) {
            if (approvedIds.has(guild.id)) {
                continue;
            }

            logger.warn(
                { guildId: guild.id, guildName: guild.name },
                'Unapproved server found on startup — bot will leave',
            );

            // Attempt to DM the owner before leaving.
            try {
                const owner = await guild.fetchOwner();

                await sendDm(owner.user, {
                    type: DmType.GuildRejected,
                    serverName: guild.name,
                });
            } catch (error) {
                logger.warn(
                    { err: error, guildId: guild.id },
                    'Could not fetch guild owner to send rejection DM on startup',
                );
            }

            // Leave regardless of whether the DM succeeded.
            try {
                await guild.leave();

                logger.info(
                    { guildId: guild.id, guildName: guild.name },
                    'Bot left unapproved server on startup',
                );
            } catch (error) {
                logger.error(
                    { err: error, guildId: guild.id, guildName: guild.name },
                    'Failed to leave unapproved server on startup',
                );
            }
        }

        logger.info('Startup guild approval audit complete');
    } catch (error) {
        logger.error({ err: error }, 'Failed to run startup guild approval audit');
    }
}