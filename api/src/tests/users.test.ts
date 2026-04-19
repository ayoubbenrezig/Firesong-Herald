/**
 * Unit tests for DELETE /users/:discordUserId
 *
 * Tests cover:
 * - 204 when user has no owned servers and no tester record
 * - 204 when user has multiple owned servers — bot leaves each, each marked inactive
 * - 204 when user is a registered tester — tester record is deleted
 * - 204 when user is both a tester and has owned servers
 * - 204 when Discord API leave call fails — server still marked inactive, deletion continues
 * - 204 when Discord API leave call throws — server still marked inactive, deletion continues
 * - 204 when BOT_TOKEN is not set — Discord call skipped, server marked inactive, deletion continues
 * - 204 when server update fails — error logged, deletion still continues
 * - 404 when user does not exist
 * - 500 when prisma.user.findUnique throws
 * - 500 when prisma.user.delete throws
 * - Correct Prisma call arguments throughout
 * - No Discord API calls made when user has no owned servers
 * - deleteMany on Tester is always called regardless of tester existence
 * - deactivationReason is always set to 'admin_account_deleted'
 * - status is always set to 'inactive' on owned servers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { userRoutes } from '../routes/users.js';

// ── Mock Prisma ───────────────────────────────────────────────────────────────

vi.mock('../lib/prisma.js', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            delete:     vi.fn(),
        },
        server: {
            findMany: vi.fn(),
            update:   vi.fn(),
        },
        tester: {
            deleteMany: vi.fn(),
        },
    },
}));

// ── Mock global fetch ─────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ── Imports after mocks ───────────────────────────────────────────────────────

import { prisma } from '../lib/prisma.js';

const mockUserFindUnique = prisma.user.findUnique  as ReturnType<typeof vi.fn>;
const mockUserDelete     = prisma.user.delete      as ReturnType<typeof vi.fn>;
const mockServerFindMany = prisma.server.findMany  as ReturnType<typeof vi.fn>;
const mockServerUpdate   = prisma.server.update    as ReturnType<typeof vi.fn>;
const mockTesterDelete   = prisma.tester.deleteMany as ReturnType<typeof vi.fn>;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function buildApp() {
    const app = Fastify({ logger: false });
    await app.register(userRoutes);
    return app;
}

/** Returns a mock 204 response from the Discord leave endpoint. */
function discordLeaveOk(): Response {
    return new Response(null, { status: 204 }) as Response;
}

/** Returns a mock non-2xx response from the Discord leave endpoint. */
function discordLeaveFail(status: number): Response {
    return new Response(null, { status }) as Response;
}

// ── Test setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
    vi.clearAllMocks();
    process.env.DISCORD_TOKEN = 'test-bot-token';
});

afterEach(() => {
    delete process.env.DISCORD_TOKEN;
});

// ============================================================================
// DELETE /users/:discordUserId
// ============================================================================

