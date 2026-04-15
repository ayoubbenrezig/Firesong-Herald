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
// In Docker local development, proxies /auth/* requests to the API container.

export const handle: Handle = async ({ event, resolve }) => {
    // ── Auth proxy (Docker local only) ────────────────────────────────────────
    if (event.url.pathname.startsWith('/auth/')) {
        const apiUrl = process.env.API_URL;
        if (apiUrl) {
            const response = await fetch(`${apiUrl}${event.url.pathname}${event.url.search}`, {
                method: event.request.method,
                headers: event.request.headers,
                redirect: 'manual',
            });

            const location = response.headers.get('location');
            if (location && response.status >= 300 && response.status < 400) {
                const headers = new Headers({ location });

                const setCookie = response.headers.get('set-cookie');
                if (setCookie) {
                    headers.set('set-cookie', setCookie);
                }

                return new Response(null, {
                    status: response.status,
                    headers,
                });
            }

            return response;
        }
    }

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