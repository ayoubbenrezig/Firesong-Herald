/**
 * Unit tests for ownerService module.
 *
 * Tests cover:
 * - Adding an admin role (happy path, already exists, DB failure)
 * - Removing an admin role (happy path, not found, DB failure)
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
import { addAdminRole, removeAdminRole } from '../services/ownerService';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

// ============================================================================
// FIXTURES
// ============================================================================

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

describe('addAdminRole', () => {
    it('creates and returns the server role when it does not exist', async () => {
        prismaMock.serverRole.findUnique.mockResolvedValue(null);
        prismaMock.serverRole.create.mockResolvedValue(baseServerRole);

        const result = await addAdminRole('123456789', '987654321', '111111111');

        expect(prismaMock.serverRole.create).toHaveBeenCalledOnce();
        expect(result).toEqual(baseServerRole);
    });

    it('throws ALREADY_EXISTS if the role is already registered', async () => {
        prismaMock.serverRole.findUnique.mockResolvedValue(baseServerRole);

        await expect(addAdminRole('123456789', '987654321', '111111111')).rejects.toThrow('ALREADY_EXISTS');
        expect(prismaMock.serverRole.create).not.toHaveBeenCalled();
    });

    it('throws a clean error if the database operation fails', async () => {
        prismaMock.serverRole.findUnique.mockResolvedValue(null);
        prismaMock.serverRole.create.mockRejectedValue(new Error('DB connection lost'));

        await expect(addAdminRole('123456789', '987654321', '111111111')).rejects.toThrow('Failed to add admin role. Please try again later.');
    });
});

describe('removeAdminRole', () => {
    it('deletes and returns the server role when it exists', async () => {
        prismaMock.serverRole.findUnique.mockResolvedValue(baseServerRole);
        prismaMock.serverRole.delete.mockResolvedValue(baseServerRole);

        const result = await removeAdminRole('123456789', '987654321', '111111111');

        expect(prismaMock.serverRole.delete).toHaveBeenCalledOnce();
        expect(result).toEqual(baseServerRole);
    });

    it('throws NOT_FOUND if the role is not registered', async () => {
        prismaMock.serverRole.findUnique.mockResolvedValue(null);

        await expect(removeAdminRole('123456789', '987654321', '111111111')).rejects.toThrow('NOT_FOUND');
        expect(prismaMock.serverRole.delete).not.toHaveBeenCalled();
    });

    it('throws a clean error if the database operation fails', async () => {
        prismaMock.serverRole.findUnique.mockResolvedValue(baseServerRole);
        prismaMock.serverRole.delete.mockRejectedValue(new Error('DB connection lost'));

        await expect(removeAdminRole('123456789', '987654321', '111111111')).rejects.toThrow('Failed to remove admin role. Please try again later.');
    });
});