<script lang="ts">
    type Modal = 'tos' | 'privacy' | null;

    let agreed = $state(false);
    let showModal = $state<Modal>(null);
    let viewedTos = $state(false);
    let viewedPrivacy = $state(false);

    const bothViewed = $derived(viewedTos && viewedPrivacy);

    function openModal(modal: Modal): void {
        showModal = modal;
        if (modal === 'tos') viewedTos = true;
        if (modal === 'privacy') viewedPrivacy = true;
    }

    function closeModal(): void {
        showModal = null;
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
</script>

<svelte:head>
    <title>Sign in — Firesong Herald</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Sign in</h1>
            <p class="text-surface-500 text-sm mt-2">Use your Discord account to continue</p>
        </div>

        <div class="rounded-xl border border-surface-200 dark:border-surface-800 p-6 bg-surface-100 dark:bg-surface-900">

            <label class="flex items-start gap-3 mb-2 {bothViewed ? 'cursor-pointer' : 'cursor-default'}">
                <input
                        type="checkbox"
                        bind:checked={agreed}
                        disabled={!bothViewed}
                        class="mt-0.5 accent-primary-500 disabled:opacity-40"
                />
                <span class="text-sm text-surface-600 dark:text-surface-400">
                    I agree to the
                    <button
                            type="button"
                            onclick={() => openModal('tos')}
                            class="underline hover:text-surface-900 dark:hover:text-surface-50 cursor-pointer {viewedTos ? 'opacity-60' : ''}"
                    >
                        Terms of Service
                    </button>
                    and
                    <button
                            type="button"
                            onclick={() => openModal('privacy')}
                            class="underline hover:text-surface-900 dark:hover:text-surface-50 cursor-pointer {viewedPrivacy ? 'opacity-60' : ''}"
                    >
                        Privacy Policy
                    </button>,
                    including receiving event reminders via Discord DM.
                </span>
            </label>

            {#if !bothViewed}
                <p class="text-xs text-surface-400 mb-6">Please read both documents before agreeing.</p>
            {:else}
                <div class="mb-6"></div>
            {/if}

            <a
                    href={agreed ? '/auth/discord' : undefined}
                    aria-disabled={!agreed}
                    class="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-md font-medium text-sm transition-opacity
                {agreed
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    : 'bg-surface-300 dark:bg-surface-700 text-surface-400 cursor-not-allowed pointer-events-none opacity-50'}"
            >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Continue with Discord
            </a>

        </div>

        <p class="text-center mt-6">
            <a href="/" class="text-sm text-surface-500 hover:underline">← Back to home</a>
        </p>

    </div>
</div>

<!-- ToS Modal -->
{#if showModal === 'tos'}
    <div
            class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Terms of Service"
    >
        <div class="w-full max-w-2xl bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div class="flex items-center justify-between px-8 py-5 border-b border-surface-200 dark:border-surface-800 shrink-0">
                <h2 class="font-semibold text-surface-900 dark:text-surface-50">Terms of Service</h2>
                <button type="button" onclick={closeModal} class="text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 transition-colors" aria-label="Close">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="overflow-y-auto px-8 py-6 space-y-6 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                <p class="text-xs text-surface-500">Last updated: April 2025</p>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">1. About Firesong Herald</h3><p>Firesong Herald is a free, open-source Discord event management bot with a web dashboard, operated non-commercially by Ben Firesong. By using the service, you agree to these terms.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">2. Eligibility</h3><p>You must have a valid Discord account to use Firesong Herald. You must comply with <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" class="underline hover:text-surface-900 dark:hover:text-surface-50">Discord's Terms of Service</a>.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">3. Acceptable Use</h3><p>You agree not to use Firesong Herald to:</p><ul class="list-disc list-inside space-y-1 ml-2"><li>Harass, abuse, or harm others</li><li>Violate any applicable laws or regulations</li><li>Attempt to circumvent or exploit the service</li><li>Interfere with other users' access to the service</li></ul></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">4. Service Availability</h3><p>Firesong Herald is provided as-is, without any guarantee of uptime, continuity, or fitness for a particular purpose. The service may be interrupted, modified, or discontinued at any time without notice.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">5. Your Data</h3><p>We collect and process limited personal data as described in our Privacy Policy. You may request deletion of your data at any time by contacting us.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">6. Direct Messages</h3><p>By signing in and accepting these terms, you consent to receiving event reminders and relevant notifications via Discord direct messages from the bot. You may opt out at any time in your dashboard settings or by contacting us.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">7. Open Source</h3><p>Firesong Herald is open source and licensed under the <a href="https://github.com/ayoubbenrezig/Firesong-Herald/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" class="underline hover:text-surface-900 dark:hover:text-surface-50">AGPL-3.0 licence</a>.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">8. Limitation of Liability</h3><p>Firesong Herald is provided free of charge and without warranty. To the fullest extent permitted by law, the operator accepts no liability for any damages arising from use of the service.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">9. Changes</h3><p>These terms may be updated from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">10. Contact</h3><p>For questions, contact us at <a href="mailto:contact@firesongherald.com" class="underline hover:text-surface-900 dark:hover:text-surface-50">contact@firesongherald.com</a>.</p></section>
            </div>
            <div class="px-8 py-4 border-t border-surface-200 dark:border-surface-800 shrink-0 flex justify-end">
                <button type="button" onclick={closeModal} class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Close</button>
            </div>
        </div>
    </div>
{/if}

<!-- Privacy Modal -->
{#if showModal === 'privacy'}
    <div
            class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Privacy Policy"
    >
        <div class="w-full max-w-2xl bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div class="flex items-center justify-between px-8 py-5 border-b border-surface-200 dark:border-surface-800 shrink-0">
                <h2 class="font-semibold text-surface-900 dark:text-surface-50">Privacy Policy</h2>
                <button type="button" onclick={closeModal} class="text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 transition-colors" aria-label="Close">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="overflow-y-auto px-8 py-6 space-y-6 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                <p class="text-xs text-surface-500">Last updated: April 2025</p>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">1. Who We Are</h3><p>Firesong Herald is a free, non-commercial, open-source Discord event management service operated by Ben Firesong. Contact: <a href="mailto:contact@firesongherald.com" class="underline hover:text-surface-900 dark:hover:text-surface-50">contact@firesongherald.com</a></p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">2. Legal Basis</h3><p>We process your personal data on the basis of your consent (Article 6(1)(a) GDPR) and where necessary for the performance of the service you requested (Article 6(1)(b) GDPR).</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">3. Data We Collect</h3><p class="font-medium text-surface-800 dark:text-surface-200">Via Discord OAuth2 sign-in:</p><ul class="list-disc list-inside space-y-1 ml-2"><li>Discord user ID, username, avatar, and display name</li></ul><p class="font-medium text-surface-800 dark:text-surface-200 mt-3">Via bot interactions:</p><ul class="list-disc list-inside space-y-1 ml-2"><li>Discord user ID — to associate RSVPs and preferences</li><li>Username at time of action — stored in audit logs</li></ul><p class="font-medium text-surface-800 dark:text-surface-200 mt-3">Via dashboard use:</p><ul class="list-disc list-inside space-y-1 ml-2"><li>Theme and colour scheme preference</li><li>DM notification consent and timestamp</li><li>Reminder timing presets</li><li>Last active timestamp</li></ul></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">4. Session Cookie</h3><p>We use a single strictly necessary session cookie containing a signed JWT. It expires after 7 days. We do not use analytics, advertising, or tracking cookies.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">5. Direct Messages</h3><p>With your consent, the bot may send event reminders via Discord DM. This is on by default. You may withdraw consent at any time in dashboard settings.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">6. Data Retention</h3><ul class="list-disc list-inside space-y-2 ml-2"><li><span class="font-medium text-surface-800 dark:text-surface-200">User records</span> — deleted after 12 months of inactivity</li><li><span class="font-medium text-surface-800 dark:text-surface-200">Event signups</span> — deleted 30 days after event ends</li><li><span class="font-medium text-surface-800 dark:text-surface-200">Audit logs</span> — retained for 12 months</li><li><span class="font-medium text-surface-800 dark:text-surface-200">Soft-deleted events</span> — permanently deleted after 30 days</li></ul></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">7. Data Sharing</h3><p>We do not sell or share your personal data with third parties. We use Discord's API for authentication — Discord's own privacy policy applies to data held by Discord.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">8. Your Rights (GDPR)</h3><ul class="list-disc list-inside space-y-1 ml-2"><li>Access, correct, or delete your data</li><li>Withdraw consent at any time</li><li>Data portability</li><li>Lodge a complaint with your national data protection authority</li></ul><p class="mt-2">Contact: <a href="mailto:contact@firesongherald.com" class="underline hover:text-surface-900 dark:hover:text-surface-50">contact@firesongherald.com</a>. We respond within 30 days.</p></section>
                <section class="space-y-2"><h3 class="font-semibold text-surface-900 dark:text-surface-100">9. Security</h3><p>All data is transmitted over HTTPS. Session cookies are signed, httpOnly, and scoped to this domain.</p></section>
            </div>
            <div class="px-8 py-4 border-t border-surface-200 dark:border-surface-800 shrink-0 flex justify-end">
                <button type="button" onclick={closeModal} class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Close</button>
            </div>
        </div>
    </div>
{/if}