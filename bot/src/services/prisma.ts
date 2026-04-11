import { PrismaClient } from '../../../db/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../utils/logger';

// ============================================================================
// PRISMA CLIENT SINGLETON
// ============================================================================
// Instantiates a single PrismaClient for the lifetime of the bot process.
// Prisma 7 requires a driver adapter — PrismaPg is used for PostgreSQL.
// A single instance is enforced to prevent connection pool exhaustion.

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    logger.error('❌ Missing required environment variable: DATABASE_URL — please check your .env file.');
    process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

/**
 * Singleton Prisma client instance.
 * Import this wherever database access is required — never instantiate a new client.
 */
export const prisma = new PrismaClient({ adapter });