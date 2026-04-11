import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { logger } from './lib/logger.js';
import { healthRoutes } from './routes/health.js';

// ============================================================================
// SERVER BOOTSTRAP
// ============================================================================

const PORT = Number(process.env.API_PORT) || 3001;
const HOST = process.env.API_HOST || '0.0.0.0';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Builds and configures the Fastify instance with all plugins and routes.
 *
 * @returns The configured Fastify instance.
 */
async function buildServer(): Promise<ReturnType<typeof Fastify>> {
    const app = Fastify({
        logger: {
            level: NODE_ENV === 'production' ? 'info' : 'debug',
            transport: NODE_ENV !== 'production'
                ? {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:HH:MM:ss',
                        ignore: 'pid,hostname',
                    },
                }
                : undefined,
        },
    });

    // ── Security headers ──────────────────────────────────────────────────────
    await app.register(helmet);

    // ── CORS ─────────────────────────────────────────────────────────────────
    await app.register(cors, {
        origin: NODE_ENV === 'production' ? DASHBOARD_URL : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // ── Rate limiting ─────────────────────────────────────────────────────────
    await app.register(rateLimit, {
        global: true,
        max: 100,
        timeWindow: '1 minute',
    });

    // ── Routes ────────────────────────────────────────────────────────────────
    await app.register(healthRoutes);

    return app;
}

/**
 * Starts the API server.
 */
async function start(): Promise<void> {
    try {
        const app = await buildServer();
        await app.listen({ port: PORT, host: HOST });
        logger.info(`🚀 API running on https://${HOST}:${PORT}`);
    } catch (error) {
        logger.error({ err: error }, '❌ Failed to start API');
        process.exit(1);
    }
}

await start();