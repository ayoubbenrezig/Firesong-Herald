import pkg from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

const { verify } = pkg;

// ============================================================================
// AUTH UTILITIES
// ============================================================================
// Pure server-side authentication helpers.
// Extracted from hooks.server.ts to be independently testable.

// ============================================================================
// TYPES
// ============================================================================

export interface SessionUser {
    discordId: string;
    username: string;
    avatar: string | null;
    globalName: string | null;
}

export type SessionResult =
    | { valid: true; user: SessionUser }
    | { valid: false; user: null };

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Verifies a JWT session cookie and returns the decoded user payload.
 * Returns { valid: false } if the token is missing, expired, or tampered with.
 *
 * @param sessionCookie - The raw JWT from the session cookie.
 * @param jwtSecret     - The secret used to verify the token signature.
 * @returns A SessionResult indicating validity and decoded user data.
 */
export function verifySession(
    sessionCookie: string | undefined,
    jwtSecret: string
): SessionResult {
    if (typeof sessionCookie !== 'string' || sessionCookie.trim().length === 0) {
        return { valid: false, user: null };
    }

    try {
        const payload = verify(sessionCookie, jwtSecret) as JwtPayload;

        if (
            typeof payload.discordId !== 'string' ||
            typeof payload.username !== 'string'
        ) {
            console.warn('⚠️  JWT payload missing required fields:', {
                hasDiscordId: typeof payload.discordId,
                hasUsername: typeof payload.username,
            });
            return { valid: false, user: null };
        }

        return {
            valid: true,
            user: {
                discordId: payload.discordId,
                username: payload.username,
                avatar: typeof payload.avatar === 'string' ? payload.avatar : null,
                globalName: typeof payload.globalName === 'string' ? payload.globalName : null,
            },
        };
    } catch (error) {
        console.error('❌ JWT verification failed:', error instanceof Error ? error.message : error);
        return { valid: false, user: null };
    }
}

/**
 * Determines whether a given pathname requires authentication.
 * Only matches /app exactly or /app/ prefixed routes — not /app-anything.
 *
 * @param pathname - The URL pathname to check.
 * @returns True if the route is protected, false otherwise.
 */
export function isProtectedRoute(pathname: string): boolean {
    return pathname === '/app' || pathname.startsWith('/app/');
}