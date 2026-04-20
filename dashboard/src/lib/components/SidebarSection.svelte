<script lang="ts">
    interface Props {
        label?: string;
        expanded: boolean;
        children: import('svelte').Snippet;
    }

    let { label, expanded, children }: Props = $props();
</script>

<div class="space-y-0.5">
    {#if label && expanded}
        <p class="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-surface-600 select-none">
            {label}
        </p>
    {:else if label && !expanded}
        <div class="mx-3 my-3 border-t border-surface-800"></div>
    {/if}
    {@render children()}
</div>