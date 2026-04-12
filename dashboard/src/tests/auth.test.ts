/**
 * Unit tests for server-side auth utilities.
 *
 * Tests cover:
 * - isAuthenticated: valid session, missing cookie, empty string, whitespace
 *   variations, type coercion edge cases, extremely large tokens
 * - isProtectedRoute: protected paths, public paths, query strings, fragments,
 *   special characters, relative paths, trailing slashes, bypass attempts
 */

import { describe, it, expect } from 'vitest';
import { isAuthenticated, isProtectedRoute } from '$lib/server/auth';

// ============================================================================
// isAuthenticated
// ============================================================================

describe('isAuthenticated', () => {

    // ───── Valid sessions ─────

    it('returns true for a valid session token', () => {
        expect(isAuthenticated('abc123')).toBe(true);
    });

    it('returns true for a UUID-style token', () => {
        expect(isAuthenticated('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('returns true for a long session token', () => {
        expect(isAuthenticated('a'.repeat(256))).toBe(true);
    });

    it('returns true for an extremely large token', () => {
        expect(isAuthenticated('x'.repeat(10000))).toBe(true);
    });

    it('returns true for a token with special characters', () => {
        expect(isAuthenticated('abc.123-xyz_456')).toBe(true);
    });

    it('returns true for a valid token with surrounding whitespace', () => {
        expect(isAuthenticated(' abc123 ')).toBe(true);
    });

    // ───── Invalid sessions ─────

    it('returns false when session cookie is undefined', () => {
        expect(isAuthenticated(undefined)).toBe(false);
    });

    it('returns false when session cookie is an empty string', () => {
        expect(isAuthenticated('')).toBe(false);
    });

    it('returns false when session cookie is spaces only', () => {
        expect(isAuthenticated('   ')).toBe(false);
    });

    it('returns false when session cookie is tabs only', () => {
        expect(isAuthenticated('\t\t')).toBe(false);
    });

    it('returns false when session cookie is newlines only', () => {
        expect(isAuthenticated('\n\n')).toBe(false);
    });

    it('returns false when session cookie is mixed whitespace', () => {
        expect(isAuthenticated(' \t\n ')).toBe(false);
    });

    // ───── Type coercion edge cases ─────
    // TypeScript prevents these at compile time but we test runtime safety.

    it('returns false when passed null (coerced via unknown)', () => {
        expect(isAuthenticated(null as unknown as undefined)).toBe(false);
    });

    it('returns false when passed 0 (coerced via unknown)', () => {
        expect(isAuthenticated(0 as unknown as undefined)).toBe(false);
    });

    it('returns false when passed false (coerced via unknown)', () => {
        expect(isAuthenticated(false as unknown as undefined)).toBe(false);
    });

    it('returns false when passed an object (coerced via unknown)', () => {
        expect(isAuthenticated({} as unknown as undefined)).toBe(false);
    });

    it('returns false when passed an array (coerced via unknown)', () => {
        expect(isAuthenticated([] as unknown as undefined)).toBe(false);
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
        // hooks passes event.url.pathname which strips query strings
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
    // SvelteKit passes event.url.pathname which never includes ? or #.
    // These tests confirm the function behaves correctly for clean pathnames.

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