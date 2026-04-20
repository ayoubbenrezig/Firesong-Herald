<script lang="ts">
    import { BellIcon, CaretDownIcon } from 'phosphor-svelte';
    import { layout } from '$lib/layout.svelte';

    interface Props {
        user: {
            discordId: string;
            username: string;
            globalName: string | null;
            avatar: string | null;
        };
    }

    let { user }: Props = $props();

    const selectedServer = $state<{ name: string; icon: string | null } | null>(null);
</script>

<header class="flex items-center gap-3 px-4 py-5 shrink-0">

    <!-- Hamburger — mobile only, inside top bar -->
    {#if layout.isMobile}
        <button
                onclick={layout.toggleMobileOpen}
                class="p-2 rounded-xl hover:bg-surface-500/10 transition-colors text-surface-400 hover:text-surface-200 shrink-0"
                aria-label="Open navigation"
        >
            <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    {/if}

    <!-- Server picker -->
    <button
            type="button"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-500/10 transition-colors text-sm flex-1 min-w-0"
            aria-label="Select server"
    >
        {#if selectedServer}
            <span class="size-7 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0">
                {selectedServer.name[0]}
            </span>
            <span class="font-medium text-surface-200 truncate">{selectedServer.name}</span>
        {:else}
            <span class="size-7 rounded-full bg-surface-700 flex items-center justify-center shrink-0">
                <span class="size-3 rounded-full bg-surface-500"></span>
            </span>
            <span class="text-surface-500">Select a server</span>
        {/if}
        <CaretDownIcon class="size-3.5 text-surface-600 shrink-0" />
    </button>

    <!-- Bell -->
    <button
            type="button"
            class="relative p-2 rounded-xl hover:bg-surface-500/10 transition-colors text-surface-400 hover:text-surface-200 shrink-0"
            aria-label="Notifications"
    >
        <BellIcon class="size-5" />
    </button>

</header>