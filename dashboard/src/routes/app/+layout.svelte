<script lang="ts">
    import { onMount } from 'svelte';
    import '../layout.css';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import TopBar from '$lib/components/TopBar.svelte';
    import AppBottomBar from '$lib/components/AppBottomBar.svelte';
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

<div class="flex h-screen overflow-hidden">

    <!-- Mobile backdrop -->
    {#if layout.isMobile && layout.mobileOpen}
        <div
                class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onclick={layout.closeMobile}
                aria-hidden="true"
        ></div>
    {/if}

    <!-- Sidebar — z-50 so it renders above everything during animation -->
    <div
            class="{layout.isMobile
                ? 'fixed top-0 left-0 z-50 h-full transition-transform duration-300 ' + (layout.mobileOpen ? 'translate-x-0' : '-translate-x-full')
                : 'relative z-10'}"
    >
        <Sidebar user={data.user} />
    </div>

    <!-- Main -->
    <div class="flex flex-col flex-1 overflow-hidden">
        <TopBar user={data.user} />
        <main class="flex-1 overflow-y-auto {layout.isMobile ? 'pb-16' : ''}">
            {@render children()}
        </main>
    </div>

    <!-- Mobile bottom bar -->
    {#if layout.isMobile}
        <AppBottomBar />
    {/if}

</div>