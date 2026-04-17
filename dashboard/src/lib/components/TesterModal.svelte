<script lang="ts">
    import { DiscordLogoIcon, EnvelopeSimpleIcon, XIcon } from 'phosphor-svelte';

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
            aria-label="Firesong Herald: Open Testing"
    >
        <div class="w-full max-w-lg bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col max-h-[85vh]">

            <!-- Header -->
            <div class="flex items-center justify-between px-8 py-5 border-b border-surface-200 dark:border-surface-800 shrink-0">
                <h2 class="font-semibold text-surface-900 dark:text-surface-50">Firesong Herald: Open Testing</h2>
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
            <div class="overflow-y-auto px-8 py-6 space-y-5 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">

                <p>
                    Firesong Herald is an open-source Discord event management bot built to handle events of any kind, for any community.
                </p>

                <div class="space-y-3">
                    <p class="font-medium text-surface-900 dark:text-surface-100">Two ways to get involved</p>

                    <div class="space-y-1">
                        <p class="font-medium text-surface-800 dark:text-surface-200">Dashboard tester</p>
                        <p>Get access to the web app and explore everything it offers. Being in a server that already has the bot running gives you the full experience.</p>
                    </div>

                    <div class="space-y-1">
                        <p class="font-medium text-surface-800 dark:text-surface-200">Server tester</p>
                        <p>Bring the bot to your own Discord server. Your community can then participate in testing both the bot and the dashboard together.</p>
                    </div>
                </div>

                <p>
                    Spots are limited by hosting capacity. To sign up, open a thread in the support forum and my team will take it from there. Got ideas or missing a feature? Reach out.
                </p>

                <div class="space-y-3 pt-1">
                    <a
                            href="https://discord.gg/e8eVQTB24z"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center gap-3 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                        <DiscordLogoIcon class="size-5 shrink-0" />
                        <span>Firesong Herald Discord Server</span>
                    </a>
                    <a
                            href="mailto:contact@firesongherald.com"
                            class="flex items-center gap-3 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                        <EnvelopeSimpleIcon class="size-5 shrink-0" />
                        <span>contact@firesongherald.com</span>
                    </a>
                </div>

                <p class="text-surface-500 text-xs pt-1">
                    Please wait until a feature is ready before leaving feedback on it. 🙏
                </p>

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