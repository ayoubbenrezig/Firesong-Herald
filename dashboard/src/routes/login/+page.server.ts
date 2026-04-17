import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// ============================================================================
// LOGIN PAGE SERVER LOAD
// ============================================================================
// If the user is already authenticated and is a tester, redirect to /app.
// If authenticated but not a tester, redirect to / so they see the access denied state.
// If unauthenticated, render the login page normally.

export const load: PageServerLoad = async ({ parent }) => {
    const { user, isTester } = await parent();

    if (user && isTester) {
        redirect(303, '/app');
    }

    if (user && !isTester) {
        redirect(303, '/');
    }
};