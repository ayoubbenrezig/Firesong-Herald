<script lang="ts">
    import { SunIcon, MoonIcon } from 'phosphor-svelte';
    import { toggleMode, isDark } from '$lib/mode.svelte';

    interface Props {
        size?: number;
        class?: string;
    }

    let { size = 5, class: className = '' }: Props = $props();
</script>

<button
        onclick={toggleMode}
        class="cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors {className}"
        aria-label="Toggle dark mode"
>
    {#if isDark()}
        <SunIcon class="size-{size}" />
    {:else}
        <MoonIcon class="size-{size}" />
    {/if}
</button>