import type { FastifyInstance } from 'fastify';
import oauth2, { type OAuth2Namespace } from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

// ============================================================================
// TYPE AUGMENTATION
// ============================================================================

declare module 'fastify' {
    interface FastifyInstance {
        discordOAuth2: OAuth2Namespace;
    }
}

// ============================================================================
// DISCORD USER TYPE
// ============================================================================

interface DiscordUser {
    id: string;
    username: string;
    avatar: string | null;
    global_name: string | null;
}

// ============================================================================
// AUTH ROUTES
// ============================================================================

/**
 * Registers Discord OAuth2 authentication routes.
 *
 * Routes:
 *   GET /auth/discord          — Redirects to Discord OAuth2 authorisation page
 *   GET /auth/discord/callback — Handles Discord callback, signs JWT, sets cookie
 *   GET /auth/logout           — Clears session cookie
 */
export async function authRoutes(app: FastifyInstance): Promise<void> {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
    const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;
    const JWT_SECRET = process.env.JWT_SECRET!;
    const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5173';
    const NODE_ENV = process.env.NODE_ENV || 'development';

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI || !JWT_SECRET) {
        throw new Error(
            '❌ Missing required environment variables for OAuth2:\n' +
            '   - DISCORD_CLIENT_ID\n' +
            '   - DISCORD_CLIENT_SECRET\n' +
            '   - DISCORD_REDIRECT_URI\n' +
            '   - JWT_SECRET'
        );
    }

    // ── Plugins ───────────────────────────────────────────────────────────────
    // @fastify/cookie must be registered before @fastify/oauth2
    await app.register(cookie);

    await app.register(jwt, {
        secret: JWT_SECRET,
        sign: { expiresIn: '7d' },
    });

    await app.register(oauth2, {
        name: 'discordOAuth2',
        credentials: {
            client: {
                id: DISCORD_CLIENT_ID,
                secret: DISCORD_CLIENT_SECRET,
            },
            auth: {
                tokenHost: 'https://discord.com',
                tokenPath: '/api/oauth2/token',
                authorizePath: '/oauth2/authorize',
            },
        },
        scope: ['identify'],
        startRedirectPath: '/auth/discord',
        callbackUri: DISCORD_REDIRECT_URI,
    });

    await app.register(rateLimit, {
        max: 10,
        timeWindow: '1 minute',
    });

    // ── Callback ──────────────────────────────────────────────────────────────

    /**
     * Handles the Discord OAuth2 callback.
     * Exchanges the authorisation code for an access token, fetches the Discord
     * user, signs a JWT, sets it as an httpOnly session cookie, and redirects
     * to the dashboard.
     */
    app.get('/auth/discord/callback', async function (request, reply) {
        try {
            const { token } = await app.discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                },
            });

            if (!userResponse.ok) {
                app.log.error({ status: userResponse.status }, 'Failed to fetch Discord user');
                return reply.redirect(`${DASHBOARD_URL}/login?error=discord_user_fetch_failed`);
            }

            const user = await userResponse.json() as DiscordUser;

            const sessionToken = await reply.jwtSign({
                discordId: user.id,
                username: user.username,
                avatar: user.avatar,
                globalName: user.global_name,
            });

            reply.setCookie('session', sessionToken, {
                httpOnly: true,
                secure: NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return reply.redirect(`${DASHBOARD_URL}/app`);
        } catch (error) {
            app.log.error({ err: error }, 'OAuth2 callback failed');
            return reply.redirect(`${DASHBOARD_URL}/login?error=oauth_failed`);
        }
    });

    // ── Logout ────────────────────────────────────────────────────────────────

    /**
     * Clears the session cookie and redirects to the login page.
     */
    app.get('/auth/logout', async function (_request, reply) {
        reply.clearCookie('session', { path: '/' });
        return reply.redirect(`${DASHBOARD_URL}/`);
    });
}