describe('DELETE /users/:discordUserId', () => {

    // ── Happy path — no servers, no tester record ─────────────────────────────

    it('returns 204 when user exists with no owned servers and no tester record', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '111' });
        mockServerFindMany.mockResolvedValueOnce([]);
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/111' });

        expect(response.statusCode).toBe(204);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    // ── Happy path — owned servers ────────────────────────────────────────────

    it('returns 204 and leaves each owned server when user has multiple owned servers', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '222' });
        mockServerFindMany.mockResolvedValueOnce([
            { discordServerId: 'srv-1' },
            { discordServerId: 'srv-2' },
        ]);
        mockFetch.mockResolvedValue(discordLeaveOk());
        mockServerUpdate.mockResolvedValue({});
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/222' });

        expect(response.statusCode).toBe(204);
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://discord.com/api/v10/users/@me/guilds/srv-1',
            expect.objectContaining({ method: 'DELETE' }),
        );
        expect(mockFetch).toHaveBeenCalledWith(
            'https://discord.com/api/v10/users/@me/guilds/srv-2',
            expect.objectContaining({ method: 'DELETE' }),
        );
    });

    it('marks each owned server inactive with reason admin_account_deleted', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '222' });
        mockServerFindMany.mockResolvedValueOnce([
            { discordServerId: 'srv-1' },
            { discordServerId: 'srv-2' },
        ]);
        mockFetch.mockResolvedValue(discordLeaveOk());
        mockServerUpdate.mockResolvedValue({});
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/222' });

        expect(mockServerUpdate).toHaveBeenCalledTimes(2);
        expect(mockServerUpdate).toHaveBeenCalledWith({
            where: { discordServerId: 'srv-1' },
            data: { status: 'inactive', deactivationReason: 'admin_account_deleted' },
        });
        expect(mockServerUpdate).toHaveBeenCalledWith({
            where: { discordServerId: 'srv-2' },
            data: { status: 'inactive', deactivationReason: 'admin_account_deleted' },
        });
    });

    // ── Happy path — tester record ────────────────────────────────────────────

    it('returns 204 and deletes the tester record when user is a registered tester', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '333' });
        mockServerFindMany.mockResolvedValueOnce([]);
        mockTesterDelete.mockResolvedValueOnce({ count: 1 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/333' });

        expect(response.statusCode).toBe(204);
        expect(mockTesterDelete).toHaveBeenCalledWith({ where: { discordUserId: '333' } });
    });

    it('calls tester deleteMany even when user is not a tester', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '444' });
        mockServerFindMany.mockResolvedValueOnce([]);
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/444' });

        expect(mockTesterDelete).toHaveBeenCalledWith({ where: { discordUserId: '444' } });
    });

    // ── Happy path — tester with owned servers ────────────────────────────────

    it('returns 204 when user is both a tester and has owned servers', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '555' });
        mockServerFindMany.mockResolvedValueOnce([{ discordServerId: 'srv-3' }]);
        mockFetch.mockResolvedValueOnce(discordLeaveOk());
        mockServerUpdate.mockResolvedValueOnce({});
        mockTesterDelete.mockResolvedValueOnce({ count: 1 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/555' });

        expect(response.statusCode).toBe(204);
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockTesterDelete).toHaveBeenCalledWith({ where: { discordUserId: '555' } });
        expect(mockUserDelete).toHaveBeenCalledWith({ where: { discordUserId: '555' } });
    });

    // ── Discord API failure — non-2xx ─────────────────────────────────────────

    it('still marks server inactive and deletes user when Discord leave returns non-2xx', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '666' });
        mockServerFindMany.mockResolvedValueOnce([{ discordServerId: 'srv-4' }]);
        mockFetch.mockResolvedValueOnce(discordLeaveFail(403));
        mockServerUpdate.mockResolvedValueOnce({});
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/666' });

        expect(response.statusCode).toBe(204);
        expect(mockServerUpdate).toHaveBeenCalledWith({
            where: { discordServerId: 'srv-4' },
            data: { status: 'inactive', deactivationReason: 'admin_account_deleted' },
        });
        expect(mockUserDelete).toHaveBeenCalled();
    });

    // ── Discord API failure — throws ──────────────────────────────────────────

    it('still marks server inactive and deletes user when Discord leave call throws', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '777' });
        mockServerFindMany.mockResolvedValueOnce([{ discordServerId: 'srv-5' }]);
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        mockServerUpdate.mockResolvedValueOnce({});
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/777' });

        expect(response.statusCode).toBe(204);
        expect(mockServerUpdate).toHaveBeenCalledWith({
            where: { discordServerId: 'srv-5' },
            data: { status: 'inactive', deactivationReason: 'admin_account_deleted' },
        });
        expect(mockUserDelete).toHaveBeenCalled();
    });

    // ── BOT_TOKEN not set ─────────────────────────────────────────────────────

    it('skips Discord call but still marks server inactive and deletes user when BOT_TOKEN is not set', async () => {
        delete process.env.DISCORD_TOKEN;

        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '888' });
        mockServerFindMany.mockResolvedValueOnce([{ discordServerId: 'srv-6' }]);
        mockServerUpdate.mockResolvedValueOnce({});
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/888' });

        expect(response.statusCode).toBe(204);
        expect(mockFetch).not.toHaveBeenCalled();
        expect(mockServerUpdate).toHaveBeenCalledWith({
            where: { discordServerId: 'srv-6' },
            data: { status: 'inactive', deactivationReason: 'admin_account_deleted' },
        });
        expect(mockUserDelete).toHaveBeenCalled();
    });

    // ── Server update fails ───────────────────────────────────────────────────

    it('continues with user deletion when server update throws', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '999' });
        mockServerFindMany.mockResolvedValueOnce([{ discordServerId: 'srv-7' }]);
        mockFetch.mockResolvedValueOnce(discordLeaveOk());
        mockServerUpdate.mockRejectedValueOnce(new Error('DB write failed'));
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/999' });

        expect(response.statusCode).toBe(204);
        expect(mockUserDelete).toHaveBeenCalled();
    });

    // ── 404 — user not found ──────────────────────────────────────────────────

    it('returns 404 when user does not exist', async () => {
        mockUserFindUnique.mockResolvedValueOnce(null);

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/000' });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toEqual({ error: 'User not found' });
    });

    it('does not call server lookup or delete when user is not found', async () => {
        mockUserFindUnique.mockResolvedValueOnce(null);

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/000' });

        expect(mockServerFindMany).not.toHaveBeenCalled();
        expect(mockTesterDelete).not.toHaveBeenCalled();
        expect(mockUserDelete).not.toHaveBeenCalled();
    });

    // ── 500 — findUnique throws ───────────────────────────────────────────────

    it('returns 500 when prisma.user.findUnique throws', async () => {
        mockUserFindUnique.mockRejectedValueOnce(new Error('DB connection lost'));

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/111' });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toEqual({ error: 'Internal server error' });
    });

    // ── 500 — user.delete throws ──────────────────────────────────────────────

    it('returns 500 when prisma.user.delete throws', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '111' });
        mockServerFindMany.mockResolvedValueOnce([]);
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockRejectedValueOnce(new Error('Constraint violation'));

        const app = await buildApp();
        const response = await app.inject({ method: 'DELETE', url: '/users/111' });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toEqual({ error: 'Internal server error' });
    });

    // ── Correct Prisma call shapes ────────────────────────────────────────────

    it('calls prisma.user.findUnique with correct select shape', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '123' });
        mockServerFindMany.mockResolvedValueOnce([]);
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/123' });

        expect(mockUserFindUnique).toHaveBeenCalledWith({
            where: { discordUserId: '123' },
            select: { discordUserId: true },
        });
    });

    it('calls prisma.server.findMany with correct where shape', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '123' });
        mockServerFindMany.mockResolvedValueOnce([]);
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/123' });

        expect(mockServerFindMany).toHaveBeenCalledWith({
            where: { invitedBy: '123' },
            select: { discordServerId: true },
        });
    });

    it('calls prisma.user.delete with correct where shape', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '123' });
        mockServerFindMany.mockResolvedValueOnce([]);
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/123' });

        expect(mockUserDelete).toHaveBeenCalledWith({ where: { discordUserId: '123' } });
    });

    it('calls Discord leave with correct Authorization header', async () => {
        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '123' });
        mockServerFindMany.mockResolvedValueOnce([{ discordServerId: 'srv-8' }]);
        mockFetch.mockResolvedValueOnce(discordLeaveOk());
        mockServerUpdate.mockResolvedValueOnce({});
        mockTesterDelete.mockResolvedValueOnce({ count: 0 });
        mockUserDelete.mockResolvedValueOnce({});

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/123' });

        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: { Authorization: 'Bot test-bot-token' },
            }),
        );
    });

    // ── Ordering — user deleted after servers processed ───────────────────────

    it('deletes user only after all servers have been processed', async () => {
        const callOrder: string[] = [];

        mockUserFindUnique.mockResolvedValueOnce({ discordUserId: '123' });
        mockServerFindMany.mockResolvedValueOnce([{ discordServerId: 'srv-9' }]);
        mockFetch.mockImplementationOnce(async () => {
            callOrder.push('discord-leave');
            return discordLeaveOk();
        });
        mockServerUpdate.mockImplementationOnce(async () => {
            callOrder.push('server-update');
            return {};
        });
        mockTesterDelete.mockImplementationOnce(async () => {
            callOrder.push('tester-delete');
            return { count: 0 };
        });
        mockUserDelete.mockImplementationOnce(async () => {
            callOrder.push('user-delete');
            return {};
        });

        const app = await buildApp();
        await app.inject({ method: 'DELETE', url: '/users/123' });

        expect(callOrder).toEqual(['discord-leave', 'server-update', 'tester-delete', 'user-delete']);
    });
});