import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from './logger.js';

// ============================================================================
// PRISMA CLIENT SINGLETON
// ============================================================================
// Instantiates a single PrismaClient for the lifetime of the API process.
// Prisma 7 requires a driver adapter — PrismaPg is used for PostgreSQL.
//
// The Prisma client is resolved dynamically from the monorepo root to avoid
// path breakage between the TypeScript source tree and the compiled output.

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve from the compiled file location up to the monorepo root, then into db/generated.
// Works in both dev (api/src/lib/) and production (api/dist/api/src/lib/).
const require = createRequire(import.meta.url);

function resolvePrismaClient(): string {
    // Walk up until we find the db/generated/prisma directory.
    const candidates = [
        resolve(__dirname, '../../../db/generated/prisma/index.js'),
        resolve(__dirname, '../../../../db/generated/prisma/index.js'),
        resolve(__dirname, '../../../../../db/generated/prisma/index.js'),
    ];

    for (const candidate of candidates) {
        try {
            require.resolve(candidate);
            return candidate;
        } catch {
            // Not found at this depth — try next.
        }
    }

    throw new Error(
        '❌ Could not locate Prisma generated client. ' +
        'Run `npx prisma generate` in the db/ directory.'
    );
}

const { PrismaClient } = require(resolvePrismaClient());

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