<script lang="ts">
    import { XIcon, TrashIcon, WarningIcon } from 'phosphor-svelte';

    // ── Props ─────────────────────────────────────────────────────────────────

    interface Props {
        /** Whether the modal is visible. */
        open: boolean;
        /** The Discord user ID of the authenticated user. */
        discordUserId: string;
        /** Called when the user dismisses the modal without deleting. */
        onclose: () => void;
    }

    let { open, discordUserId, onclose }: Props = $props();

    // ── State ─────────────────────────────────────────────────────────────────

    let loading = $state(false);
    let error = $state<string | null>(null);

    // ── Handlers ──────────────────────────────────────────────────────────────

    /**
     * Closes the modal when Escape is pressed.
     */
    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape' && !loading) {
            onclose();
        }
    }

    /**
     * Sends the DELETE request to the API and redirects to logout on success.
     */
    async function handleDelete(): Promise<void> {
        loading = true;
        error = null;

        try {
            const response = await fetch(`/api/users/${discordUserId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                error = 'Something went wrong. Please try again.';
                loading = false;
                return;
            }

            window.location.href = '/logout';
        } catch {
            error = 'Something went wrong. Please try again.';
            loading = false;
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <div
            class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Delete account"
    >
        <div class="w-full max-w-md bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col">

            <!-- Header -->
            <div class="flex items-center justify-between px-8 py-5 border-b border-surface-200 dark:border-surface-800 shrink-0">
                <h2 class="font-semibold text-surface-900 dark:text-surface-50">Delete account</h2>
                {#if !loading}
                    <button
                            type="button"
                            onclick={onclose}
                            class="text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 transition-colors"
                            aria-label="Close"
                    >
                        <XIcon class="size-5" />
                    </button>
                {/if}
            </div>

            <!-- Body -->
            <div class="px-8 py-6 space-y-4 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                <div class="flex items-start gap-3 p-4 rounded-lg bg-error-500/10 border border-error-500/20 text-error-500">
                    <WarningIcon class="size-5 shrink-0 mt-0.5" />
                    <p>This is permanent and cannot be undone.</p>
                </div>

                <p>Deleting your account will:</p>

                <ul class="space-y-1.5 list-disc list-inside text-surface-600 dark:text-surface-400">
                    <li>Remove your account and all saved preferences</li>
                    <li>Remove you from the tester programme if applicable</li>
                    <li>Remove the bot from any servers you invited it to</li>
                </ul>

                {#if error}
                    <p class="text-error-500 text-xs">{error}</p>
                {/if}
            </div>

            <!-- Footer -->
            <div class="px-8 py-4 border-t border-surface-200 dark:border-surface-800 shrink-0 flex justify-end gap-3">
                <button
                        type="button"
                        onclick={onclose}
                        disabled={loading}
                        class="btn preset-outlined-surface-500 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                        type="button"
                        onclick={handleDelete}
                        disabled={loading}
                        class="btn preset-filled-error-500 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    <TrashIcon class="size-4" />
                    {loading ? 'Deleting…' : 'Delete my account'}
                </button>
            </div>

        </div>
    </div>
{/if}