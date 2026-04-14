import { type Tester, type ApprovedServer, type ServerRole } from '../../../db/generated/prisma/client';
import { prisma } from './prisma';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

/** Result of checking whether a user holds an admin role in a server. */
export interface AdminCheckResult {
    isAdmin: boolean;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Checks whether a Discord member holds at least one admin role in a server.
 *
 * @param guildId       - The Discord guild snowflake ID.
 * @param memberRoleIds - The role IDs the interacting member currently holds.
 * @returns True if the member has at least one registered admin role.
 * @throws If the database query fails.
 */
export async function checkIsAdmin(
    guildId: string,
    memberRoleIds: string[],
): Promise<boolean> {
    try {
        const adminRoles = await prisma.serverRole.findMany({
            where: {
                discordServerId: guildId,
                permissionLevel: 'admin',
            },
            select: { discordRoleId: true },
        });

        const adminRoleIds = adminRoles.map((r: Pick<ServerRole, 'discordRoleId'>) => r.discordRoleId);
        return memberRoleIds.some(id => adminRoleIds.includes(id));
    } catch (error) {
        logger.error({ err: error, guildId }, '❌ [adminService] Failed to check admin roles');
        throw new Error('Failed to verify permissions. Please try again later.');
    }
}

/**
 * Approves a Discord user as a dashboard tester.
 * Throws if the user is already approved.
 *
 * @param discordUserId - The Discord user snowflake ID.
 * @param addedBy       - The Discord user ID of the admin performing the action.
 * @returns The created Tester record.
 * @throws If the user is already a tester or the database operation fails.
 */
export async function addTester(
    discordUserId: string,
    addedBy: string,
): Promise<Tester> {
    const existing = await prisma.tester.findUnique({
        where: { discordUserId },
    });

    if (existing) {
        throw new Error('ALREADY_EXISTS');
    }

    try {
        return await prisma.tester.create({
            data: {
                discordUserId,
                addedBy,
            },
        });
    } catch (error) {
        logger.error({ err: error, discordUserId, addedBy }, '❌ [adminService] Failed to add tester');
        throw new Error('Failed to add tester. Please try again later.');
    }
}

/**
 * Revokes dashboard tester access from a Discord user.
 * Throws if the user is not currently a tester.
 *
 * @param discordUserId - The Discord user snowflake ID.
 * @param removedBy     - The Discord user ID of the admin performing the action.
 * @returns The deleted Tester record.
 * @throws If the user is not a tester or the database operation fails.
 */
export async function removeTester(
    discordUserId: string,
    removedBy: string,
): Promise<Tester> {
    const existing = await prisma.tester.findUnique({
        where: { discordUserId },
    });

    if (!existing) {
        throw new Error('NOT_FOUND');
    }

    try {
        return await prisma.tester.delete({
            where: { discordUserId },
        });
    } catch (error) {
        logger.error({ err: error, discordUserId, removedBy }, '❌ [adminService] Failed to remove tester');
        throw new Error('Failed to remove tester. Please try again later.');
    }
}

/**
 * Approves a Discord server for bot testing.
 * Throws if the server is already approved.
 *
 * @param discordServerId - The Discord guild snowflake ID.
 * @param addedBy         - The Discord user ID of the admin performing the action.
 * @returns The created ApprovedServer record.
 * @throws If the server is already approved or the database operation fails.
 */
export async function approveServer(
    discordServerId: string,
    addedBy: string,
): Promise<ApprovedServer> {
    const existing = await prisma.approvedServer.findUnique({
        where: { discordServerId },
    });

    if (existing) {
        throw new Error('ALREADY_EXISTS');
    }

    try {
        return await prisma.approvedServer.create({
            data: {
                discordServerId,
                addedBy,
            },
        });
    } catch (error) {
        logger.error({ err: error, discordServerId, addedBy }, '❌ [adminService] Failed to approve server');
        throw new Error('Failed to approve server. Please try again later.');
    }
}

/**
 * Revokes bot testing approval from a Discord server.
 * Throws if the server is not currently approved.
 *
 * @param discordServerId - The Discord guild snowflake ID.
 * @param removedBy       - The Discord user ID of the admin performing the action.
 * @returns The deleted ApprovedServer record.
 * @throws If the server is not approved or the database operation fails.
 */
export async function revokeServer(
    discordServerId: string,
    removedBy: string,
): Promise<ApprovedServer> {
    const existing = await prisma.approvedServer.findUnique({
        where: { discordServerId },
    });

    if (!existing) {
        throw new Error('NOT_FOUND');
    }

    try {
        return await prisma.approvedServer.delete({
            where: { discordServerId },
        });
    } catch (error) {
        logger.error({ err: error, discordServerId, removedBy }, '❌ [adminService] Failed to revoke server');
        throw new Error('Failed to revoke server. Please try again later.');
    }
}