<script lang="ts">
    import { browser } from '$app/environment';
    import { SunIcon, MoonIcon, CaretDownIcon, SignOutIcon, TestTubeIcon, LockIcon } from 'phosphor-svelte';
    import { toggleMode } from '$lib/mode';
    import MobileBottomBar from '$lib/components/MobileBottomBar.svelte';
    import RefreshButton from '$lib/components/RefreshButton.svelte';
    import TesterModal from '$lib/components/TesterModal.svelte';
    import ThankYouModal from '$lib/components/ThankYouModal.svelte';
    import DeleteAccountModal from '$lib/components/DeleteAccountModal.svelte';

    // ── Props ─────────────────────────────────────────────────────────────────

    interface Props {
        data: {
            user: {
                discordId: string;
                username: string;
                avatar: string | null;
                globalName: string | null;
            } | null;
            isTester: boolean;
            botInviteUrl: string | null;
        };
    }

    let { data }: Props = $props();

    const user = $derived(data.user);
    const isTester = $derived(data.isTester);
    const botInviteUrl = $derived(data.botInviteUrl);

    // ── Feature cards ─────────────────────────────────────────────────────────

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

    // ── Dark mode ─────────────────────────────────────────────────────────────

    function isDark(): boolean {
        if (!browser) return false;
        return document.documentElement.getAttribute('data-mode') === 'dark';
    }

    let dark = $state(isDark());

    function handleToggle(): void {
        toggleMode();
        dark = !dark;
    }

    // ── User dropdown ─────────────────────────────────────────────────────────

    let dropdownOpen = $state(false);

    function toggleDropdown(): void {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown(): void {
        dropdownOpen = false;
    }

    /**
     * Returns the Discord CDN avatar URL for the authenticated user,
     * or a fallback default avatar if no avatar hash is set.
     */
    function avatarUrl(discordId: string, avatar: string | null): string {
        if (avatar) {
            return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.webp?size=64`;
        }
        const index = Number(BigInt(discordId) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }

    // ── Modals ────────────────────────────────────────────────────────────────

    let testerModalOpen = $state(false);
    let thankYouModalOpen = $state(false);
    let deleteAccountModalOpen = $state(false);

    function openTesterModal(): void {
        testerModalOpen = true;
    }

    function closeTesterModal(): void {
        testerModalOpen = false;
    }

    function openThankYouModal(): void {
        thankYouModalOpen = true;
    }

    function closeThankYouModal(): void {
        thankYouModalOpen = false;
    }

    function openDeleteAccountModal(): void {
        dropdownOpen = false;
        deleteAccountModalOpen = true;
    }

    function closeDeleteAccountModal(): void {
        deleteAccountModalOpen = false;
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

            <!-- Desktop — hidden below 920px -->
            <div class="hidden min-[920px]:flex items-center gap-6 text-base">
                <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="nav-link">GitHub</a>
                <a href="/privacy" class="nav-link">Privacy</a>
                <a href="/tos" class="nav-link">Terms</a>

                {#if user && isTester}
                    <a href="/app" class="nav-link">Dashboard</a>
                {/if}

                <button
                        onclick={handleToggle}
                        class="cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Toggle dark mode"
                >
                    {#if dark}
                        <SunIcon class="size-4" />
                    {:else}
                        <MoonIcon class="size-4" />
                    {/if}
                </button>

                {#if user}
                    <div class="relative">
                        <button
                                type="button"
                                onclick={toggleDropdown}
                                class="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors"
                                aria-expanded={dropdownOpen}
                                aria-haspopup="true"
                        >
                            <img
                                    src={avatarUrl(user.discordId, user.avatar)}
                                    alt="{user.globalName ?? user.username}'s avatar"
                                    class="size-7 rounded-full"
                            />
                            <span class="text-sm font-medium text-surface-900 dark:text-surface-50">
                                Hi, {user.globalName ?? user.username}
                            </span>
                            <CaretDownIcon class="size-3.5 text-surface-500 transition-transform {dropdownOpen ? 'rotate-180' : ''}" />
                        </button>

                        {#if dropdownOpen}
                            <div
                                    class="fixed inset-0 z-40"
                                    role="presentation"
                                    onclick={closeDropdown}
                            ></div>
                            <div class="absolute right-0 mt-2 w-44 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 shadow-xl z-50 overflow-hidden">
                                <a
                                        href="/logout"
                                        class="flex items-center gap-2.5 px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                                >
                                    <SignOutIcon class="size-4" />
                                    Sign out
                                </a>
                                <button
                                        type="button"
                                        onclick={openDeleteAccountModal}
                                        class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-error-500 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                                >
                                    <SignOutIcon class="size-4" />
                                    Delete account
                                </button>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <a href="/login" class="btn preset-filled-primary-500 px-5 py-2 rounded-lg font-medium shadow-lg shadow-primary-500/20">
                        Sign in
                    </a>
                {/if}
            </div>

            <!-- Mobile controls — visible below 920px only -->
            <div class="min-[920px]:hidden flex items-center gap-1">
                <RefreshButton size={5} />
                <button
                        onclick={handleToggle}
                        class="cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Toggle dark mode"
                >
                    {#if dark}
                        <SunIcon class="size-5" />
                    {:else}
                        <MoonIcon class="size-5" />
                    {/if}
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero -->
    <section class="max-w-5xl mx-auto px-6 py-24 text-center">

        {#if user && isTester}
            <button
                    type="button"
                    onclick={openThankYouModal}
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                       bg-primary-500/10 text-primary-500 border border-primary-500/20 mb-6
                       hover:bg-primary-500/20 transition-colors cursor-pointer"
            >
                <TestTubeIcon class="size-3.5" />
                You're a tester
            </button>
        {:else if user && !isTester}
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                        bg-error-500/10 text-error-500 border border-error-500/20 mb-6">
                <LockIcon class="size-3.5" />
                You are not a tester — access denied
            </div>
        {/if}

        <h1 class="text-4xl font-bold mb-4">Event management for Discord communities</h1>
        <p class="text-surface-600 dark:text-surface-400 text-lg mb-10 max-w-2xl mx-auto">
            Firesong Herald makes it easy to create events, manage sign-ups, and keep your community in sync — directly from Discord or the web.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            {#if user && isTester}
                {#if botInviteUrl}
                    <a
                            href={botInviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn preset-filled-primary-500 px-6 py-3 rounded-md font-medium"
                    >
                        Add to Server
                    </a>
                {/if}
                <a href="/app" class="btn preset-outlined-surface-500 px-6 py-3 rounded-md font-medium">
                    Open Dashboard
                </a>
            {:else if user && !isTester}
                <button
                        type="button"
                        onclick={openTesterModal}
                        class="btn preset-filled-primary-500 px-6 py-3 rounded-md font-medium"
                >
                    Become a Tester
                </button>
            {:else}
                <button
                        type="button"
                        onclick={openTesterModal}
                        class="btn preset-filled-primary-500 px-6 py-3 rounded-md font-medium"
                >
                    Become a Tester
                </button>
                <a href="/app" class="btn preset-outlined-surface-500 px-6 py-3 rounded-md font-medium">
                    Open Dashboard
                </a>
            {/if}
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
    <footer class="border-t border-surface-200 dark:border-surface-800 px-6 py-6 text-center text-sm text-surface-500 mt-auto min-[920px]:pb-6 pb-28">
        <div class="flex flex-wrap justify-center gap-4">
            <a href="/privacy" class="hover:underline">Privacy Policy</a>
            <a href="/tos" class="hover:underline">Terms of Service</a>
            <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="hover:underline">GitHub</a>
            {#if user}
                <button
                        type="button"
                        onclick={openDeleteAccountModal}
                        class="text-error-500 hover:underline"
                >
                    Delete account
                </button>
            {/if}
        </div>
        <p class="mt-3">© {new Date().getFullYear()} Firesong Herald. Open source under AGPL-3.0.</p>
    </footer>

    <MobileBottomBar
            {user}
            {isTester}
            {botInviteUrl}
            onBecomeTester={openTesterModal}
            onThankYou={openThankYouModal}
            onDeleteAccount={openDeleteAccountModal}
    />

</div>

<TesterModal open={testerModalOpen} onclose={closeTesterModal} />
<ThankYouModal open={thankYouModalOpen} onclose={closeThankYouModal} />
{#if user}
    <DeleteAccountModal
            open={deleteAccountModalOpen}
            discordUserId={user.discordId}
            onclose={closeDeleteAccountModal}
    />
{/if}