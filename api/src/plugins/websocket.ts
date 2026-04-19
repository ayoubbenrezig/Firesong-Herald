import type { FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import type { WebSocket } from 'ws';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Union of all message types the WebSocket layer can emit.
 * Extend this as new event types are added.
 */
export type WsMessage =
    | { type: 'event.created'; payload: Record<string, unknown> }
    | { type: 'event.updated'; payload: Record<string, unknown> }
    | { type: 'event.deleted'; payload: { eventId: string } }
    | { type: 'rsvp.updated'; payload: Record<string, unknown> }
    | { type: 'ping' };

// ============================================================================
// CLIENT REGISTRY
// ============================================================================

/**
 * Map of Discord server ID → set of connected WebSocket clients.
 * Scoped to this module — mutated only via registerClient/removeClient.
 */
const clients = new Map<string, Set<WebSocket>>();

/**
 * Registers a WebSocket client for a given server.
 *
 * @param serverId - The Discord server ID.
 * @param socket   - The WebSocket connection to register.
 */
export function registerClient(serverId: string, socket: WebSocket): void {
    if (!clients.has(serverId)) {
        clients.set(serverId, new Set());
    }

    clients.get(serverId)!.add(socket);
}

/**
 * Removes a WebSocket client from the registry.
 *
 * @param serverId - The Discord server ID.
 * @param socket   - The WebSocket connection to remove.
 */
export function removeClient(serverId: string, socket: WebSocket): void {
    const serverClients = clients.get(serverId);

    if (!serverClients) {
        return;
    }

    serverClients.delete(socket);

    if (serverClients.size === 0) {
        clients.delete(serverId);
    }
}

/**
 * Broadcasts a typed message to all connected dashboard clients
 * subscribed to a given Discord server.
 *
 * @param serverId - The Discord server (guild) ID to target.
 * @param message  - The payload to send.
 */
export function broadcast(serverId: string, message: WsMessage): void {
    const serverClients = clients.get(serverId);

    if (!serverClients || serverClients.size === 0) {
        return;
    }

    const payload = JSON.stringify(message);

    for (const socket of serverClients) {
        if (socket.readyState === socket.OPEN) {
            socket.send(payload);
        }
    }
}

// ============================================================================
// PLUGIN
// ============================================================================

/**
 * Registers the @fastify/websocket plugin on the Fastify instance.
 *
 * @param app - The Fastify instance.
 */
export async function websocketPlugin(app: FastifyInstance): Promise<void> {
    await app.register(fastifyWebsocket);
}