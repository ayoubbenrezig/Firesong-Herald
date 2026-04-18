import type { FastifyInstance } from 'fastify';
import oauth2, { type OAuth2Namespace } from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

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
 *   GET /auth/discord/callback — Handles Discord callback, upserts user record,
 *                                signs JWT, sets cookie, and redirects to dashboard
 *   GET /auth/logout           — Clears session cookie
 */
export async function authRoutes(app: FastifyInstance): Promise<void> {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
    const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;
    const JWT_SECRET = process.env.JWT_SECRET!;
    const BOT_TOKEN = process.env.DISCORD_TOKEN;
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

    if (!BOT_TOKEN) {
        logger.warn('⚠️  DISCORD_TOKEN is not set — welcome DMs on first sign-in will be skipped');
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
     *
     * Flow:
     *   1. Exchanges the authorisation code for a Discord access token.
     *   2. Fetches the authenticated Discord user's profile.
     *   3. Checks if this is the user's first sign-in.
     *   4. Upserts a User record in the database, updating lastActiveAt on each sign-in.
     *   5. On first sign-in, sends a welcome DM via the bot with consent details
     *      and relevant next steps based on tester status.
     *   6. Signs a JWT containing the user's Discord identity.
     *   7. Sets the JWT as an httpOnly session cookie and redirects to the dashboard.
     *
     * On any failure, redirects to the login page with an appropriate error code.
     */
    app.get('/auth/discord/callback', async function (request, reply) {
        try {
            const { token } = await app.discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

            // ── Fetch Discord user profile ────────────────────────────────────
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                },
            });

            if (!userResponse.ok) {
                logger.error(
                    { status: userResponse.status },
                    'Failed to fetch Discord user profile during OAuth callback',
                );
                return reply.redirect(`${DASHBOARD_URL}/login?error=discord_user_fetch_failed`);
            }

            const user = await userResponse.json() as DiscordUser;

            // ── Detect first sign-in ──────────────────────────────────────────
            // Check before upsert so we can send a welcome DM only on account creation.
            let isFirstSignIn = false;

            try {
                const existing = await prisma.user.findUnique({
                    where: { discordUserId: user.id },
                    select: { discordUserId: true },
                });
                isFirstSignIn = existing === null;
            } catch (lookupError) {
                // Non-blocking — if lookup fails, skip the welcome DM rather than block sign-in.
                logger.warn({ err: lookupError, discordUserId: user.id }, 'Failed to check for existing user record');
            }

            // ── Upsert user record ────────────────────────────────────────────
            // Creates the record on first sign-in; updates lastActiveAt on subsequent ones.
            // dmConsent and other preferences are left unchanged on update.
            const consentDate = new Date();

            try {
                await prisma.user.upsert({
                    where: { discordUserId: user.id },
                    create: {
                        discordUserId: user.id,
                        dmConsent: true,
                        dmConsentGivenAt: consentDate,
                        lastActiveAt: consentDate,
                    },
                    update: {
                        lastActiveAt: new Date(),
                    },
                });

                logger.info({ discordUserId: user.id }, 'User record upserted on sign-in');
            } catch (dbError) {
                // Log but do not block sign-in — a failed upsert should not deny access.
                logger.error({ err: dbError, discordUserId: user.id }, 'Failed to upsert user record on sign-in');
            }

            // ── Send welcome DM on first sign-in ──────────────────────────────
            if (isFirstSignIn) {
                if (!BOT_TOKEN) {
                    logger.warn({ discordUserId: user.id }, 'Skipping welcome DM — DISCORD_TOKEN is not set');
                } else {
                    try {
                        const tester = await prisma.tester.findUnique({
                            where: { discordUserId: user.id },
                            select: { discordUserId: true },
                        });

                        await sendWelcomeDm(user.id, tester !== null, consentDate, BOT_TOKEN);
                    } catch (dmError) {
                        // Non-blocking — DM failure must never block sign-in.
                        logger.warn({ err: dmError, discordUserId: user.id }, 'Failed to send welcome DM on first sign-in');
                    }
                }
            }

            // ── Sign session JWT ──────────────────────────────────────────────
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
            logger.error({ err: error }, 'OAuth2 callback failed');
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

// ============================================================================
// WELCOME DM
// ============================================================================

/**
 * Sends a welcome DM to a user on their first sign-in via the Discord REST API.
 *
 * Opens a DM channel with the user, then sends an embed containing:
 * - Their consent date and time rendered as a Discord timestamp
 * - Their current tester status and relevant next steps
 * - A reminder that they can delete their account and all data at any time
 *
 * All failures are logged and non-blocking — this must never interrupt sign-in.
 *
 * @param discordUserId - The Discord user snowflake ID.
 * @param isTester      - Whether the user is a registered tester.
 * @param consentDate   - The timestamp at which consent was recorded.
 * @param botToken      - The Discord bot token for REST calls.
 */
async function sendWelcomeDm(
    discordUserId: string,
    isTester: boolean,
    consentDate: Date,
    botToken: string,
): Promise<void> {
    const consentTimestamp = `<t:${Math.floor(consentDate.getTime() / 1000)}:F>`;

    // ── Open DM channel ───────────────────────────────────────────────────────
    let channelId: string;

    try {
        const channelResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {
            method: 'POST',
            headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipient_id: discordUserId }),
        });

        if (!channelResponse.ok) {
            logger.warn(
                { discordUserId, status: channelResponse.status },
                'Failed to open DM channel for welcome message',
            );
            return;
        }

        const channel = await channelResponse.json() as { id: string };
        channelId = channel.id;
    } catch (channelError) {
        logger.warn({ err: channelError, discordUserId }, 'Error opening DM channel for welcome message');
        return;
    }

    // ── Build embed ───────────────────────────────────────────────────────────
    const embed = isTester
        ? buildTesterWelcomeEmbed(consentTimestamp)
        : buildNonTesterWelcomeEmbed(consentTimestamp);

    // ── Send message ──────────────────────────────────────────────────────────
    try {
        const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] }),
        });

        if (!messageResponse.ok) {
            logger.warn(
                { discordUserId, status: messageResponse.status },
                'Failed to send welcome DM',
            );
            return;
        }
    } catch (messageError) {
        logger.warn({ err: messageError, discordUserId }, 'Error sending welcome DM message');
        return;
    }

    logger.info({ discordUserId, isTester }, 'Welcome DM sent on first sign-in');
}

