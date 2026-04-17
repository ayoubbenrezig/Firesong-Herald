import type { LayoutServerLoad } from './$types';
import { checkIsTester } from '$lib/server/api';

// ============================================================================
// ROOT LAYOUT SERVER LOAD
// ============================================================================
// Runs on every server-side request.
// Passes the authenticated user and tester status to all pages.

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user;

    // If there is no authenticated user, skip the tester check.
    if (!user) {
        return {
            user: null,
            isTester: false,
        };
    }

    const isTester = await checkIsTester(user.discordId);

    return {
        user,
        isTester,
    };
};