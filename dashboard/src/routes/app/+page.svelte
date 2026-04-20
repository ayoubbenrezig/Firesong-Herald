<script lang="ts">
    import {
        CalendarIcon,
        UsersIcon,
        HardDrivesIcon,
        ClockIcon,
    } from 'phosphor-svelte';
    import StatCard from '$lib/components/StatCard.svelte';

    // Placeholder stats — wire to real API data later
    const stats = [
        { label: 'Total Events',    value: '—', icon: CalendarIcon,    accent: 'primary'  },
        { label: 'Total RSVPs',     value: '—', icon: UsersIcon,       accent: 'success'  },
        { label: 'Active Servers',  value: '—', icon: HardDrivesIcon,  accent: 'warning'  },
        { label: 'Upcoming Today',  value: '—', icon: ClockIcon,       accent: 'error'    },
    ] as const;
</script>

<svelte:head>
    <title>Dashboard — Firesong Herald</title>
</svelte:head>

<div class="p-6 space-y-8 max-w-6xl">

    <!-- Page title -->
    <div>
        <h1 class="text-2xl font-bold text-surface-100">Overview</h1>
        <p class="text-sm text-surface-500 mt-1">Welcome back. Here's what's happening.</p>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {#each stats as stat}
            <StatCard
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    accent={stat.accent}
            />
        {/each}
    </div>

    <!-- Placeholder content rows -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                        <div class="h-2.5 rounded-full bg-surface-800/60 w-12"></div>
                    </div>
                {/each}
            </div>
        </div>

    </div>

</div>