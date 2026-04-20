<script lang="ts">
    import {
        SquaresFourIcon,
        CalendarIcon,
        UsersIcon,
        HardDrivesIcon,
        ClipboardTextIcon,
        GearIcon,
        HouseIcon,
        ArrowLineLeftIcon,
        ArrowLineRightIcon,
    } from 'phosphor-svelte';
    import SidebarNavItem from '$lib/components/SidebarNavItem.svelte';
    import SidebarSection from '$lib/components/SidebarSection.svelte';
    import { layout } from '$lib/layout.svelte';
    import { openSettings } from '$lib/settings.svelte';

    interface Props {
        user: {
            discordId: string;
            username: string;
            globalName: string | null;
            avatar: string | null;
        };
    }

    let { user }: Props = $props();

    const displayName = $derived(user.globalName ?? user.username);

    /**
     * Returns the Discord CDN avatar URL, or a default avatar if none is set.
     */
    function avatarUrl(discordId: string, avatar: string | null): string {
        if (avatar) {
            return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.webp?size=64`;
        }
        const index = Number(BigInt(discordId) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }

    const navItems = [
        { href: '/app',         label: 'Overview',  icon: SquaresFourIcon   },
        { href: '/app/events',  label: 'Events',    icon: CalendarIcon      },
        { href: '/app/rsvps',   label: 'RSVPs',     icon: UsersIcon         },
        { href: '/app/servers', label: 'Servers',   icon: HardDrivesIcon    },
        { href: '/app/audit',   label: 'Audit Log', icon: ClipboardTextIcon },
    ] as const;
</script>

<aside
        class="flex flex-col h-full shrink-0
            transition-[width] duration-300 ease-in-out
            bg-surface-950
            border-r border-surface-800/60
            shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.03)]
            {layout.expanded || layout.isMobile ? 'w-max min-w-56' : 'w-16 overflow-hidden'}"
>
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-surface-800/60 shrink-0">
        {#if layout.expanded || layout.isMobile}
            <span class="brand-text text-lg whitespace-nowrap flex-1">Firesong Herald</span>
        {/if}
        {#if !layout.isMobile}
            <button
                    onclick={() => layout.setExpanded(!layout.expanded)}
                    class="p-2 rounded-xl hover:bg-surface-500/10 transition-colors text-surface-500 hover:text-surface-300 shrink-0
                        {!layout.expanded ? 'mx-auto' : 'ml-auto'}"
                    aria-label={layout.expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                    title={layout.expanded ? 'Collapse' : 'Expand'}
            >
                {#if layout.expanded}
                    <ArrowLineLeftIcon class="size-4" />
                {:else}
                    <ArrowLineRightIcon class="size-4" />
                {/if}
            </button>
        {:else}
            <button
                    onclick={layout.closeMobile}
                    class="ml-auto p-2 rounded-xl hover:bg-surface-500/10 transition-colors text-surface-500 hover:text-surface-300"
                    aria-label="Close navigation"
            >
                <ArrowLineLeftIcon class="size-4" />
            </button>
        {/if}
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <SidebarSection expanded={layout.expanded || layout.isMobile}>
            {#each navItems as item}
                <SidebarNavItem
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        expanded={layout.expanded || layout.isMobile}
                />
            {/each}
        </SidebarSection>
    </nav>

    <!-- Footer -->
    <div class="shrink-0 px-3 py-4 border-t border-surface-800/60">
        <div class="flex items-center gap-3 {layout.expanded || layout.isMobile ? 'px-1' : 'justify-center'}">
            <img
                    src={avatarUrl(user.discordId, user.avatar)}
                    alt="{displayName}'s avatar"
                    class="size-9 rounded-full shrink-0 ring-1 ring-surface-700"
            />
            {#if layout.expanded || layout.isMobile}
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-200 truncate">Hi, {displayName}</p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                    <button
                            onclick={openSettings}
                            class="p-2 rounded-lg hover:bg-surface-500/10 transition-colors text-surface-500 hover:text-surface-300"
                            aria-label="Settings"
                            title="Settings"
                    >
                        <GearIcon class="size-4" />
                    </button>
                    <a
                            href="/"
                            class="p-2 rounded-lg hover:bg-surface-500/10 transition-colors text-surface-500 hover:text-surface-300"
                            aria-label="Go to home"
                            title="Home"
                    >
                        <HouseIcon class="size-4" />
                    </a>
                </div>
            {/if}
        </div>

        {#if !layout.expanded && !layout.isMobile}
            <div class="flex flex-col items-center gap-1 mt-3">
                <button
                        onclick={openSettings}
                        class="p-2 rounded-lg hover:bg-surface-500/10 transition-colors text-surface-500 hover:text-surface-300"
                        aria-label="Settings"
                        title="Settings"
                >
                    <GearIcon class="size-4" />
                </button>
                <a
                        href="/"
                        class="p-2 rounded-lg hover:bg-surface-500/10 transition-colors text-surface-500 hover:text-surface-300"
                        aria-label="Go to home"
                        title="Home"
                >
                    <HouseIcon class="size-4" />
                </a>
            </div>
        {/if}
    </div>
</aside>