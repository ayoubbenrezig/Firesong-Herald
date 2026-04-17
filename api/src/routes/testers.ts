import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

// ============================================================================
// TESTERS ROUTES
// ============================================================================

/**
 * Registers tester-related routes.
 *
 * Routes:
 *   GET /testers/:discordUserId — Returns 200 if the user is a registered tester, 404 otherwise.
 */
export async function testerRoutes(app: FastifyInstance): Promise<void> {

    /**
     * Check if a Discord user is a registered tester.
     * Used by the dashboard to gate access and conditionally render UI.
     *
     * @returns 200 { isTester: true } if found, 404 { isTester: false } if not.
     */
    app.get<{ Params: { discordUserId: string } }>(
        '/testers/:discordUserId',
        async function (request, reply) {
            const { discordUserId } = request.params;

            try {
                const tester = await prisma.tester.findUnique({
                    where: { discordUserId },
                    select: { discordUserId: true },
                });

                if (!tester) {
                    return reply.status(404).send({ isTester: false });
                }

                return reply.status(200).send({ isTester: true });
            } catch (error) {
                app.log.error({ err: error, discordUserId }, 'Failed to check tester status');
                return reply.status(500).send({ error: 'Internal server error' });
            }
        }
    );
}