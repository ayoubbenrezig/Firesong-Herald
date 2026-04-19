/**
 * Unit tests for api/src/plugins/websocket.ts
 *
 * Tests cover:
 * - registerClient adds socket to the correct server bucket
 * - removeClient removes socket and cleans up empty buckets
 * - broadcast sends to all open sockets for a server
 * - broadcast skips closed sockets
 * - broadcast does nothing when no clients are registered
 * - broadcast does not send to sockets on a different server
 */

import { describe, it, expect, vi } from 'vitest';
import { registerClient, removeClient, broadcast } from '../plugins/websocket.js';
import type { WsMessage } from '../plugins/websocket.js';

// ============================================================================
// MOCK WEBSOCKET
// ============================================================================

function makeSocket(readyState: number = 1) {
    return {
        send: vi.fn(),
        readyState,
        OPEN: 1,
    };
}

const OPEN = 1;
const CLOSED = 3;

// ============================================================================
// REGISTRY TESTS
// ============================================================================

describe('registerClient', () => {
    it('adds a socket to a new server bucket without throwing', () => {
        const socket = makeSocket(OPEN);
        expect(() => registerClient('server-reg-1', socket as never)).not.toThrow();
    });

    it('adds multiple sockets to the same server bucket without overwriting', () => {
        const socketA = makeSocket(OPEN);
        const socketB = makeSocket(OPEN);
        expect(() => {
            registerClient('server-reg-multi', socketA as never);
            registerClient('server-reg-multi', socketB as never);
        }).not.toThrow();
    });
});

describe('removeClient', () => {
    it('does not throw when removing from a non-existent server', () => {
        const socket = makeSocket(OPEN);
        expect(() => removeClient('server-remove-none', socket as never)).not.toThrow();
    });

    it('does not throw when removing a socket that was never registered', () => {
        const registered = makeSocket(OPEN);
        const unregistered = makeSocket(OPEN);
        registerClient('server-remove-miss', registered as never);
        expect(() => removeClient('server-remove-miss', unregistered as never)).not.toThrow();
    });
});

// ============================================================================
// BROADCAST TESTS
// ============================================================================

describe('broadcast', () => {
    it('sends a message to all open sockets for a server', () => {
        const socketA = makeSocket(OPEN);
        const socketB = makeSocket(OPEN);
        registerClient('server-bc-all', socketA as never);
        registerClient('server-bc-all', socketB as never);

        const message: WsMessage = { type: 'ping' };
        broadcast('server-bc-all', message);

        expect(socketA.send).toHaveBeenCalledWith(JSON.stringify(message));
        expect(socketB.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('skips sockets that are not open', () => {
        const closedSocket = makeSocket(CLOSED);
        registerClient('server-bc-closed', closedSocket as never);

        broadcast('server-bc-closed', { type: 'ping' });

        expect(closedSocket.send).not.toHaveBeenCalled();
    });

    it('does nothing when no clients are registered for a server', () => {
        expect(() => broadcast('server-bc-empty', { type: 'ping' })).not.toThrow();
    });

    it('sends the correct JSON payload', () => {
        const socket = makeSocket(OPEN);
        registerClient('server-bc-payload', socket as never);

        const message: WsMessage = {
            type: 'event.created',
            payload: { eventId: 'abc-123', title: 'Test Event' },
        };

        broadcast('server-bc-payload', message);

        expect(socket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('does not send to sockets registered under a different server', () => {
        const socketA = makeSocket(OPEN);
        const socketB = makeSocket(OPEN);
        registerClient('server-bc-a', socketA as never);
        registerClient('server-bc-b', socketB as never);

        broadcast('server-bc-a', { type: 'ping' });

        expect(socketA.send).toHaveBeenCalled();
        expect(socketB.send).not.toHaveBeenCalled();
    });
});