<script lang="ts">
    import { Navigation } from '@skeletonlabs/skeleton-svelte';
    import { HouseIcon, ArrowLineLeftIcon, ArrowLineRightIcon, XIcon, SquaresFourIcon } from 'phosphor-svelte';
    import { layout } from '$lib/layout.svelte';
</script>

<Navigation
        layout={layout.isMobile ? 'sidebar' : layout.expanded ? 'sidebar' : 'rail'}
        class="grid grid-rows-[auto_1fr_auto] h-full"
>
    <Navigation.Header>
        {#if layout.isMobile}
            <div class="flex flex-col px-3 pt-3 pb-2 gap-3">
                <div class="flex justify-end">
                    <Navigation.Trigger onclick={layout.closeMobile} class="rounded-lg hover:bg-surface-500/10 transition-all p-2">
                        <XIcon class="size-5" />
                    </Navigation.Trigger>
                </div>
                <span class="brand-text text-base font-black px-2 whitespace-nowrap">Firesong Herald</span>
            </div>
        {:else}
            <div class="flex flex-col px-3 pt-3 pb-2 gap-3">
                <div class="flex {layout.expanded ? 'justify-end' : 'justify-center'}">
                    <Navigation.Trigger onclick={() => layout.setExpanded(!layout.expanded)} class="rounded-lg hover:bg-surface-500/10 transition-all p-2">
                        {#if layout.expanded}
                            <ArrowLineLeftIcon class="size-5" />
                        {:else}
                            <ArrowLineRightIcon class="size-5" />
                        {/if}
                    </Navigation.Trigger>
                </div>
                {#if layout.expanded}
                    <span class="brand-text text-base font-black px-2 whitespace-nowrap">Firesong Herald</span>
                {/if}
            </div>
        {/if}
    </Navigation.Header>

    <Navigation.Content>
        <Navigation.Menu class="px-2 space-y-1">
            <Navigation.Trigger
                    onclick={() => {}}
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-surface-500/10 bg-primary-500/10 text-primary-400"
            >
                <SquaresFourIcon class="size-5 shrink-0" />
                {#if layout.expanded || layout.isMobile}
                    <Navigation.TriggerText class="font-medium">Dashboard</Navigation.TriggerText>
                {/if}
            </Navigation.Trigger>
        </Navigation.Menu>
    </Navigation.Content>

    <Navigation.Footer>
        <div class="px-2 py-3 border-t border-surface-500/10">
            <Navigation.Trigger
                    onclick={() => window.location.href = '/'}
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-surface-500/10 opacity-70 hover:opacity-100"
            >
                <HouseIcon class="size-5 shrink-0" />
                {#if layout.expanded || layout.isMobile}
                    <Navigation.TriggerText class="font-medium">Home</Navigation.TriggerText>
                {/if}
            </Navigation.Trigger>
        </div>
    </Navigation.Footer>
</Navigation>