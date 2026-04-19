import { readable, type Readable } from 'svelte/store';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Union of all message types the WebSocket layer can emit.
 * Must stay in sync with WsMessage in api/src/plugins/websocket.ts.
 */
export type WsMessage =
    | { type: 'event.created'; payload: Record<string, unknown> }
    | { type: 'event.updated'; payload: Record<string, unknown> }
    | { type: 'event.deleted'; payload: { eventId: string } }
    | { type: 'rsvp.updated'; payload: Record<string, unknown> }
    | { type: 'ping' };

/**
 * The shape of the store value exposed to subscribers.
 */
export interface WsState {
    connected: boolean;
    lastMessage: WsMessage | null;
}

// ============================================================================
// STORE
// ============================================================================

/**
 * Creates a readable Svelte store that manages a WebSocket connection to the
 * Firesong Herald API for a given Discord server.
 *
 * On subscribe:
 *   1. Fetches a short-lived WS handshake token from /ws-token.
 *   2. Opens a WebSocket connection to /ws with the token and serverId.
 *   3. Updates the store on connect, message, and disconnect.
 *   4. Closes the socket on unsubscribe (when all subscribers are gone).
 *
 * Components subscribe to the store and react to `lastMessage` without
 * polling. Forms and edit views should check the message type before
 * reacting to avoid disrupting user input.
 *
 * @param serverId - The Discord server ID to subscribe to.
 * @param apiBase  - The base URL of the API (e.g. https://firesongherald.com).
 * @returns A readable store of WsState.
 */
export function createWsStore(serverId: string, apiBase: string): Readable<WsState> {
    return readable<WsState>(
        { connected: false, lastMessage: null },
        function start(set) {
            let socket: WebSocket | null = null;
            let disposed = false;

            async function connect(): Promise<void> {
                // ── Fetch short-lived WS token ────────────────────────────────
                let token: string;

                try {
                    const response = await fetch(`${apiBase}/ws-token`, {
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        console.error('[ws] Failed to fetch WS token:', response.status);
                        return;
                    }

                    const data = await response.json() as { token: string };
                    token = data.token;
                } catch (error) {
                    console.error('[ws] Error fetching WS token:', error);
                    return;
                }

                if (disposed) {
                    return;
                }

                // ── Open WebSocket connection ─────────────────────────────────
                const wsBase = apiBase.replace(/^http/, 'ws');
                const url = `${wsBase}/ws?token=${encodeURIComponent(token)}&serverId=${encodeURIComponent(serverId)}`;

                try {
                    socket = new WebSocket(url);
                } catch (error) {
                    console.error('[ws] Failed to open WebSocket:', error);
                    return;
                }

                socket.addEventListener('open', function () {
                    set({ connected: true, lastMessage: null });
                });

                socket.addEventListener('message', function (event: MessageEvent<string>) {
                    try {
                        const message = JSON.parse(event.data) as WsMessage;
                        set({ connected: true, lastMessage: message });
                    } catch (error) {
                        console.error('[ws] Failed to parse message:', error);
                    }
                });

                socket.addEventListener('close', function () {
                    set({ connected: false, lastMessage: null });
                });

                socket.addEventListener('error', function (event) {
                    console.error('[ws] Socket error:', event);
                    set({ connected: false, lastMessage: null });
                });
            }

            connect();

            // ── Cleanup ───────────────────────────────────────────────────────
            return function stop() {
                disposed = true;
                if (socket) {
                    socket.close();
                    socket = null;
                }
            };
        },
    );
}