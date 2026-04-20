<script lang="ts">
    import { TestTubeIcon, LockIcon } from 'phosphor-svelte';
    import MobileBottomBar from '$lib/components/MobileBottomBar.svelte';
    import NavBar from '$lib/components/NavBar.svelte';
    import TesterModal from '$lib/components/TesterModal.svelte';
    import ThankYouModal from '$lib/components/ThankYouModal.svelte';
    import DeleteAccountModal from '$lib/components/DeleteAccountModal.svelte';

    // ── Props ─────────────────────────────────────────────────────────────────

    interface Props {
        data: {
            user: {
                discordId: string;
                username: string;
                avatar: string | null;
                globalName: string | null;
            } | null;
            isTester: boolean;
            botInviteUrl: string | null;
        };
    }

    let { data }: Props = $props();

    const user = $derived(data.user);
    const isTester = $derived(data.isTester);
    const botInviteUrl = $derived(data.botInviteUrl);

    // ── Feature cards ─────────────────────────────────────────────────────────

    const features = [
        {
            title: 'Event Management',
            description: 'Create, edit, and manage community events directly from Discord or the web dashboard.',
        },
        {
            title: 'RSVP System',
            description: 'Flexible sign-up slots for any event format — from simple one-click RSVPs to custom role-based options.',
        },
        {
            title: 'Live Dashboard',
            description: 'Manage everything from a clean web interface that syncs with Discord in real time.',
        },
        {
            title: 'Reminders',
            description: 'Automatic event reminders keep your community informed and ready to show up.',
        },
    ];

    // ── Modals ────────────────────────────────────────────────────────────────

    let testerModalOpen = $state(false);
    let thankYouModalOpen = $state(false);
    let deleteAccountModalOpen = $state(false);

    function openTesterModal(): void {
        testerModalOpen = true;
    }

    function closeTesterModal(): void {
        testerModalOpen = false;
    }

    function openThankYouModal(): void {
        thankYouModalOpen = true;
    }

    function closeThankYouModal(): void {
        thankYouModalOpen = false;
    }

    function openDeleteAccountModal(): void {
        deleteAccountModalOpen = true;
    }

    function closeDeleteAccountModal(): void {
        deleteAccountModalOpen = false;
    }
</script>

<svelte:head>
    <title>Firesong Herald</title>
    <meta name="description" content="A Discord bot for community event management — signups, RSVPs, reminders, and a live web dashboard." />
</svelte:head>

<div class="min-h-screen flex flex-col">

    <NavBar {user} {isTester} onDeleteAccount={openDeleteAccountModal} />

    <!-- Hero -->
    <section class="max-w-5xl mx-auto px-6 py-24 text-center">

        {#if user && isTester}
            <button
                    type="button"
                    onclick={openThankYouModal}
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                       bg-primary-500/10 text-primary-500 border border-primary-500/20 mb-6
                       hover:bg-primary-500/20 transition-colors cursor-pointer"
            >
                <TestTubeIcon class="size-3.5" />
                You're a tester
            </button>
        {:else if user && !isTester}
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                        bg-error-500/10 text-error-500 border border-error-500/20 mb-6">
                <LockIcon class="size-3.5" />
                You are not a tester — access denied
            </div>
        {/if}

        <h1 class="text-4xl font-bold mb-4">Event management for Discord communities</h1>
        <p class="text-surface-600 dark:text-surface-400 text-lg mb-10 max-w-2xl mx-auto">
            Firesong Herald makes it easy to create events, manage sign-ups, and keep your community in sync — directly from Discord or the web.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
            {#if user && isTester}
                {#if botInviteUrl}
                    <a
                            href={botInviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn preset-filled-primary-500 px-6 py-3 rounded-md font-medium"
                    >
                        Add to Server
                    </a>
                {/if}
                <a href="/app" class="btn preset-outlined-surface-500 px-6 py-3 rounded-md font-medium">
                    Open Dashboard
                </a>
            {:else if user && !isTester}
                <button
                        type="button"
                        onclick={openTesterModal}
                        class="btn preset-filled-primary-500 px-6 py-3 rounded-md font-medium"
                >
                    Become a Tester
                </button>
            {:else}
                <button
                        type="button"
                        onclick={openTesterModal}
                        class="btn preset-filled-primary-500 px-6 py-3 rounded-md font-medium"
                >
                    Become a Tester
                </button>
                <a href="/app" class="btn preset-outlined-surface-500 px-6 py-3 rounded-md font-medium">
                    Open Dashboard
                </a>
            {/if}
        </div>
    </section>

    <!-- Features -->
    <section class="max-w-5xl mx-auto px-6 pb-24">
        <div class="grid sm:grid-cols-2 gap-6">
            {#each features as feature}
                <div class="glass-card p-6">
                    <h2 class="font-semibold text-lg mb-2">{feature.title}</h2>
                    <p class="text-surface-600 dark:text-surface-400 text-sm">{feature.description}</p>
                </div>
            {/each}
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-surface-200 dark:border-surface-800 px-6 py-6 text-center text-sm text-surface-500 mt-auto min-[920px]:pb-6 pb-28">
        <div class="flex flex-wrap justify-center gap-4">
            <a href="/privacy" class="hover:underline">Privacy Policy</a>
            <a href="/tos" class="hover:underline">Terms of Service</a>
            <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="hover:underline">GitHub</a>
            {#if user}
                <button
                        type="button"
                        onclick={openDeleteAccountModal}
                        class="text-error-500 hover:underline"
                >
                    Delete account
                </button>
            {/if}
        </div>
        <p class="mt-3">© {new Date().getFullYear()} Firesong Herald. Open source under AGPL-3.0.</p>
    </footer>

    <MobileBottomBar
            {user}
            {isTester}
            {botInviteUrl}
            onBecomeTester={openTesterModal}
            onThankYou={openThankYouModal}
            onDeleteAccount={openDeleteAccountModal}
    />

</div>

<TesterModal open={testerModalOpen} onclose={closeTesterModal} />
<ThankYouModal open={thankYouModalOpen} onclose={closeThankYouModal} />
{#if user}
    <DeleteAccountModal
            open={deleteAccountModalOpen}
            discordUserId={user.discordId}
            onclose={closeDeleteAccountModal}
    />
{/if}