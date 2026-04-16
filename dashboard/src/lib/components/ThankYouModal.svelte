<script lang="ts">
    import { DiscordLogoIcon, XIcon } from 'phosphor-svelte';

    interface Props {
        /** Whether the modal is visible. */
        open: boolean;
        /** Called when the user dismisses the modal. */
        onclose: () => void;
    }

    let { open, onclose }: Props = $props();

    /**
     * Closes the modal when Escape is pressed.
     */
    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            onclose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <div
            class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Thank you for testing"
    >
        <div class="w-full max-w-lg bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col max-h-[85vh]">

            <!-- Header -->
            <div class="flex items-center justify-between px-8 py-5 border-b border-surface-200 dark:border-surface-800 shrink-0">
                <h2 class="font-semibold text-surface-900 dark:text-surface-50">Thank you for testing 🙏</h2>
                <button
                        type="button"
                        onclick={onclose}
                        class="text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 transition-colors"
                        aria-label="Close"
                >
                    <XIcon class="size-5" />
                </button>
            </div>

            <!-- Body -->
            <div class="overflow-y-auto px-8 py-6 space-y-4 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">

                <p>
                    You're registered as a tester — it genuinely means a lot. Your feedback helps shape what Firesong Herald becomes.
                </p>

                <p>
                    If you'd like to go further and test the bot on your own Discord server, you can do that too. Your server would become a test environment, and your members can participate in testing both the bot and the dashboard together.
                </p>

                <p>
                    To register a server for testing, the process is the same — join the support server and open a thread in the support forum. My team will get you sorted from there.
                </p>

                <div class="pt-2">
                    <a
                            href="https://discord.gg/e8eVQTB24z"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-3 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                        <DiscordLogoIcon class="size-5 shrink-0" />
                        <span>Firesong Herald Discord Server</span>
                    </a>
                </div>

            </div>

            <!-- Footer -->
            <div class="px-8 py-4 border-t border-surface-200 dark:border-surface-800 shrink-0 flex justify-end">
                <button
                        type="button"
                        onclick={onclose}
                        class="btn preset-filled-primary-500 px-4 py-2 rounded-md text-sm font-medium"
                >
                    Close
                </button>
            </div>

        </div>
    </div>
{/if}