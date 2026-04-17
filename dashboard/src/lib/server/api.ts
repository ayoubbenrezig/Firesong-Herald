// ============================================================================
// SERVER-SIDE API CLIENT
// ============================================================================
// Typed fetch helper for calling the Firesong Herald API from SvelteKit
// server-side load functions. Forwards the session cookie automatically.
// Never import this from client-side code.

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// ============================================================================
// TYPES
// ============================================================================

export interface TesterCheckResult {
    isTester: boolean;
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Checks whether a Discord user is a registered tester by querying the API.
 * Returns false on any error to fail safely — access is denied if unsure.
 *
 * @param discordUserId - The Discord snowflake ID of the user to check.
 * @returns True if the user is a registered tester, false otherwise.
 */
export async function checkIsTester(discordUserId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/testers/${encodeURIComponent(discordUserId)}`);

        if (response.status === 404) {
            return false;
        }

        if (!response.ok) {
            console.error(`[api] checkIsTester failed: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json() as TesterCheckResult;
        return data.isTester === true;
    } catch (error) {
        console.error('[api] checkIsTester error:', error instanceof Error ? error.message : error);
        return false;
    }
}

export interface BotInviteResult {
    botInviteUrl: string | null;
}

/**
 * Fetches the Discord bot invite URL from the API.
 * Returns null on any error.
 *
 * @returns The bot invite URL, or null if not configured or on error.
 */
export async function getBotInviteUrl(): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/config/bot-invite`);

        if (!response.ok) {
            console.error(`[api] getBotInviteUrl failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json() as BotInviteResult;
        return data.botInviteUrl ?? null;
    } catch (error) {
        console.error('[api] getBotInviteUrl error:', error instanceof Error ? error.message : error);
        return null;
    }
}