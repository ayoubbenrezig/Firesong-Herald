/**
 * Unit tests for adminService module.
 *
 * Tests cover:
 * - Admin role check (has access, no access, empty roles, DB failure)
 * - Adding a tester (happy path, already exists, DB failure)
 * - Removing a tester (happy path, not found, DB failure)
 * - Approving a server (happy path, already exists, DB failure)
 * - Revoking a server (happy path, not found, DB failure)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import { type PrismaClient } from '../../../db/generated/prisma/client';

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('../services/prisma', () => ({
    prisma: mockDeep<PrismaClient>(),
}));

vi.mock('../utils/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

import { prisma } from '../services/prisma';
import {
    checkIsAdmin,
    addTester,
    removeTester,
    approveServer,
    revokeServer,
} from '../services/adminService';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

// ============================================================================
// FIXTURES
// ============================================================================

const baseTester = {
    discordUserId: '111111111',
    addedBy: '222222222',
    addedAt: new Date(),
};

const baseApprovedServer = {
    discordServerId: '333333333',
    addedBy: '222222222',
    addedAt: new Date(),
};

const baseServerRole = {
    id: 'cuid_role_1',
    discordServerId: '123456789',
    discordRoleId: '987654321',
    permissionLevel: 'admin' as const,
};

// ============================================================================
// TESTS
// ============================================================================

beforeEach(() => {
    mockReset(prismaMock);
});

describe('checkIsAdmin', () => {
    it('returns true when the member holds a registered admin role', async () => {
        prismaMock.serverRole.findMany.mockResolvedValue([baseServerRole]);

        const result = await checkIsAdmin('123456789', ['987654321']);

        expect(result).toBe(true);
    });

    it('returns false when the member holds no registered admin roles', async () => {
        prismaMock.serverRole.findMany.mockResolvedValue([baseServerRole]);

        const result = await checkIsAdmin('123456789', ['000000000']);

        expect(result).toBe(false);
    });

    it('returns false when the member has no roles at all', async () => {
        prismaMock.serverRole.findMany.mockResolvedValue([baseServerRole]);

        const result = await checkIsAdmin('123456789', []);

        expect(result).toBe(false);
    });

    it('returns false when no admin roles are registered for the server', async () => {
        prismaMock.serverRole.findMany.mockResolvedValue([]);

        const result = await checkIsAdmin('123456789', ['987654321']);

        expect(result).toBe(false);
    });

    it('throws a clean error if the database query fails', async () => {
        prismaMock.serverRole.findMany.mockRejectedValue(new Error('DB connection lost'));

        await expect(checkIsAdmin('123456789', ['987654321'])).rejects.toThrow('Failed to verify permissions. Please try again later.');
    });
});

describe('addTester', () => {
    it('creates and returns the tester when they do not exist', async () => {
        prismaMock.tester.findUnique.mockResolvedValue(null);
        prismaMock.tester.create.mockResolvedValue(baseTester);

        const result = await addTester('111111111', '222222222');

        expect(prismaMock.tester.create).toHaveBeenCalledOnce();
        expect(result).toEqual(baseTester);
    });

    it('throws ALREADY_EXISTS if the user is already a tester', async () => {
        prismaMock.tester.findUnique.mockResolvedValue(baseTester);

        await expect(addTester('111111111', '222222222')).rejects.toThrow('ALREADY_EXISTS');
        expect(prismaMock.tester.create).not.toHaveBeenCalled();
    });

    it('throws a clean error if the database operation fails', async () => {
        prismaMock.tester.findUnique.mockResolvedValue(null);
        prismaMock.tester.create.mockRejectedValue(new Error('DB connection lost'));

        await expect(addTester('111111111', '222222222')).rejects.toThrow('Failed to add tester. Please try again later.');
    });
});

describe('removeTester', () => {
    it('deletes and returns the tester when they exist', async () => {
        prismaMock.tester.findUnique.mockResolvedValue(baseTester);
        prismaMock.tester.delete.mockResolvedValue(baseTester);

        const result = await removeTester('111111111', '222222222');

        expect(prismaMock.tester.delete).toHaveBeenCalledOnce();
        expect(result).toEqual(baseTester);
    });

    it('throws NOT_FOUND if the user is not a tester', async () => {
        prismaMock.tester.findUnique.mockResolvedValue(null);

        await expect(removeTester('111111111', '222222222')).rejects.toThrow('NOT_FOUND');
        expect(prismaMock.tester.delete).not.toHaveBeenCalled();
    });

    it('throws a clean error if the database operation fails', async () => {
        prismaMock.tester.findUnique.mockResolvedValue(baseTester);
        prismaMock.tester.delete.mockRejectedValue(new Error('DB connection lost'));

        await expect(removeTester('111111111', '222222222')).rejects.toThrow('Failed to remove tester. Please try again later.');
    });
});

describe('approveServer', () => {
    it('creates and returns the approved server when it does not exist', async () => {
        prismaMock.approvedServer.findUnique.mockResolvedValue(null);
        prismaMock.approvedServer.create.mockResolvedValue(baseApprovedServer);

        const result = await approveServer('333333333', '222222222');

        expect(prismaMock.approvedServer.create).toHaveBeenCalledOnce();
        expect(result).toEqual(baseApprovedServer);
    });

    it('throws ALREADY_EXISTS if the server is already approved', async () => {
        prismaMock.approvedServer.findUnique.mockResolvedValue(baseApprovedServer);

        await expect(approveServer('333333333', '222222222')).rejects.toThrow('ALREADY_EXISTS');
        expect(prismaMock.approvedServer.create).not.toHaveBeenCalled();
    });

    it('throws a clean error if the database operation fails', async () => {
        prismaMock.approvedServer.findUnique.mockResolvedValue(null);
        prismaMock.approvedServer.create.mockRejectedValue(new Error('DB connection lost'));

        await expect(approveServer('333333333', '222222222')).rejects.toThrow('Failed to approve server. Please try again later.');
    });
});

describe('revokeServer', () => {
    it('deletes and returns the approved server when it exists', async () => {
        prismaMock.approvedServer.findUnique.mockResolvedValue(baseApprovedServer);
        prismaMock.approvedServer.delete.mockResolvedValue(baseApprovedServer);

        const result = await revokeServer('333333333', '222222222');

        expect(prismaMock.approvedServer.delete).toHaveBeenCalledOnce();
        expect(result).toEqual(baseApprovedServer);
    });

    it('throws NOT_FOUND if the server is not approved', async () => {
        prismaMock.approvedServer.findUnique.mockResolvedValue(null);

        await expect(revokeServer('333333333', '222222222')).rejects.toThrow('NOT_FOUND');
        expect(prismaMock.approvedServer.delete).not.toHaveBeenCalled();
    });

    it('throws a clean error if the database operation fails', async () => {
        prismaMock.approvedServer.findUnique.mockResolvedValue(baseApprovedServer);
        prismaMock.approvedServer.delete.mockRejectedValue(new Error('DB connection lost'));

        await expect(revokeServer('333333333', '222222222')).rejects.toThrow('Failed to revoke server. Please try again later.');
    });
});