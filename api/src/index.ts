import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { logger } from './lib/logger.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { testerRoutes } from './routes/testers.js';
import { configRoutes } from './routes/config.js';
import { serverRoutes } from './routes/servers.js';
import { userRoutes } from './routes/users.js';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const possiblePaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
];

let envPath: string | null = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        envPath = p;
        break;
    }
}

if (envPath) {
    dotenv.config({ path: envPath });
} else {
    console.warn('⚠️  .env file not found, relying on system environment variables');
}

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

    await app.register(helmet);

    await app.register(cors, {
        origin: NODE_ENV === 'production' ? DASHBOARD_URL : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    await app.register(rateLimit, {
        global: true,
        max: 100,
        timeWindow: '1 minute',
    });

    await app.register(healthRoutes);
    await app.register(authRoutes);
    await app.register(testerRoutes);
    await app.register(configRoutes);
    await app.register(serverRoutes);
    await app.register(userRoutes);

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