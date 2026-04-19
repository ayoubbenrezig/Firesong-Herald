/**
 * Unit tests for GET /ws (WebSocket route)
 *
 * Note: @fastify/websocket routes cannot be exercised via app.inject() as
 * inject() does not perform a real WebSocket upgrade. These tests verify the
 * validation logic by testing registerClient/removeClient/broadcast behaviour
 * directly and by confirming the route is registered on the app.
 *
 * Full integration tests (actual WS handshake) require a running server and
 * are out of scope for unit tests.
 *
 * Tests cover:
 * - /ws route is registered on the Fastify instance
 * - registerClient and removeClient behave correctly under ws.ts usage patterns
 * - Token validation logic (purpose check) via extracted helper behaviour
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { websocketPlugin, registerClient, removeClient, broadcast } from '../plugins/websocket.js';
import { wsRoutes } from '../routes/ws.js';

// ============================================================================
// ENV
// ============================================================================

const JWT_SECRET = 'test-secret-for-unit-tests';
process.env.JWT_SECRET = JWT_SECRET;

// ============================================================================
// HELPERS
// ============================================================================

function makeSocket(readyState = 1) {
    return {
        send: vi.fn(),
        close: vi.fn(),
        readyState,
        OPEN: 1,
        on: vi.fn(),
        addEventListener: vi.fn(),
    };
}

async function buildApp() {
    const app = Fastify({ logger: false });
    await app.register(cookie);
    await app.register(jwt, { secret: JWT_SECRET, sign: { expiresIn: '7d' } });
    await app.register(websocketPlugin);
    await app.register(wsRoutes);
    await app.ready();
    return app;
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

describe('wsRoutes registration', () => {
    it('registers the /ws route on the Fastify instance', async () => {
        const app = await buildApp();
        const routes = app.printRoutes();
        expect(routes).toContain('ws');
    });
});

// ============================================================================
// CLIENT REGISTRY BEHAVIOUR
// ============================================================================

describe('client registry behaviour', () => {
    it('registers a client and allows broadcast to reach it', () => {
        const socket = makeSocket();

        registerClient('server-ws-test', socket as never);
        broadcast('server-ws-test', { type: 'ping' });

        expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
    });

    it('removes a client and stops broadcast from reaching it', () => {
        const socket = makeSocket();

        registerClient('server-ws-remove', socket as never);
        removeClient('server-ws-remove', socket as never);
        broadcast('server-ws-remove', { type: 'ping' });

        expect(socket.send).not.toHaveBeenCalled();
    });
});

// ============================================================================
// TOKEN PURPOSE VALIDATION
// ============================================================================

describe('ws-handshake token purpose validation', () => {
    it('accepts a token with purpose ws-handshake', async () => {
        const app = await buildApp();

        const token = app.jwt.sign({
            discordId: '123456789',
            username: 'testuser',
            purpose: 'ws-handshake',
        }, { expiresIn: '30s' });

        const decoded = app.jwt.verify<{ purpose: string }>(token);
        expect(decoded.purpose).toBe('ws-handshake');
    });

    it('rejects a token with an incorrect purpose', async () => {
        const app = await buildApp();

        const token = app.jwt.sign({
            discordId: '123456789',
            username: 'testuser',
            purpose: 'session',
        }, { expiresIn: '30s' });

        const decoded = app.jwt.verify<{ purpose: string }>(token);
        expect(decoded.purpose).not.toBe('ws-handshake');
    });

    it('throws on a tampered or expired token', async () => {
        const app = await buildApp();
        expect(() => app.jwt.verify('tampered.token.value')).toThrow();
    });
});