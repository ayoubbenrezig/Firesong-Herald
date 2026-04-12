<script lang="ts">
    let agreed = $state(false);
</script>

<svelte:head>
    <title>Sign in — Firesong Herald</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Sign in</h1>
            <p class="text-surface-500 text-sm mt-2">Use your Discord account to continue</p>
        </div>

        <div class="rounded-xl border border-surface-200 dark:border-surface-800 p-6 bg-surface-100 dark:bg-surface-900">

            <label class="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                        type="checkbox"
                        bind:checked={agreed}
                        class="mt-0.5 accent-primary-500"
                />
                <span class="text-sm text-surface-600 dark:text-surface-400">
                    I agree to the
                    <a href="/tos" class="underline hover:text-surface-900 dark:hover:text-surface-50">Terms of Service</a>
                    and
                    <a href="/privacy" class="underline hover:text-surface-900 dark:hover:text-surface-50">Privacy Policy</a>
                </span>
            </label>

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