/**
 * Builds the welcome embed for a registered tester.
 */
function buildTesterWelcomeEmbed(consentTimestamp: string): object {
    return {
        color: 0x57F287,
        description:
            `<:LurkingOwl:1494826568881799349> Hey there!\n` +
            `\n` +
            `<:HappyOwl:1494826567271055451> Welcome to Firesong Herald — you're signed up as a tester. Thanks for being part of this.\n` +
            `\n` +
            `**Your dashboard access is active.** Head to https://firesongherald.com to get started.\n` +
            `\n` +
            `**A note on your data**\n` +
            `On ${consentTimestamp}, you agreed to our Privacy Policy and Terms of Service by signing in. ` +
            `You can delete your account and all associated data at any time from the dashboard footer or account menu.\n` +
            `\n` +
            `Join the support server if you have questions or feedback:\n` +
            `https://discord.gg/e8eVQTB24z\n` +
            `\n` +
            `— Your faithful Owl <:FeatherSparkle:1494840173849088061>`,
    };
}

/**
 * Builds the welcome embed for a non-tester user.
 */
function buildNonTesterWelcomeEmbed(consentTimestamp: string): object {
    return {
        color: 0x4A90D9,
        description:
            `<:LurkingOwl:1494826568881799349> Hey there!\n` +
            `\n` +
            `Thanks for signing in to Firesong Herald. We're currently in closed testing, ` +
            `so dashboard access is limited to approved testers for now.\n` +
            `\n` +
            `**Want to get involved?** Open a thread in our support server and we'll take it from there:\n` +
            `https://discord.gg/e8eVQTB24z\n` +
            `\n` +
            `**A note on your data**\n` +
            `On ${consentTimestamp}, you agreed to our Privacy Policy and Terms of Service by signing in. ` +
            `You can delete your account and all associated data at any time from the dashboard footer or account menu.\n` +
            `\n` +
            `— Your faithful Owl <:FeatherHeart:1494840167880724590>`,
    };
}