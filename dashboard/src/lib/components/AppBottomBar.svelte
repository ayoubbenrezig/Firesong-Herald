<script lang="ts">
    import {
        SquaresFourIcon,
        CalendarIcon,
        UsersIcon,
        HardDrivesIcon,
        InfoIcon,
    } from 'phosphor-svelte';
    import { page } from '$app/state';
    import type { Component } from 'svelte';

    interface NavItem {
        href: string;
        label: string;
        icon: Component<{ class?: string }>;
    }

    // Overview, Events on the left — Servers, RSVPs on the right — Info in centre
    const leftItems: NavItem[] = [
        { href: '/app',        label: 'Overview', icon: SquaresFourIcon },
        { href: '/app/events', label: 'Events',   icon: CalendarIcon    },
    ];

    const rightItems: NavItem[] = [
        { href: '/app/servers', label: 'Servers', icon: HardDrivesIcon },
        { href: '/app/rsvps',   label: 'RSVPs',   icon: UsersIcon      },
    ];

    // Info popup state
    let infoOpen = $state(false);

    function toggleInfo(): void {
        infoOpen = !infoOpen;
    }

    function closeInfo(): void {
        infoOpen = false;
    }

    const allItems = [...leftItems, ...rightItems];

    /**
     * Exact match for /app, prefix match for sub-routes.
     */
    function isActive(href: string): boolean {
        if (href === '/app') return page.url.pathname === '/app';
        return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
    }
</script>

<!-- Info popup -->
{#if infoOpen}
    <div
            class="fixed inset-0 z-40"
            role="presentation"
            onclick={closeInfo}
    ></div>
    <div class="fixed bottom-22 left-1/2 -translate-x-1/2 z-50 w-56
        bg-surface-900 border border-surface-800 rounded-2xl shadow-xl p-4 space-y-3">
        <p class="text-xs font-semibold uppercase tracking-widest text-surface-500">Navigation</p>
        {#each allItems as item}
            {@const Icon = item.icon}
            <div class="flex items-center gap-3">
                <Icon class="size-4 text-surface-400 shrink-0" />
                <span class="text-sm text-surface-300">{item.label}</span>
            </div>
        {/each}
        <div class="flex items-center gap-3">
            <InfoIcon class="size-4 text-surface-400 shrink-0" />
            <span class="text-sm text-surface-300">Navigation guide</span>
        </div>
    </div>
{/if}

<nav
        class="fixed bottom-0 left-0 right-0 z-30 flex items-center
            bg-surface-950 border-t border-surface-800/60
            shadow-[0_-4px_24px_rgba(0,0,0,0.3)]
            h-20 px-2"
        aria-label="Mobile navigation"
>
    <!-- Left items -->
    {#each leftItems as item}
        {@const Icon = item.icon}
        {@const active = isActive(item.href)}
        <a
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                class="flex items-center justify-center flex-1 h-full transition-colors
                    {active ? 'text-primary-400' : 'text-surface-500 hover:text-surface-300'}"
        >
            <Icon class="size-7" />
        </a>
    {/each}

    <!-- Info button — centre -->
    <button
            type="button"
            onclick={toggleInfo}
            aria-label="Navigation guide"
            class="flex items-center justify-center flex-1 h-full text-surface-500 hover:text-surface-300 transition-colors"
    >
        <InfoIcon class="size-7" />
    </button>

    <!-- Right items -->
    {#each rightItems as item}
        {@const Icon = item.icon}
        {@const active = isActive(item.href)}
        <a
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                class="flex items-center justify-center flex-1 h-full transition-colors
                    {active ? 'text-primary-400' : 'text-surface-500 hover:text-surface-300'}"
        >
            <Icon class="size-7" />
        </a>
    {/each}
</nav>