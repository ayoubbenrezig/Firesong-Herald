import type { FastifyInstance } from 'fastify';
import { logger } from '../lib/logger.js';

// ============================================================================
// WS TOKEN ROUTE
// ============================================================================

/**
 * Registers the WebSocket token endpoint.
 *
 * This route is called by the dashboard once per page load before opening
 * a WebSocket connection. Because the session JWT is stored in an httpOnly
 * cookie (not accessible to JS), the dashboard cannot attach it directly to
 * the WS handshake. Instead, this endpoint verifies the session cookie and
 * issues a short-lived token (30 seconds) that the dashboard appends as a
 * query parameter when connecting.
 *
 * Routes:
 *   GET /ws-token — Returns a short-lived WS auth token for the calling user.
 */
export async function wsTokenRoutes(app: FastifyInstance): Promise<void> {
    const JWT_SECRET = process.env.JWT_SECRET!;

    if (!JWT_SECRET) {
        throw new Error('❌ Missing JWT_SECRET — cannot register ws-token route');
    }

    app.get('/ws-token', async function (request, reply) {
        const sessionCookie = request.cookies?.session;

        if (!sessionCookie) {
            return reply.status(401).send({ error: 'No session cookie present' });
        }

        // Verify the session cookie directly — request.jwtVerify() reads from
        // the Authorization header by default and cannot be used for cookies.
        let sessionPayload: {
            discordId: string;
            username: string;
            avatar: string | null;
            globalName: string | null;
        };

        try {
            sessionPayload = app.jwt.verify<typeof sessionPayload>(sessionCookie);
        } catch (error) {
            logger.warn({ err: error }, 'WS token request rejected — invalid session JWT');
            return reply.status(401).send({ error: 'Invalid or expired session' });
        }

        try {
            const wsToken = await reply.jwtSign(
                {
                    discordId: sessionPayload.discordId,
                    username: sessionPayload.username,
                    avatar: sessionPayload.avatar,
                    globalName: sessionPayload.globalName,
                    purpose: 'ws-handshake',
                },
                { expiresIn: '30s' },
            );

            return reply.send({ token: wsToken });
        } catch (error) {
            logger.error({ err: error }, 'Failed to sign WS handshake token');
            return reply.status(500).send({ error: 'Failed to issue token' });
        }
    });
}