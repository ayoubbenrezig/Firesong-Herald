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
            aria-label="Become a Tester"
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
            <div class="overflow-y-auto px-8 py-6 space-y-4 text-sm text-surface-700 dark:text-surface-300 leading-relaxed">

                <p>
                    Firesong Herald is an open-source Discord event management bot built to handle events of any kind,
                    for any community. I'm looking for two types of testers.
                </p>

                <p>
                    Dashboard testers get access to the web dashboard and can explore everything it offers. To get the
                    full experience, you'll need to be part of a Discord server that already has the bot running.
                </p>

                <p>
                    Server testers have their own Discord server and want the bot added to it. Your server becomes a
                    test environment, and your members can participate in testing both the bot and the dashboard together.
                </p>

                <p>
                    Spots are limited by hosting capacity. If you want to get involved, join the support server and open
                    a thread in the support forum and my team will get you registered from there.
                </p>

                <p>
                    If you're missing a feature or have ideas that would make it more useful for your community,
                    reach out.
                </p>

                <!-- Contact links -->
                <div class="space-y-3 pt-2">
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

                <p class="text-surface-500 text-xs pt-2">
                    Thank you for being part of this. Please wait until a feature is complete before leaving feedback on it. 🙏
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