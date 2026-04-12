<script lang="ts">
    import { browser } from '$app/environment';
    import { SunIcon, MoonIcon } from 'phosphor-svelte';
    import { toggleMode } from '$lib/mode';

    const features = [
        {
            title: 'Event Management',
            description: 'Create, edit, and manage community events directly from Discord or the web dashboard.',
        },
        {
            title: 'RSVP System',
            description: 'Flexible sign-up slots for any event format — from simple one-click RSVPs to custom role-based options.',
        },
        {
            title: 'Live Dashboard',
            description: 'Manage everything from a clean web interface that syncs with Discord in real time.',
        },
        {
            title: 'Reminders',
            description: 'Automatic event reminders keep your community informed and ready to show up.',
        },
    ];

    function isDark(): boolean {
        if (!browser) return false;
        return document.documentElement.getAttribute('data-mode') === 'dark';
    }

    let dark = $state(isDark());

    function handleToggle(): void {
        toggleMode();
        dark = !dark;
    }
</script>

<svelte:head>
    <title>Firesong Herald</title>
    <meta name="description" content="A Discord bot for community event management — signups, RSVPs, reminders, and a live web dashboard." />
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50">

    <!-- Nav -->
    <nav class="border-b border-surface-200 dark:border-surface-800 px-6 py-4">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
            <span class="text-lg font-semibold">Firesong Herald</span>
            <div class="flex items-center gap-4 text-sm">
                <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="hover:underline">GitHub</a>
                <a href="/privacy" class="hover:underline">Privacy</a>
                <a href="/tos" class="hover:underline">Terms</a>
                <button onclick={handleToggle} class="cursor-pointer p-1.5 rounded-md opacity-70 hover:opacity-100 hover:bg-surface-200 dark:hover:bg-surface-800 transition-all" aria-label="Toggle dark mode">
                    {#if dark}
                        <SunIcon class="size-4" />
                    {:else}
                        <MoonIcon class="size-4" />
                    {/if}
                </button>
                <a href="/login" class="btn preset-filled-primary-500 px-4 py-1.5 rounded-md text-sm">Sign in</a>
            </div>
        </div>
    </nav>

    <!-- Hero -->
    <section class="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 class="text-4xl font-bold mb-4">Event management for Discord communities</h1>
        <p class="text-surface-600 dark:text-surface-400 text-lg mb-10 max-w-2xl mx-auto">
            Firesong Herald makes it easy to create events, manage sign-ups, and keep your community in sync — directly from Discord or the web.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
                    href="https://discord.com/oauth2/authorize"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn preset-filled-primary-500 px-6 py-3 rounded-md font-medium"
            >
                Add to Discord
            </a>
            <a
                    href="/login"
                    class="btn preset-outlined-surface-500 px-6 py-3 rounded-md font-medium"
            >
                Open Dashboard
            </a>
        </div>
    </section>

    <!-- Features -->
    <section class="max-w-5xl mx-auto px-6 pb-24">
        <div class="grid sm:grid-cols-2 gap-6">
            {#each features as feature}
                <div class="rounded-xl border border-surface-200 dark:border-surface-800 p-6">
                    <h2 class="font-semibold text-lg mb-2">{feature.title}</h2>
                    <p class="text-surface-600 dark:text-surface-400 text-sm">{feature.description}</p>
                </div>
            {/each}
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-surface-200 dark:border-surface-800 px-6 py-6 text-center text-sm text-surface-500">
        <div class="flex flex-wrap justify-center gap-4">
            <a href="/privacy" class="hover:underline">Privacy Policy</a>
            <a href="/tos" class="hover:underline">Terms of Service</a>
            <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="hover:underline">GitHub</a>
        </div>
        <p class="mt-3">© {new Date().getFullYear()} Firesong Herald. Open source under AGPL-3.0.</p>
    </footer>

</div>