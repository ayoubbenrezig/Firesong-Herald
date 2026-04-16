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

<div class="min-h-screen flex flex-col">

    <!-- Nav -->
    <nav class="nav-polished px-8 py-5 sticky top-0 z-50 mx-auto">
        <div class="mx-auto flex items-center justify-between max-w-5xl">
            <span class="brand-text">Firesong Herald</span>
            <div class="flex items-center gap-6 text-base">
                <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="nav-link">GitHub</a>
                <a href="/privacy" class="nav-link">Privacy</a>
                <a href="/tos" class="nav-link">Terms</a>
                <a href="/app" class="nav-link">Dashboard</a>

                <button onclick={handleToggle} class="cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors" aria-label="Toggle dark mode">
                    {#if dark}
                        <SunIcon class="size-4" />
                    {:else}
                        <MoonIcon class="size-4" />
                    {/if}
                </button>

                <a href="/login" class="btn preset-filled-primary-500 px-5 py-2 rounded-lg font-medium shadow-lg shadow-primary-500/20">Sign in</a>
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
            <a href="/app" class="btn preset-outlined-surface-500 px-6 py-3 rounded-md font-medium">
                Open Dashboard
            </a>
        </div>
    </section>

    <!-- Features -->
    <section class="max-w-5xl mx-auto px-6 pb-24">
        <div class="grid sm:grid-cols-2 gap-6">
            {#each features as feature}
                <div class="glass-card p-6">
                    <h2 class="font-semibold text-lg mb-2">{feature.title}</h2>
                    <p class="text-surface-600 dark:text-surface-400 text-sm">{feature.description}</p>
                </div>
            {/each}
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-surface-200 dark:border-surface-800 px-6 py-6 text-center text-sm text-surface-500 mt-auto">
        <div class="flex flex-wrap justify-center gap-4">
            <a href="/privacy" class="hover:underline">Privacy Policy</a>
            <a href="/tos" class="hover:underline">Terms of Service</a>
            <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="hover:underline">GitHub</a>
        </div>
        <p class="mt-3">© {new Date().getFullYear()} Firesong Herald. Open source under AGPL-3.0.</p>
    </footer>

</div>