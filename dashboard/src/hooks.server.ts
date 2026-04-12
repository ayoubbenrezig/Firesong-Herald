import { redirect, type Handle } from '@sveltejs/kit';
import { verifySession, isProtectedRoute } from '$lib/server/auth';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

// ============================================================================
// SERVER HOOK
// ============================================================================
// Runs before every request. Verifies the JWT session cookie and protects
// all routes under /app from unauthenticated access.

export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');
    const jwtSecret = process.env.JWT_SECRET ?? '';

    if (!jwtSecret) {
        console.error('❌ JWT_SECRET is not set — all sessions will be rejected');
    }

    const result = verifySession(session, jwtSecret);

    if (session && !result.valid) {
        console.warn('⚠️  Session cookie present but verification failed');
    }

    event.locals.user = result.valid ? result.user : null;

    if (isProtectedRoute(event.url.pathname) && !result.valid) {
        redirect(303, '/login');
    }

    return resolve(event);
};