import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

// ============================================================================
// USERS ROUTES
// ============================================================================

/**
 * Registers user-related routes.
 *
 * Routes:
 *   DELETE /users/:discordUserId — Deletes the user's account and all associated data,
 *                                  leaves the bot from any servers they invited it to,
 *                                  and marks those servers as inactive.
 */
export async function userRoutes(app: FastifyInstance): Promise<void> {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

    if (!BOT_TOKEN) {
        app.log.warn('⚠️  DISCORD_BOT_TOKEN is not set — bot will not be able to leave servers on account deletion');
    }

    /**
     * Deletes a user account and all associated data.
     *
     * Flow:
     *   1. Finds all servers where this user is the recorded inviter.
     *   2. Attempts to leave each of those servers via the Discord API.
     *   3. Marks each server as inactive with reason 'admin_account_deleted'.
     *   4. Deletes the Tester record if one exists.
     *   5. Deletes the User record — cascades to UserReminderPreset.
     *
     * Server leave failures are logged but do not block deletion.
     *
     * @returns 204 on success.
     * @returns 404 if the user record does not exist.
     * @returns 500 on unexpected error.
     */
    app.delete<{ Params: { discordUserId: string } }>(
        '/users/:discordUserId',
        async function (request, reply) {
            const { discordUserId } = request.params;

            try {
                // ── Verify user exists ────────────────────────────────────────
                const user = await prisma.user.findUnique({
                    where: { discordUserId },
                    select: { discordUserId: true },
                });

                if (!user) {
                    return reply.status(404).send({ error: 'User not found' });
                }

                // ── Find servers this user invited the bot to ─────────────────
                const ownedServers = await prisma.server.findMany({
                    where: { invitedBy: discordUserId },
                    select: { discordServerId: true },
                });

                // ── Leave each server and mark as inactive ────────────────────
                for (const server of ownedServers) {
                    if (BOT_TOKEN) {
                        try {
                            const leaveResponse = await fetch(
                                `https://discord.com/api/v10/users/@me/guilds/${server.discordServerId}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bot ${BOT_TOKEN}`,
                                    },
                                },
                            );

                            if (!leaveResponse.ok && leaveResponse.status !== 204) {
                                app.log.warn(
                                    { discordServerId: server.discordServerId, status: leaveResponse.status },
                                    'Failed to leave Discord server — proceeding with deactivation anyway',
                                );
                            } else {
                                app.log.info(
                                    { discordServerId: server.discordServerId },
                                    'Bot left Discord server due to admin account deletion',
                                );
                            }
                        } catch (leaveError) {
                            app.log.error(
                                { err: leaveError, discordServerId: server.discordServerId },
                                'Error calling Discord API to leave server — proceeding with deactivation anyway',
                            );
                        }
                    }

                    try {
                        await prisma.server.update({
                            where: { discordServerId: server.discordServerId },
                            data: {
                                status: 'inactive',
                                deactivationReason: 'admin_account_deleted',
                            },
                        });

                        app.log.info(
                            { discordServerId: server.discordServerId },
                            'Server marked inactive due to admin account deletion',
                        );
                    } catch (updateError) {
                        app.log.error(
                            { err: updateError, discordServerId: server.discordServerId },
                            'Failed to mark server as inactive',
                        );
                    }
                }

                // ── Delete Tester record if present ───────────────────────────
                await prisma.tester.deleteMany({
                    where: { discordUserId },
                });

                // ── Delete User record (cascades UserReminderPreset) ───────────
                await prisma.user.delete({
                    where: { discordUserId },
                });

                app.log.info({ discordUserId }, 'User account and associated data deleted');

                return reply.status(204).send();
            } catch (error) {
                app.log.error({ err: error, discordUserId }, 'Failed to delete user account');
                return reply.status(500).send({ error: 'Internal server error' });
            }
        },
    );
}