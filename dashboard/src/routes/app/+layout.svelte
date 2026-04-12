<script lang="ts">
    import { onMount } from 'svelte';
    import '../layout.css';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import ThemePanel from '$lib/components/ThemePanel.svelte';
    import { layout } from '$lib/layout.svelte.js';

    let { children } = $props();

    onMount(() => {
        return layout.init();
    });
</script>

<div class="flex h-screen overflow-hidden">
    {#if layout.isMobile}
        {#if !layout.mobileOpen}
            <button
                    class="fixed top-4 left-4 z-50 btn preset-filled-surface-500"
                    onclick={layout.toggleMobileOpen}
                    aria-label="Open navigation"
            >
                ☰
            </button>
        {/if}

        {#if layout.mobileOpen}
            <div
                    class="fixed inset-0 z-30 bg-black/50"
                    onclick={layout.closeMobile}
                    aria-hidden="true"
            ></div>
        {/if}

        <div class="fixed top-0 left-0 z-40 h-full bg-surface-950 shadow-xl transition-transform duration-300 {layout.mobileOpen ? 'translate-x-0' : '-translate-x-full'}">
            <Sidebar />
        </div>
    {:else}
        <Sidebar />
    {/if}

    <main class="flex-1 overflow-y-auto {layout.isMobile ? 'pt-16' : ''}">
        {#if layout.activeView === 'home'}
            {@render children()}
        {:else if layout.activeView === 'theme'}
            <ThemePanel />
        {/if}
    </main>
</div>