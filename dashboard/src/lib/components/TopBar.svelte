<script lang="ts">
    import { BellIcon, CaretDownIcon } from 'phosphor-svelte';

    interface Props {
        user: {
            discordId: string;
            username: string;
            globalName: string | null;
            avatar: string | null;
        };
    }

    let { user }: Props = $props();

    // TODO: wire to server selector once server picker is implemented
    const selectedServer = $state<{ name: string; icon: string | null } | null>(null);
</script>

<header class="flex items-center justify-between px-6 py-4 border-b border-surface-800/60">

    <!-- Left: server picker placeholder -->
    <button
            type="button"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-500/10 transition-colors text-sm"
            aria-label="Select server"
    >
        {#if selectedServer}
            <span class="size-7 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">
                {selectedServer.name[0]}
            </span>
            <span class="font-medium text-surface-200">{selectedServer.name}</span>
        {:else}
            <span class="size-7 rounded-full bg-surface-700 flex items-center justify-center">
                <span class="size-3 rounded-full bg-surface-500"></span>
            </span>
            <span class="text-surface-500">Select a server</span>
        {/if}
        <CaretDownIcon class="size-3.5 text-surface-600" />
    </button>

    <!-- Right: notification bell -->
    <button
            type="button"
            class="relative p-2 rounded-xl hover:bg-surface-500/10 transition-colors text-surface-400 hover:text-surface-200"
            aria-label="Notifications"
    >
        <BellIcon class="size-5" />
        <!-- Placeholder badge — wire to real count later -->
        <!-- <span class="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary-500"></span> -->
    </button>

</header>