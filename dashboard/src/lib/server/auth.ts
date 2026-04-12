// ============================================================================
// AUTH UTILITIES
// ============================================================================
// Pure server-side authentication helpers.
// Extracted from hooks.server.ts to be independently testable.

/**
 * Determines whether a request is authenticated by checking for a valid
 * session cookie.
 *
 * @param sessionCookie - The value of the session cookie, or undefined if absent.
 * @returns True if a session cookie is present and non-empty, false otherwise.
 */
export function isAuthenticated(sessionCookie: string | undefined): boolean {
    return typeof sessionCookie === 'string' && sessionCookie.trim().length > 0;
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