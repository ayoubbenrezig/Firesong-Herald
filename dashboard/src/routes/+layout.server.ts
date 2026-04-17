import type { LayoutServerLoad } from './$types';
import { checkIsTester, getBotInviteUrl } from '$lib/server/api';

// ============================================================================
// ROOT LAYOUT SERVER LOAD
// ============================================================================
// Runs on every server-side request.
// Passes the authenticated user, tester status, and bot invite URL to all pages.

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user;
    const botInviteUrl = await getBotInviteUrl();

    if (!user) {
        return {
            user: null,
            isTester: false,
            botInviteUrl,
        };
    }

    const isTester = await checkIsTester(user.discordId);

    return {
        user,
        isTester,
        botInviteUrl,
    };
};