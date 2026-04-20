<script lang="ts">
    import type { Component } from 'svelte';

    interface Props {
        label: string;
        value: string | number;
        icon: Component<{ class?: string }>;
        /** Optional subtle colour accent: 'primary' | 'success' | 'warning' | 'error' */
        accent?: 'primary' | 'success' | 'warning' | 'error';
    }

    let { label, value, icon: Icon, accent = 'primary' }: Props = $props();

    const accentClasses: Record<string, string> = {
        primary: 'bg-primary-500/10 text-primary-400',
        success: 'bg-success-500/10 text-success-400',
        warning: 'bg-warning-500/10 text-warning-400',
        error:   'bg-error-500/10 text-error-400',
    };
</script>

<div class="glass-card p-5 flex items-center gap-4">
    <div class="shrink-0 size-11 rounded-xl flex items-center justify-center {accentClasses[accent]}">
        <Icon class="size-5" />
    </div>
    <div class="min-w-0">
        <p class="text-xs font-medium text-surface-500 uppercase tracking-wider truncate">{label}</p>
        <p class="text-2xl font-bold text-surface-100 leading-tight">{value}</p>
    </div>
</div>