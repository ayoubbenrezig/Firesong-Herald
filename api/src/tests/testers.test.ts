/**
 * Unit tests for GET /testers/:discordUserId
 *
 * Tests cover:
 * - 200 + { isTester: true } when user is a registered tester
 * - 404 + { isTester: false } when user is not found
 * - 500 when the database throws
 * - URL encoding of discordUserId
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { testerRoutes } from '../routes/testers.js';

// ── Mock Prisma ───────────────────────────────────────────────────────────────

vi.mock('../lib/prisma.js', () => ({
    prisma: {
        tester: {
            findUnique: vi.fn(),
        },
    },
}));

import { prisma } from '../lib/prisma.js';

const mockFindUnique = prisma.tester.findUnique as ReturnType<typeof vi.fn>;

// ── Test setup ────────────────────────────────────────────────────────────────

async function buildApp() {
    const app = Fastify({ logger: false });
    await app.register(testerRoutes);
    return app;
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ============================================================================
// GET /testers/:discordUserId
// ============================================================================

describe('GET /testers/:discordUserId', () => {

    // ───── Registered tester ─────

    it('returns 200 and isTester true when user is a registered tester', async () => {
        mockFindUnique.mockResolvedValueOnce({ discordUserId: '123456789' });

        const app = await buildApp();
        const response = await app.inject({
            method: 'GET',
            url: '/testers/123456789',
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ isTester: true });
    });

    // ───── Not a tester ─────

    it('returns 404 and isTester false when user is not found', async () => {
        mockFindUnique.mockResolvedValueOnce(null);

        const app = await buildApp();
        const response = await app.inject({
            method: 'GET',
            url: '/testers/999999999',
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toEqual({ isTester: false });
    });

    // ───── Database error ─────

    it('returns 500 when the database throws', async () => {
        mockFindUnique.mockRejectedValueOnce(new Error('DB connection lost'));

        const app = await buildApp();
        const response = await app.inject({
            method: 'GET',
            url: '/testers/123456789',
        });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toEqual({ error: 'Internal server error' });
    });

    // ───── URL encoded ID ─────

    it('handles a URL-encoded discordUserId correctly', async () => {
        mockFindUnique.mockResolvedValueOnce({ discordUserId: '123 456' });

        const app = await buildApp();
        const response = await app.inject({
            method: 'GET',
            url: '/testers/123%20456',
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ isTester: true });
    });

    // ───── Prisma called with correct ID ─────

    it('queries Prisma with the exact discordUserId from the URL', async () => {
        mockFindUnique.mockResolvedValueOnce({ discordUserId: '123456789' });

        const app = await buildApp();
        await app.inject({
            method: 'GET',
            url: '/testers/123456789',
        });

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { discordUserId: '123456789' },
            select: { discordUserId: true },
        });
    });
});