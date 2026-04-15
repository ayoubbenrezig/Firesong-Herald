<script lang="ts">
    import { browser } from '$app/environment';

    function goBack(): void {
        if (browser) history.back();
    }
</script>

<svelte:head>
    <title>Terms of Service — Firesong Herald</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-surface-950 px-4 py-12">
    <div class="max-w-2xl mx-auto">

        <div class="mb-8">
            <button type="button" onclick={goBack} class="text-sm text-surface-500 hover:underline cursor-pointer">← Back</button>
        </div>

        <div class="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 overflow-hidden">

            <div class="px-8 py-6 border-b border-surface-200 dark:border-surface-800">
                <h1 class="text-xl font-bold text-surface-900 dark:text-surface-50">Terms of Service</h1>
                <p class="text-sm text-surface-500 mt-1">Last updated: April 2025</p>
            </div>

            <div class="px-8 py-6 space-y-6 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">1. About Firesong Herald</h2>
                    <p>
                        Firesong Herald is a free, open-source Discord event management bot with a web dashboard, operated
                        non-commercially by Ben Firesong. By using the service, you agree to these terms.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">2. Eligibility</h2>
                    <p>
                        You must have a valid Discord account to use Firesong Herald. You must comply with
                        <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" class="underline hover:text-surface-900 dark:hover:text-surface-50">Discord's Terms of Service</a>.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">3. Acceptable Use</h2>
                    <p>You agree not to use Firesong Herald to:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                        <li>Harass, abuse, or harm others</li>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Attempt to circumvent or exploit the service</li>
                        <li>Interfere with other users' access to the service</li>
                    </ul>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">4. Service Availability</h2>
                    <p>
                        Firesong Herald is provided as-is, without any guarantee of uptime, continuity, or fitness for a
                        particular purpose. The service may be interrupted, modified, or discontinued at any time without notice.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">5. Your Data</h2>
                    <p>
                        We collect and process limited personal data as described in our
                        <a href="/privacy" class="underline hover:text-surface-900 dark:hover:text-surface-50">Privacy Policy</a>.
                        You may request deletion of your data at any time by contacting us.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">6. Direct Messages</h2>
                    <p>
                        By signing in and accepting these terms, you consent to receiving event reminders and relevant
                        notifications via Discord direct messages from the bot. You may opt out at any time in your
                        dashboard settings or by contacting us.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">7. Open Source</h2>
                    <p>
                        Firesong Herald is open source and licensed under the
                        <a href="https://github.com/ayoubbenrezig/Firesong-Herald/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="underline hover:text-surface-900 dark:hover:text-surface-50">AGPL-3.0 licence</a>.
                        The source code is available on GitHub.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">8. Limitation of Liability</h2>
                    <p>
                        Firesong Herald is provided free of charge and without warranty. To the fullest extent permitted by law,
                        the operator accepts no liability for any damages arising from use of the service.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">9. Changes</h2>
                    <p>
                        These terms may be updated from time to time. Continued use of the service after changes constitutes
                        acceptance of the updated terms. The date at the top of this page reflects the most recent revision.
                    </p>
                </section>

                <section class="space-y-2">
                    <h2 class="font-semibold text-surface-900 dark:text-surface-100">10. Contact</h2>
                    <p>
                        For questions about these terms, contact us at
                        <a href="mailto:contact@firesongherald.com" class="underline hover:text-surface-900 dark:hover:text-surface-50">contact@firesongherald.com</a>.
                    </p>
                </section>

            </div>
        </div>

        <p class="text-center mt-6">
            <button type="button" onclick={goBack} class="text-sm text-surface-500 hover:underline cursor-pointer">← Back</button>
        </p>

    </div>
</div>