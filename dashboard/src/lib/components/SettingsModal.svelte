<script lang="ts">
    import { XIcon } from 'phosphor-svelte';
    import { closeSettings, isSettingsOpen } from '$lib/settings.svelte';
    import { THEMES, getCurrentTheme, previewTheme, setTheme, type ThemeId } from '$lib/theme.svelte';
    import DarkModeButton from '$lib/components/DarkModeButton.svelte';

    // ── State ─────────────────────────────────────────────────────────────────

    let previewId = $state<ThemeId | null>(null);
    let confirmedId = $state<ThemeId>(getCurrentTheme());

    const activeId = $derived(previewId ?? confirmedId);
    const isDirty = $derived(previewId !== null && previewId !== confirmedId);

    // ── Actions ───────────────────────────────────────────────────────────────

    function handleSelect(id: ThemeId): void {
        previewId = id;
        previewTheme(id);
    }

    function handleConfirm(): void {
        if (!isDirty) return;
        setTheme(activeId);
        confirmedId = activeId;
        previewId = null;
        // TODO: persist to DB
    }

    function handleCancel(): void {
        previewTheme(confirmedId);
        previewId = null;
    }

    function handleClose(): void {
        handleCancel();
        closeSettings();
    }

    /** Close on backdrop click. */
    function handleBackdrop(e: MouseEvent): void {
        if (e.target === e.currentTarget) handleClose();
    }

    /** Close on Escape key. */
    function handleKeydown(e: KeyboardEvent): void {
        if (e.key === 'Escape') handleClose();
    }
</script>

{#if isSettingsOpen()}
    <!-- Backdrop -->
    <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            role="presentation"
            onclick={handleBackdrop}
            onkeydown={handleKeydown}
            tabindex="-1"
    >
        <!-- Modal -->
        <div class="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-surface-100 dark:bg-surface-950 border border-surface-300 dark:border-surface-800 shadow-2xl">

            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-surface-300 dark:border-surface-800">
                <h2 class="text-base font-semibold">Settings</h2>
                <button
                        onclick={handleClose}
                        class="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        aria-label="Close settings"
                >
                    <XIcon class="size-4" />
                </button>
            </div>

            <!-- Body -->
            <div class="px-5 py-5 space-y-6">

                <!-- Appearance section -->
                <section>
                    <p class="text-xs font-semibold uppercase tracking-widest opacity-40 mb-3">Appearance</p>

                    <!-- Dark / light toggle -->
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-sm">Mode</span>
                        <DarkModeButton size={4} />
                    </div>

                    <!-- Theme label -->
                    <p class="text-sm mb-2">Colour theme</p>

                    <!-- Theme grid — emoji only at all sizes -->
                    <div class="grid grid-cols-6 min-[920px]:grid-cols-8 gap-1.5">
                        {#each THEMES as theme (theme.id)}
                            <button
                                    onclick={() => handleSelect(theme.id)}
                                    aria-label="Select {theme.label} theme"
                                    aria-pressed={activeId === theme.id}
                                    title={theme.label}
                                    class="flex items-center justify-center p-2 rounded-xl text-xl transition-all
                                        {activeId === theme.id
                                            ? 'bg-black/10 dark:bg-white/10 ring-2 ring-black/20 dark:ring-white/30'
                                            : 'hover:bg-black/5 dark:hover:bg-white/5'}"
                            >
                                {theme.emoji}
                            </button>
                        {/each}
                    </div>

                    <!-- Confirm / cancel -->
                    <div class="flex items-center gap-3 mt-4">
                        <button
                                onclick={handleConfirm}
                                disabled={!isDirty}
                                class="btn preset-filled-primary-500 px-4 py-2 text-sm rounded-lg
                                    {!isDirty ? 'opacity-40 cursor-not-allowed' : ''}"
                        >
                            Save theme
                        </button>
                        {#if isDirty}
                            <button
                                    onclick={handleCancel}
                                    class="text-sm opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </button>
                        {/if}
                    </div>
                </section>

            </div>
        </div>
    </div>
{/if}