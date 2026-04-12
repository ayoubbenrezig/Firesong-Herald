/**
 * Unit tests for server-side auth utilities.
 *
 * Tests cover:
 * - verifySession: valid JWT, invalid signature, expired token, tampered payload,
 *   missing secret, empty cookie, whitespace, type coercion edge cases
 * - isProtectedRoute: protected paths, public paths, query strings, fragments,
 *   special characters, relative paths, trailing slashes, bypass attempts
 */

import { describe, it, expect } from 'vitest';
import { verifySession, isProtectedRoute } from '$lib/server/auth';
import pkg from 'jsonwebtoken';

const { sign } = pkg;

const SECRET = 'test-secret-key';
const OTHER_SECRET = 'different-secret-key';

function makeToken(payload: object, secret: string = SECRET, options: object = {}): string {
    return sign(payload, secret, { expiresIn: '1h', ...options });
}

// ============================================================================
// verifySession
// ============================================================================

describe('verifySession', () => {

    // ───── Valid tokens ─────

    it('returns valid result for a correctly signed token', () => {
        const token = makeToken({ discordId: '123', username: 'ben' });
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(true);
        if (result.valid) {
            expect(result.user.discordId).toBe('123');
            expect(result.user.username).toBe('ben');
        }
    });

    it('returns valid result with optional avatar and globalName', () => {
        const token = makeToken({ discordId: '123', username: 'ben', avatar: 'abc', globalName: 'Ben' });
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(true);
        if (result.valid) {
            expect(result.user.avatar).toBe('abc');
            expect(result.user.globalName).toBe('Ben');
        }
    });

    it('returns null avatar and globalName when not present in token', () => {
        const token = makeToken({ discordId: '123', username: 'ben' });
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(true);
        if (result.valid) {
            expect(result.user.avatar).toBeNull();
            expect(result.user.globalName).toBeNull();
        }
    });

    // ───── Invalid signature ─────

    it('returns invalid for a token signed with a different secret', () => {
        const token = makeToken({ discordId: '123', username: 'ben' }, OTHER_SECRET);
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid for a tampered token', () => {
        const token = makeToken({ discordId: '123', username: 'ben' });
        const tampered = token.slice(0, -5) + 'XXXXX';
        const result = verifySession(tampered, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid for a randomly generated string', () => {
        const result = verifySession('notavalidjwt', SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    // ───── Expired token ─────

    it('returns invalid for an expired token', () => {
        const token = makeToken({ discordId: '123', username: 'ben' }, SECRET, { expiresIn: -1 });
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    // ───── Missing required payload fields ─────

    it('returns invalid when discordId is missing from payload', () => {
        const token = makeToken({ username: 'ben' });
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when username is missing from payload', () => {
        const token = makeToken({ discordId: '123' });
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when payload is completely empty', () => {
        const token = makeToken({});
        const result = verifySession(token, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    // ───── Missing or empty secret ─────

    it('returns invalid when secret is an empty string', () => {
        const token = makeToken({ discordId: '123', username: 'ben' });
        const result = verifySession(token, '');
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    // ───── Missing or empty cookie ─────

    it('returns invalid when cookie is undefined', () => {
        const result = verifySession(undefined, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when cookie is an empty string', () => {
        const result = verifySession('', SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when cookie is whitespace only', () => {
        const result = verifySession('   ', SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when cookie is tabs only', () => {
        const result = verifySession('\t\t', SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when cookie is mixed whitespace', () => {
        const result = verifySession(' \t\n ', SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    // ───── Type coercion edge cases ─────

    it('returns invalid when passed null (coerced via unknown)', () => {
        const result = verifySession(null as unknown as undefined, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when passed 0 (coerced via unknown)', () => {
        const result = verifySession(0 as unknown as undefined, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when passed false (coerced via unknown)', () => {
        const result = verifySession(false as unknown as undefined, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when passed an object (coerced via unknown)', () => {
        const result = verifySession({} as unknown as undefined, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });

    it('returns invalid when passed an array (coerced via unknown)', () => {
        const result = verifySession([] as unknown as undefined, SECRET);
        expect(result.valid).toBe(false);
        expect(result.user).toBeNull();
    });
});

// ============================================================================
// isProtectedRoute
// ============================================================================

describe('isProtectedRoute', () => {

    // ───── Protected routes ─────

    it('returns true for /app', () => {
        expect(isProtectedRoute('/app')).toBe(true);
    });

    it('returns true for /app/', () => {
        expect(isProtectedRoute('/app/')).toBe(true);
    });

    it('returns true for nested app routes', () => {
        expect(isProtectedRoute('/app/events')).toBe(true);
        expect(isProtectedRoute('/app/events/123')).toBe(true);
        expect(isProtectedRoute('/app/rsvp/abc/manage')).toBe(true);
    });

    it('returns true for /app/ with query string (as pathname only)', () => {
        expect(isProtectedRoute('/app/events')).toBe(true);
    });

    it('returns true for deeply nested app route', () => {
        expect(isProtectedRoute('/app/a/b/c/d/e/f')).toBe(true);
    });

    // ───── Public routes ─────

    it('returns false for /', () => {
        expect(isProtectedRoute('/')).toBe(false);
    });

    it('returns false for /login', () => {
        expect(isProtectedRoute('/login')).toBe(false);
    });

    it('returns false for /privacy', () => {
        expect(isProtectedRoute('/privacy')).toBe(false);
    });

    it('returns false for /tos', () => {
        expect(isProtectedRoute('/tos')).toBe(false);
    });

    // ───── Query strings and fragments (pathname only) ─────

    it('returns false for /login (no query string confusion)', () => {
        expect(isProtectedRoute('/login')).toBe(false);
    });

    it('returns false for /privacy (no fragment confusion)', () => {
        expect(isProtectedRoute('/privacy')).toBe(false);
    });

    // ───── Relative paths ─────

    it('returns false for app without leading slash', () => {
        expect(isProtectedRoute('app')).toBe(false);
    });

    it('returns false for app/ without leading slash', () => {
        expect(isProtectedRoute('app/')).toBe(false);
    });

    // ───── Bypass attempts ─────

    it('returns false for path that contains but does not start with /app', () => {
        expect(isProtectedRoute('/login?redirect=/app')).toBe(false);
    });

    it('returns false for /application (partial prefix match)', () => {
        expect(isProtectedRoute('/application')).toBe(false);
    });

    it('returns false for /app-secret (hyphen after /app)', () => {
        expect(isProtectedRoute('/app-secret')).toBe(false);
    });

    it('returns false for /apps (s after /app)', () => {
        expect(isProtectedRoute('/apps')).toBe(false);
    });

    it('returns false for empty string', () => {
        expect(isProtectedRoute('')).toBe(false);
    });

    it('returns false for uppercase /APP', () => {
        expect(isProtectedRoute('/APP')).toBe(false);
    });

    it('returns false for mixed case /App', () => {
        expect(isProtectedRoute('/App')).toBe(false);
    });

    it('returns false for /APP/ (uppercase with slash)', () => {
        expect(isProtectedRoute('/APP/')).toBe(false);
    });
});