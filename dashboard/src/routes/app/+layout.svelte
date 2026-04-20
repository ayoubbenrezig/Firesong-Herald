<script lang="ts">
    import { onMount } from 'svelte';
    import '../layout.css';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import TopBar from '$lib/components/TopBar.svelte';
    import { layout } from '$lib/layout.svelte';

    interface Props {
        data: {
            user: {
                discordId: string;
                username: string;
                globalName: string | null;
                avatar: string | null;
            };
        };
        children: import('svelte').Snippet;
    }

    let { data, children }: Props = $props();

    onMount(() => {
        return layout.init();
    });
</script>

<div class="flex h-screen overflow-hidden bg-surface-950">

    <!-- Mobile overlay -->
    {#if layout.isMobile && layout.mobileOpen}
        <div
                class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                onclick={layout.closeMobile}
                aria-hidden="true"
        ></div>
    {/if}

    <!-- Mobile hamburger -->
    {#if layout.isMobile && !layout.mobileOpen}
        <button
                class="fixed top-4 left-4 z-50 p-2 rounded-xl bg-surface-900 border border-surface-800 text-surface-400 hover:text-surface-200 transition-colors shadow-lg"
                onclick={layout.toggleMobileOpen}
                aria-label="Open navigation"
        >
            <svg class="size-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    {/if}

    <!-- Sidebar -->
    <div class="{layout.isMobile ? 'fixed top-0 left-0 z-40 h-full transition-transform duration-300 ' + (layout.mobileOpen ? 'translate-x-0' : '-translate-x-full') : 'relative'}">
        <Sidebar user={data.user} />
    </div>

    <!-- Main -->
    <div class="flex flex-col flex-1 overflow-hidden {layout.isMobile ? 'w-full' : ''}">
        <TopBar user={data.user} />
        <main class="flex-1 overflow-y-auto">
            {@render children()}
        </main>
    </div>

</div>