import type { FastifyInstance } from 'fastify';

// ============================================================================
// CONFIG ROUTES
// ============================================================================

/**
 * Registers configuration routes.
 * Exposes safe, non-secret server-side configuration values to the dashboard.
 *
 * Routes:
 *   GET /config/bot-invite — Returns the Discord bot invite URL
 */
export async function configRoutes(app: FastifyInstance): Promise<void> {
    const BOT_INVITE_URL = process.env.BOT_INVITE_URL;

    if (!BOT_INVITE_URL) {
        app.log.warn('⚠️  BOT_INVITE_URL is not set — /config/bot-invite will return null');
    }

    /**
     * Returns the Discord bot invite URL from environment configuration.
     * Returns null if the variable is not set.
     */
    app.get('/config/bot-invite', async function (_request, reply) {
        return reply.status(200).send({ botInviteUrl: BOT_INVITE_URL ?? null });
    });
}