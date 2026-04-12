import { redirect, type Handle } from '@sveltejs/kit';
import { isAuthenticated, isProtectedRoute } from '$lib/server/auth';

// ============================================================================
// SERVER HOOK
// ============================================================================
// Runs before every request. Protects all routes under /app from
// unauthenticated access.

export const handle: Handle = async ({ event, resolve }) => {
    if (isProtectedRoute(event.url.pathname)) {
        const session = event.cookies.get('session');

        if (!isAuthenticated(session)) {
            redirect(303, '/login');
        }
    }

    return resolve(event);
};