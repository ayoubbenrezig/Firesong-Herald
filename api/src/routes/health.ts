import { type FastifyInstance } from 'fastify';

// ============================================================================
// HEALTH ROUTE
// ============================================================================
// Simple health check endpoint used by Docker and monitoring tools.

/**
 * Registers the health check route on the Fastify instance.
 *
 * @param app - The Fastify instance.
 */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
    app.get('/health', async (_request, reply) => {
        await reply.send({ status: 'ok' });
    });
}