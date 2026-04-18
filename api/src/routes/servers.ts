import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

// ============================================================================
// SERVERS ROUTES
// ============================================================================

/** Shape of the POST /servers/invite request body. */
interface InviteBody {
    discordServerId: string;
    invitedBy: string;
}

/**
 * Registers server-related routes.
 *
 * Routes:
 *   POST /servers/invite — Creates a pending server record and returns the bot invite URL
 */
export async function serverRoutes(app: FastifyInstance): Promise<void> {
    const BOT_INVITE_URL = process.env.BOT_INVITE_URL;

    if (!BOT_INVITE_URL) {
        app.log.warn('⚠️  BOT_INVITE_URL is not set — /servers/invite will return an error');
    }

    /**
     * Creates a pending server record to associate the inviter with the server
     * when the bot fires guildCreate. Returns the bot invite URL for the dashboard
     * to redirect the user to Discord's invite flow.
     *
     * If a pending record already exists for the server, it is replaced —
     * this handles the case where a tester retries a cancelled invite.
     *
     * @returns 200 { botInviteUrl } on success.
     * @returns 400 if the request body is invalid.
     * @returns 500 if the database operation fails or BOT_INVITE_URL is not set.
     */
    app.post<{ Body: InviteBody }>(
        '/servers/invite',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['discordServerId', 'invitedBy'],
                    properties: {
                        discordServerId: { type: 'string', minLength: 1 },
                        invitedBy:       { type: 'string', minLength: 1 },
                    },
                },
            },
        },
        async function (request, reply) {
            if (!BOT_INVITE_URL) {
                app.log.error('BOT_INVITE_URL is not set — cannot process invite request');
                return reply.status(500).send({ error: 'Bot invite URL is not configured' });
            }

            const { discordServerId, invitedBy } = request.body;

            try {
                await prisma.pendingServer.upsert({
                    where:  { discordServerId },
                    create: { discordServerId, invitedBy },
                    update: { invitedBy, createdAt: new Date() },
                });

                app.log.info({ discordServerId, invitedBy }, 'Pending server record upserted');
            } catch (error) {
                app.log.error({ err: error, discordServerId, invitedBy }, 'Failed to upsert pending server record');
                return reply.status(500).send({ error: 'Internal server error' });
            }

            return reply.status(200).send({ botInviteUrl: BOT_INVITE_URL });
        },
    );
}