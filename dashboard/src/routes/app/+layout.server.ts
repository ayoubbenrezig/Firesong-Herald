import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// ============================================================================
// APP LAYOUT SERVER LOAD
// ============================================================================
// Protects all routes under /app.
// Requires the user to be authenticated AND a registered tester.
// Unauthenticated users are sent to /login.
// Authenticated non-testers are sent back to / where the access denied state is shown.

export const load: LayoutServerLoad = async ({ parent }) => {
    const { user, isTester } = await parent();

    if (!user) {
        redirect(303, '/login');
    }

    if (!isTester) {
        redirect(303, '/');
    }

    return { user };
};