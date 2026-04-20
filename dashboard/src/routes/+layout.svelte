<script lang="ts">
    import { onMount } from 'svelte';
    import './layout.css';
    import { initMode } from '$lib/mode.svelte';
    import { initTheme } from '$lib/theme.svelte';
    import SettingsModal from '$lib/components/SettingsModal.svelte';

    let { children } = $props();

    onMount(() => {
        initMode();
        initTheme();
    });
</script>

<SettingsModal />
{@render children()}