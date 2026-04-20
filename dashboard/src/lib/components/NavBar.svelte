<script lang="ts">
    import { CaretDownIcon, SignOutIcon, GearIcon } from 'phosphor-svelte';
    import DarkModeButton from '$lib/components/DarkModeButton.svelte';
    import RefreshButton from '$lib/components/RefreshButton.svelte';
    import { openSettings } from '$lib/settings.svelte';

    // ── Props ─────────────────────────────────────────────────────────────────

    interface Props {
        user: {
            discordId: string;
            username: string;
            globalName: string | null;
            avatar: string | null;
        } | null;
        isTester: boolean;
        onDeleteAccount: () => void;
    }

    let { user, isTester, onDeleteAccount }: Props = $props();

    // ── Dropdown ──────────────────────────────────────────────────────────────

    let dropdownOpen = $state(false);

    function toggleDropdown(): void {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown(): void {
        dropdownOpen = false;
    }

    function handleOpenSettings(): void {
        dropdownOpen = false;
        openSettings();
    }

    function handleDeleteAccount(): void {
        dropdownOpen = false;
        onDeleteAccount();
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
</script>

<header class="nav-polished px-4 py-4 min-[920px]:px-8 min-[920px]:py-5 sticky top-0 z-50 w-full shrink-0">
    <div class="mx-auto flex items-center justify-between w-full min-[920px]:max-w-5xl">

        <span class="brand-text">Firesong Herald</span>

        <!-- Desktop — hidden below 920px -->
        <div class="hidden min-[920px]:flex items-center gap-6 text-base">
            <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="nav-link">GitHub</a>
            <a href="/privacy" class="nav-link">Privacy</a>
            <a href="/tos" class="nav-link">Terms</a>

            {#if user && isTester}
                <a href="/app" class="nav-link">Dashboard</a>
            {/if}

            <DarkModeButton size={4} />

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
                            <button
                                    type="button"
                                    onclick={handleOpenSettings}
                                    class="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                            >
                                <GearIcon class="size-4" />
                                Settings
                            </button>
                            <a
                                    href="/logout"
                                    class="flex items-center gap-2.5 px-4 py-3 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                            >
                                <SignOutIcon class="size-4" />
                                Sign out
                            </a>
                            <button
                                    type="button"
                                    onclick={handleDeleteAccount}
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
        <div class="min-[920px]:hidden flex items-center gap-3">
            <RefreshButton size={5} />
            <DarkModeButton size={5} />
        </div>

    </div>
</header>