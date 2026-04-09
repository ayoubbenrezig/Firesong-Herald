<script lang="ts">
    import { Navigation } from '@skeletonlabs/skeleton-svelte';
    import { HouseIcon, PaletteIcon, ArrowLineLeftIcon, ArrowLineRightIcon, XIcon } from 'phosphor-svelte';
    import { layout } from '$lib/layout.svelte';
</script>

<Navigation
        layout={layout.isMobile ? 'sidebar' : layout.expanded ? 'sidebar' : 'rail'}
        class="grid grid-rows-[auto_1fr_auto] h-full"
>
    <Navigation.Header>
        {#if layout.isMobile}
            <Navigation.Trigger onclick={layout.closeMobile}>
                <XIcon class="size-5" />
                <Navigation.TriggerText>Close</Navigation.TriggerText>
            </Navigation.Trigger>
        {:else}
            <Navigation.Trigger onclick={() => layout.setExpanded(!layout.expanded)}>
                {#if layout.expanded}
                    <ArrowLineLeftIcon class="size-5" />
                    <Navigation.TriggerText>Collapse</Navigation.TriggerText>
                {:else}
                    <ArrowLineRightIcon class="size-5" />
                {/if}
            </Navigation.Trigger>
        {/if}
    </Navigation.Header>

    <Navigation.Content>
        <Navigation.Menu>
            <Navigation.Trigger onclick={() => layout.setActiveView('home')}>
                <HouseIcon class="size-4" />
                {#if layout.expanded || layout.isMobile}
                    <Navigation.TriggerText>Home</Navigation.TriggerText>
                {/if}
            </Navigation.Trigger>

            <Navigation.Trigger onclick={() => layout.setActiveView('theme')}>
                <PaletteIcon class="size-4" />
                {#if layout.expanded || layout.isMobile}
                    <Navigation.TriggerText>Theme</Navigation.TriggerText>
                {/if}
            </Navigation.Trigger>
        </Navigation.Menu>
    </Navigation.Content>
</Navigation>