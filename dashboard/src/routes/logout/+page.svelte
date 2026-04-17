<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // ── Logout ────────────────────────────────────────────────────────────────
    // Navigates to the API logout endpoint on mount, which clears the session
    // cookie and redirects back to /login.

    onMount(() => {
        goto('/auth/logout');
    });
</script>

<svelte:head>
    <title>Signing out — Firesong Herald</title>
</svelte:head>

<div class="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
    <p class="text-sm text-surface-500">Signing you out...</p>
</div>