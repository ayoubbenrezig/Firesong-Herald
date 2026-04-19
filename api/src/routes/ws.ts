import type { FastifyInstance } from 'fastify';
import { registerClient, removeClient } from '../plugins/websocket.js';
import { logger } from '../lib/logger.js';

// ============================================================================
// WS ROUTE
// ============================================================================

/**
 * Registers the WebSocket connection route.
 *
 * Clients connect to `/ws?token=<ws-handshake-jwt>&serverId=<discord-server-id>`.
 * The token is validated on connect. If invalid or missing, the socket is
 * closed immediately with code 4401. On successful validation, the client is
 * registered in the per-server client map and receives a `ping` on connect
 * to confirm the connection is live.
 *
 * Routes:
 *   GET /ws — WebSocket upgrade endpoint
 */
export async function wsRoutes(app: FastifyInstance): Promise<void> {
    app.get(
        '/ws',
        { websocket: true },
        async function (socket, request) {
            const query = request.query as Record<string, string | undefined>;
            const token = query['token'];
            const serverId = query['serverId'];

            // ── Validate required params ──────────────────────────────────────
            if (!token || !serverId) {
                logger.warn('WS connection rejected — missing token or serverId');
                socket.close(4401, 'Missing token or serverId');
                return;
            }

            // ── Validate token ────────────────────────────────────────────────
            let payload: {
                discordId: string;
                username: string;
                purpose: string;
            };

            try {
                payload = app.jwt.verify<typeof payload>(token);
            } catch (error) {
                logger.warn({ err: error }, 'WS connection rejected — invalid or expired token');
                socket.close(4401, 'Invalid or expired token');
                return;
            }

            if (payload.purpose !== 'ws-handshake') {
                logger.warn(
                    { discordId: payload.discordId },
                    'WS connection rejected — token purpose mismatch',
                );
                socket.close(4401, 'Invalid token purpose');
                return;
            }

            // ── Register client ───────────────────────────────────────────────
            registerClient(serverId, socket);

            logger.info(
                { discordId: payload.discordId, serverId },
                'WebSocket client connected',
            );

            // ── Confirm connection ────────────────────────────────────────────
            socket.send(JSON.stringify({ type: 'ping' }));

            // ── Cleanup on disconnect ─────────────────────────────────────────
            socket.on('close', function () {
                removeClient(serverId, socket);
                logger.info(
                    { discordId: payload.discordId, serverId },
                    'WebSocket client disconnected',
                );
            });

            socket.on('error', function (error: Error) {
                removeClient(serverId, socket);
                logger.error(
                    { err: error, discordId: payload.discordId, serverId },
                    'WebSocket client error',
                );
            });
        },
    );
}