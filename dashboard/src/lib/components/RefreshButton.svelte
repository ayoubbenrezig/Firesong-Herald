<script lang="ts">
    import { ArrowsClockwiseIcon } from 'phosphor-svelte';

    interface Props {
        size?: number;
        class?: string;
    }

    let { size = 5, class: className = '' }: Props = $props();

    function refresh(): void {
        window.location.reload();
    }
</script>

<button
        onclick={refresh}
        class="cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors {className}"
        aria-label="Refresh page"
>
    <ArrowsClockwiseIcon class="size-{size}" />
</button>