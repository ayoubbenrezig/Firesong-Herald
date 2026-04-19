/**
 * Unit tests for GET /ws-token
 *
 * Tests cover:
 * - 401 when no session cookie is present
 * - 401 when the session cookie contains an invalid JWT
 * - 200 and a signed token when session is valid
 * - returned token contains purpose: 'ws-handshake'
 * - returned token expires within 30 seconds
 * - returned token contains the correct discordId
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { wsTokenRoutes } from '../routes/wsToken.js';

// ============================================================================
// ENV
// ============================================================================

const JWT_SECRET = 'test-secret-for-unit-tests';
process.env.JWT_SECRET = JWT_SECRET;

// ============================================================================
// HELPERS
// ============================================================================

async function buildApp() {
    const app = Fastify({ logger: false });
    await app.register(cookie);
    await app.register(jwt, { secret: JWT_SECRET, sign: { expiresIn: '7d' } });
    await app.register(wsTokenRoutes);
    await app.ready();
    return app;
}

async function signSessionCookie(app: Awaited<ReturnType<typeof buildApp>>): Promise<string> {
    return app.jwt.sign({
        discordId: '123456789',
        username: 'testuser',
        avatar: null,
        globalName: null,
    });
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ============================================================================
// GET /ws-token
// ============================================================================

describe('GET /ws-token', () => {

    // ───── No session cookie ─────

    it('returns 401 when no session cookie is present', async () => {
        const app = await buildApp();
        const response = await app.inject({
            method: 'GET',
            url: '/ws-token',
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({ error: 'No session cookie present' });
    });

    // ───── Invalid session JWT ─────

    it('returns 401 when the session cookie contains an invalid JWT', async () => {
        const app = await buildApp();
        const response = await app.inject({
            method: 'GET',
            url: '/ws-token',
            cookies: { session: 'not.a.valid.jwt' },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toEqual({ error: 'Invalid or expired session' });
    });

    // ───── Valid session ─────

    it('returns 200 and a token when session is valid', async () => {
        const app = await buildApp();
        const sessionToken = await signSessionCookie(app);

        const response = await app.inject({
            method: 'GET',
            url: '/ws-token',
            cookies: { session: sessionToken },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('token');
        expect(typeof response.json().token).toBe('string');
    });

    // ───── Token purpose ─────

    it('returned token contains purpose: ws-handshake', async () => {
        const app = await buildApp();
        const sessionToken = await signSessionCookie(app);

        const response = await app.inject({
            method: 'GET',
            url: '/ws-token',
            cookies: { session: sessionToken },
        });

        const { token } = response.json() as { token: string };
        const decoded = app.jwt.decode<{ purpose: string }>(token);

        expect(decoded?.purpose).toBe('ws-handshake');
    });

    // ───── Token expiry ─────

    it('returned token expires within 30 seconds', async () => {
        const app = await buildApp();
        const sessionToken = await signSessionCookie(app);

        const before = Math.floor(Date.now() / 1000);

        const response = await app.inject({
            method: 'GET',
            url: '/ws-token',
            cookies: { session: sessionToken },
        });

        const { token } = response.json() as { token: string };
        const decoded = app.jwt.decode<{ exp: number }>(token);

        expect(decoded?.exp).toBeGreaterThan(before);
        expect(decoded?.exp).toBeLessThanOrEqual(before + 30);
    });

    // ───── Token identity ─────

    it('returned token contains the correct discordId', async () => {
        const app = await buildApp();
        const sessionToken = await signSessionCookie(app);

        const response = await app.inject({
            method: 'GET',
            url: '/ws-token',
            cookies: { session: sessionToken },
        });

        const { token } = response.json() as { token: string };
        const decoded = app.jwt.decode<{ discordId: string }>(token);

        expect(decoded?.discordId).toBe('123456789');
    });
});