import { type ServerRole } from '../../../db/generated/prisma/client.js';
import { prisma } from './prisma.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPES
// ============================================================================

/** Result of an add or remove admin role operation. */
export interface AdminRoleResult {
    discordServerId: string;
    discordRoleId: string;
    permissionLevel: string;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Grants admin permissions to a Discord role in a server.
 * Throws if the role already has admin permissions.
 *
 * @param guildId - The Discord guild snowflake ID.
 * @param roleId  - The Discord role snowflake ID.
 * @param addedBy - The Discord user ID of the owner performing the action.
 * @returns The created ServerRole record.
 * @throws If the role is already registered or the database operation fails.
 */
export async function addAdminRole(
    guildId: string,
    roleId: string,
    addedBy: string,
): Promise<ServerRole> {
    const existing = await prisma.serverRole.findUnique({
        where: {
            discordServerId_discordRoleId: {
                discordServerId: guildId,
                discordRoleId: roleId,
            },
        },
    });

    if (existing) {
        throw new Error('ALREADY_EXISTS');
    }

    try {
        return await prisma.serverRole.create({
            data: {
                discordServerId: guildId,
                discordRoleId: roleId,
                permissionLevel: 'admin',
            },
        });
    } catch (error) {
        logger.error({ err: error, guildId, roleId, addedBy }, '❌ [ownerService] Failed to add admin role');
        throw new Error('Failed to add admin role. Please try again later.');
    }
}

/**
 * Revokes admin permissions from a Discord role in a server.
 * Throws if the role does not have admin permissions.
 *
 * @param guildId - The Discord guild snowflake ID.
 * @param roleId  - The Discord role snowflake ID.
 * @param removedBy - The Discord user ID of the owner performing the action.
 * @returns The deleted ServerRole record.
 * @throws If the role is not registered or the database operation fails.
 */
export async function removeAdminRole(
    guildId: string,
    roleId: string,
    removedBy: string,
): Promise<ServerRole> {
    const existing = await prisma.serverRole.findUnique({
        where: {
            discordServerId_discordRoleId: {
                discordServerId: guildId,
                discordRoleId: roleId,
            },
        },
    });

    if (!existing) {
        throw new Error('NOT_FOUND');
    }

    try {
        return await prisma.serverRole.delete({
            where: {
                discordServerId_discordRoleId: {
                    discordServerId: guildId,
                    discordRoleId: roleId,
                },
            },
        });
    } catch (error) {
        logger.error({ err: error, guildId, roleId, removedBy }, '❌ [ownerService] Failed to remove admin role');
        throw new Error('Failed to remove admin role. Please try again later.');
    }
}