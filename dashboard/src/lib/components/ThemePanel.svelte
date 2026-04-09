<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { THEMES, setTheme, previewTheme, type ThemeId } from '$lib/theme';
    import { toggleMode } from '$lib/mode';

    function getCurrentTheme(): ThemeId {
        if (!browser) return 'catppuccin';
        const fromDom = document.documentElement.getAttribute('data-theme') as ThemeId;
        const valid = THEMES.find((t) => t.id === fromDom);
        return valid ? valid.id : 'catppuccin';
    }

    let selectedTheme = $state<ThemeId>('catppuccin');
    let confirmedTheme = $state<ThemeId>('catppuccin');

    onMount(() => {
        selectedTheme = getCurrentTheme();
        confirmedTheme = getCurrentTheme();
    });

    function handlePreview(id: ThemeId): void {
        selectedTheme = id;
        previewTheme(id);
    }

    function handleConfirm(): void {
        try {
            setTheme(selectedTheme);
            confirmedTheme = selectedTheme;
        } catch {
            console.error('Failed to confirm theme:', selectedTheme);
        }
    }
</script>

<div class="p-6 space-y-6">
    <h2 class="h2">Theme</h2>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {#each THEMES as theme (theme.id)}
            <button
                    class="btn preset-outlined-surface-500 flex flex-col items-center gap-1 p-3 {selectedTheme === theme.id ? 'preset-filled-primary-500' : ''}"
                    onclick={() => handlePreview(theme.id)}
            >
                <span class="text-2xl">{theme.emoji}</span>
                <span class="text-sm">{theme.label}</span>
            </button>
        {/each}
    </div>

    <div class="flex gap-3">
        <button
                class="btn preset-filled-primary-500 {selectedTheme === confirmedTheme ? 'opacity-50 cursor-not-allowed' : ''}"
                onclick={handleConfirm}
                disabled={selectedTheme === confirmedTheme}
        >
            Confirm
        </button>

        <button class="btn preset-outlined-surface-500" onclick={toggleMode}>
            Toggle Dark / Light
        </button>
    </div>
</div>