<script lang="ts">
    import {
        CalendarIcon,
        UsersIcon,
        HardDrivesIcon,
        ClockIcon,
        PlusIcon,
        CheckSquareIcon,
        ChartBarIcon,
    } from 'phosphor-svelte';
    import StatCard from '$lib/components/StatCard.svelte';
    import type { Component } from 'svelte';

    // ── Stat cards ────────────────────────────────────────────────────────────

    const stats = [
        { label: 'Total Events',   value: '—', icon: CalendarIcon,  accent: 'primary'  },
        { label: 'Total RSVPs',    value: '—', icon: UsersIcon,      accent: 'success'  },
        { label: 'Active Servers', value: '—', icon: HardDrivesIcon, accent: 'warning'  },
        { label: 'Upcoming Today', value: '—', icon: ClockIcon,      accent: 'error'    },
    ] as const;

    // ── Quick actions ─────────────────────────────────────────────────────────

    interface QuickAction {
        label: string;
        icon: Component<{ class?: string }>;
        href: string;
        accent: string;
    }

    const quickActions: QuickAction[] = [
        { label: 'Create Event',   icon: PlusIcon,        href: '/app/events',  accent: 'bg-primary-500/10 text-primary-400'  },
        { label: 'View Servers',   icon: HardDrivesIcon,  href: '/app/servers', accent: 'bg-success-500/10 text-success-400'  },
        { label: 'Manage RSVPs',   icon: CheckSquareIcon, href: '/app/rsvps',   accent: 'bg-warning-500/10 text-warning-400'  },
        { label: 'Audit Log',      icon: ChartBarIcon,    href: '/app/audit',   accent: 'bg-error-500/10 text-error-400'      },
    ];
</script>

<svelte:head>
    <title>Dashboard — Firesong Herald</title>
</svelte:head>

<div class="p-4 sm:p-6 space-y-6 max-w-6xl">

    <!-- Page title -->
    <div>
        <h1 class="text-2xl font-bold text-surface-100">Overview</h1>
        <p class="text-sm text-surface-500 mt-1">Welcome back. Here's what's happening.</p>
    </div>

    <!-- Stat cards — 2 cols on mobile, 4 on wide -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {#each stats as stat}
            <StatCard
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    accent={stat.accent}
            />
        {/each}
    </div>

    <!-- Quick actions -->
    <div>
        <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-surface-300">Quick Actions</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {#each quickActions as action}
                {@const Icon = action.icon}
                <a
                        href={action.href}
                        class="glass-card flex flex-col items-center gap-3 p-4 hover:scale-[1.02] transition-transform text-center"
                >
                    <div class="size-11 rounded-xl flex items-center justify-center {action.accent}">
                        <Icon class="size-5" />
                    </div>
                    <span class="text-xs font-medium text-surface-300">{action.label}</span>
                </a>
            {/each}
        </div>
    </div>

    <!-- Content rows — side by side on wide, stacked on mobile -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        <!-- Upcoming events placeholder -->
        <div class="glass-card p-5">
            <h2 class="text-sm font-semibold text-surface-300 mb-4">Upcoming Events</h2>
            <div class="space-y-3">
                {#each Array(3) as _}
                    <div class="flex items-center gap-3">
                        <div class="size-9 rounded-lg bg-surface-800 shrink-0"></div>
                        <div class="flex-1 space-y-1.5">
                            <div class="h-3 rounded-full bg-surface-800 w-3/4"></div>
                            <div class="h-2.5 rounded-full bg-surface-800/60 w-1/2"></div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Recent activity placeholder -->
        <div class="glass-card p-5">
            <h2 class="text-sm font-semibold text-surface-300 mb-4">Recent Activity</h2>
            <div class="space-y-3">
                {#each Array(4) as _}
                    <div class="flex items-center gap-3">
                        <div class="size-2 rounded-full bg-surface-700 shrink-0"></div>
                        <div class="flex-1 space-y-1.5">
                            <div class="h-2.5 rounded-full bg-surface-800 w-5/6"></div>
                        </div>
                        <div class="h-2.5 rounded-full bg-surface-800/60 w-12 shrink-0"></div>
                    </div>
                {/each}
            </div>
        </div>

    </div>

</div>