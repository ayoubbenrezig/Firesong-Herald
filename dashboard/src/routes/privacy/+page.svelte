<script lang="ts">
    import { browser } from '$app/environment';

    function goBack(): void {
        if (browser) history.back();
    }
</script>

<svelte:head>
    <title>Privacy Policy — Firesong Herald</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-surface-950 px-4 py-12">
    <div class="max-w-2xl mx-auto">

        <div class="mb-8">
            <button type="button" onclick={goBack} class="text-sm text-surface-500 hover:underline cursor-pointer">← Back</button>
        </div>

        <div class="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 overflow-hidden">

            <div class="px-8 py-6 border-b border-surface-200 dark:border-surface-800">
                <h1 class="text-xl font-bold text-surface-900 dark:text-surface-50">Privacy Policy</h1>
                <p class="text-sm text-surface-500 mt-1">Last updated: April 2025</p>
            </div>

            <div class="px-8 py-6 space-y-6 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">1. Who We Are</h2>
                    <p>
                        Firesong Herald is a free, non-commercial, open-source Discord event management service operated by
                        Ben Firesong. This policy explains what data we collect, why, and how long we keep it.
                        Contact: <a href="mailto:contact@firesongherald.com" class="underline hover:text-surface-900 dark:hover:text-surface-50">contact@firesongherald.com</a>
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">2. Legal Basis</h2>
                    <p>
                        We process your personal data on the basis of your consent (Article 6(1)(a) GDPR), given when you
                        sign in and accept these terms, and where necessary for the performance of the service you requested
                        (Article 6(1)(b) GDPR).
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">3. Data We Collect</h2>

                    <p class="font-medium text-surface-800 dark:text-surface-200">Via Discord OAuth2 sign-in:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Discord user ID (snowflake)</li>
                        <li>Discord username</li>
                        <li>Discord avatar hash</li>
                        <li>Discord display name</li>
                    </ul>
                    <p class="text-surface-500 text-xs mt-1">
                        This data is stored in a signed, encrypted session cookie on your device and in our database as a user record.
                        We do not store your email address or password.
                    </p>

                    <p class="font-medium text-surface-800 dark:text-surface-200 mt-3">Via bot interactions (Discord-only users):</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Discord user ID — to associate RSVPs and preferences</li>
                        <li>Username at time of action — stored in audit logs for server moderation purposes</li>
                    </ul>

                    <p class="font-medium text-surface-800 dark:text-surface-200 mt-3">Via dashboard use:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Theme and colour scheme preference</li>
                        <li>DM notification consent and timestamp</li>
                        <li>Reminder timing presets</li>
                        <li>Last active timestamp — used for data retention</li>
                    </ul>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">4. Session Cookie</h2>
                    <p>
                        We use a single strictly necessary session cookie named <code class="bg-surface-200 dark:bg-surface-800 px-1 rounded text-xs">session</code>.
                        It contains a signed JWT with your Discord ID, username, avatar, and display name. It expires after 7 days.
                        No consent is required for this cookie as it is essential for the service to function.
                        We do not use any analytics, advertising, or tracking cookies.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">5. Direct Messages</h2>
                    <p>
                        With your consent, the bot may send you event reminders and relevant notifications via Discord direct message.
                        This consent is on by default when you sign in and accept these terms. You may withdraw consent at any time
                        in your dashboard settings or by contacting us.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">6. Data Retention</h2>
                    <ul class="list-disc list-inside space-y-2 ml-2">
                        <li>
                            <span class="font-medium text-surface-800 dark:text-surface-200">User records</span> —
                            deleted automatically after 12 months of inactivity.
                        </li>
                        <li>
                            <span class="font-medium text-surface-800 dark:text-surface-200">Event signups</span> —
                            deleted 30 days after the event ends, or earlier if a server admin clears them manually.
                        </li>
                        <li>
                            <span class="font-medium text-surface-800 dark:text-surface-200">Audit logs</span> —
                            retained for 12 months, then permanently deleted.
                        </li>
                        <li>
                            <span class="font-medium text-surface-800 dark:text-surface-200">Soft-deleted events</span> —
                            permanently deleted 30 days after soft deletion.
                        </li>
                    </ul>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">7. Data Sharing</h2>
                    <p>
                        We do not sell, share, or transfer your personal data to third parties. Your data is not used for
                        advertising or profiling. We use Discord's API to authenticate you — Discord's own privacy policy
                        applies to data held by Discord.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">8. Your Rights (GDPR)</h2>
                    <p>As a data subject under GDPR, you have the right to:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Access the personal data we hold about you</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data (right to erasure)</li>
                        <li>Withdraw consent at any time, without affecting prior processing</li>
                        <li>Data portability — receive your data in a structured format</li>
                        <li>Object to processing based on legitimate interests</li>
                        <li>Lodge a complaint with your national data protection authority</li>
                    </ul>
                    <p class="mt-2">
                        To exercise any of these rights, contact us at
                        <a href="mailto:contact@firesongherald.com" class="underline hover:text-surface-900 dark:hover:text-surface-50">contact@firesongherald.com</a>.
                        We will respond within 30 days.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">9. Data Security</h2>
                    <p>
                        All data is transmitted over HTTPS. Session cookies are signed, httpOnly, and scoped to this domain.
                        Access to the database is restricted to the application only.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">10. Changes</h2>
                    <p>
                        This policy may be updated from time to time. Significant changes will be communicated via the
                        dashboard. The date at the top reflects the most recent revision.
                    </p>
                </section>

            </div>
        </div>

        <p class="text-center mt-6">
            <button type="button" onclick={goBack} class="text-sm text-surface-500 hover:underline cursor-pointer">← Back</button>
        </p>

    </div>
</div>