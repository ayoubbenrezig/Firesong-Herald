<script lang="ts">
    import type { Component } from 'svelte';
    import { page } from '$app/state';

    interface Props {
        href: string;
        label: string;
        icon: Component<{ class?: string }>;
        expanded: boolean;
    }

    let { href, label, icon: Icon, expanded }: Props = $props();

    const isActive = $derived(page.url.pathname === href || page.url.pathname.startsWith(href + '/'));
</script>

<a
        {href}
        title={!expanded ? label : undefined}
        class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
            {isActive
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-surface-400 hover:bg-surface-500/10 hover:text-surface-100'}"
        aria-current={isActive ? 'page' : undefined}
>
    <Icon class="size-5 shrink-0 {isActive ? 'text-primary-400' : 'text-surface-500 group-hover:text-surface-300'}" />
    {#if expanded}
        <span class="truncate">{label}</span>
    {/if}
</a>