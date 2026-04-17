/**
 * Unit tests for the server-side API client helper.
 *
 * Tests cover:
 * - checkIsTester: returns true on 200, false on 404, false on other errors,
 *   false on network failure, false on malformed response, URL encoding
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkIsTester } from '$lib/server/api';

// ============================================================================
// checkIsTester
// ============================================================================

describe('checkIsTester', () => {

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // ───── Registered tester ─────

    it('returns true when API responds 200 with isTester true', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(JSON.stringify({ isTester: true }), { status: 200 })
        );

        const result = await checkIsTester('123456789');
        expect(result).toBe(true);
    });

    // ───── Not a tester ─────

    it('returns false when API responds 404', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(JSON.stringify({ isTester: false }), { status: 404 })
        );

        const result = await checkIsTester('999999999');
        expect(result).toBe(false);
    });

    // ───── API errors ─────

    it('returns false when API responds 500', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
        );

        const result = await checkIsTester('123456789');
        expect(result).toBe(false);
    });

    it('returns false when API responds 503', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(null, { status: 503 })
        );

        const result = await checkIsTester('123456789');
        expect(result).toBe(false);
    });

    // ───── Network failure ─────

    it('returns false when fetch throws a network error', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await checkIsTester('123456789');
        expect(result).toBe(false);
    });

    it('returns false when fetch throws a timeout error', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));

        const result = await checkIsTester('123456789');
        expect(result).toBe(false);
    });

    // ───── Malformed response ─────

    it('returns false when API responds 200 but isTester is false', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(JSON.stringify({ isTester: false }), { status: 200 })
        );

        const result = await checkIsTester('123456789');
        expect(result).toBe(false);
    });

    it('returns false when API responds 200 but body is missing isTester field', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(JSON.stringify({}), { status: 200 })
        );

        const result = await checkIsTester('123456789');
        expect(result).toBe(false);
    });

    it('returns false when API responds 200 but body is empty', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response('', { status: 200 })
        );

        const result = await checkIsTester('123456789');
        expect(result).toBe(false);
    });

    // ───── URL encoding ─────

    it('URL-encodes the discordUserId before fetching', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(JSON.stringify({ isTester: true }), { status: 200 })
        );

        await checkIsTester('123 456');

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('123%20456')
        );
    });
});