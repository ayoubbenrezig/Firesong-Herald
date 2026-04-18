<script lang="ts">
    import { browser } from '$app/environment';
    import {
        HouseIcon,
        SquaresFourIcon,
        UserCircleIcon,
        InfoIcon,
        ListIcon,
        GithubLogoIcon,
        DownloadSimpleIcon,
        SignOutIcon,
        TestTubeIcon,
        TrashIcon,
    } from 'phosphor-svelte';

    // ── Props ─────────────────────────────────────────────────────────────────

    interface Props {
        user: {
            discordId: string;
            username: string;
            avatar: string | null;
            globalName: string | null;
        } | null;
        isTester: boolean;
        botInviteUrl: string | null;
        onBecomeTester: () => void;
        onThankYou: () => void;
        onDeleteAccount: () => void;
    }

    let { user, isTester, botInviteUrl, onBecomeTester, onThankYou, onDeleteAccount }: Props = $props();

    // ── State ─────────────────────────────────────────────────────────────────

    let menuOpen = $state(false);
    let infoOpen = $state(false);
    let userOpen = $state(false);
    let installPrompt = $state(false);
    let installConfirm = $state(false);

    let deferredPrompt: any = null;

    const isIos = browser
        ? /iphone|ipad|ipod/i.test(navigator.userAgent)
        : false;

    const isInstalled = browser
        ? window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
        : false;

    if (browser && !isIos) {
        window.addEventListener('beforeinstallprompt', (e: Event) => {
            e.preventDefault();
            deferredPrompt = e;
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Returns the Discord CDN avatar URL, or a default avatar if none is set.
     */
    function avatarUrl(discordId: string, avatar: string | null): string {
        if (avatar) {
            return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.webp?size=64`;
        }
        const index = Number(BigInt(discordId) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }

    // ── Toggle functions ──────────────────────────────────────────────────────

    function closeAll(): void {
        menuOpen = false;
        infoOpen = false;
        userOpen = false;
        installPrompt = false;
    }

    function toggleMenu(): void {
        const next = !menuOpen;
        closeAll();
        menuOpen = next;
    }

    function toggleInfo(): void {
        const next = !infoOpen;
        closeAll();
        infoOpen = next;
    }

    function toggleUser(): void {
        const next = !userOpen;
        closeAll();
        userOpen = next;
    }

    function openInstallPrompt(): void {
        closeAll();
        installConfirm = false;
        installPrompt = true;
    }

    function closeInstallPrompt(): void {
        installPrompt = false;
        installConfirm = false;
    }

    async function confirmInstall(): Promise<void> {
        if (isIos) {
            installConfirm = true;
            return;
        }
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                deferredPrompt = null;
                installPrompt = false;
            }
        }
    }

    function handleDeleteAccount(): void {
        closeAll();
        onDeleteAccount();
    }

    // ── Nav info items ────────────────────────────────────────────────────────

    const navItems = $derived([
        { icon: HouseIcon, label: 'Home', description: 'Return to the landing page.' },
        ...(user && isTester ? [{ icon: SquaresFourIcon, label: 'Dashboard', description: 'Open the web dashboard.' }] : []),
        { icon: UserCircleIcon, label: user ? (user.globalName ?? user.username) : 'Sign in', description: user ? 'Opens account options.' : 'Sign in to your account.' },
        { icon: ListIcon, label: 'More', description: 'Opens GitHub, Privacy, and Terms links.' },
        ...(!isInstalled ? [{ icon: DownloadSimpleIcon, label: 'Add to Home Screen', description: 'Found in the menu (≡).\nAdds Firesong Herald to your home screen for quick access.' }] : []),
    ]);
</script>

<div class="mobile-bottom-bar min-[920px]:hidden">

    <!-- Info panel -->
    {#if infoOpen}
        <div class="mobile-info-popup">
            <p class="mobile-info-title">Navigation guide</p>
            <div class="mobile-info-grid">
                {#each navItems as item}
                    {@const Icon = item.icon}
                    <div class="mobile-info-item">
                        <Icon class="size-5 opacity-70" />
                        <div>
                            <p class="mobile-info-label">{item.label}</p>
                            <p class="mobile-info-desc">{item.description}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Menu popup -->
    {#if menuOpen}
        <div class="mobile-menu-popup">
            <a href="https://github.com/ayoubbenrezig/Firesong-Herald" target="_blank" rel="noopener noreferrer" class="mobile-menu-link">
                <GithubLogoIcon class="size-5" />
                <span>GitHub</span>
            </a>
            <a href="/privacy" class="mobile-menu-link">Privacy</a>
            <a href="/tos" class="mobile-menu-link">Terms</a>
            {#if !isInstalled}
                <button onclick={openInstallPrompt} class="mobile-menu-link">
                    <DownloadSimpleIcon class="size-5" />
                    <span>Add to Home Screen</span>
                </button>
            {/if}
        </div>
    {/if}

    <!-- User popup -->
    {#if userOpen && user}
        <div class="mobile-menu-popup">
            <div class="mobile-menu-link opacity-60 pointer-events-none text-xs">
                {user.globalName ?? user.username}
            </div>
            {#if isTester}
                <button onclick={() => { closeAll(); onThankYou(); }} class="mobile-menu-link">
                    <TestTubeIcon class="size-5" />
                    <span>You're a tester</span>
                </button>
                {#if botInviteUrl}
                    <a href={botInviteUrl} target="_blank" rel="noopener noreferrer" class="mobile-menu-link">
                        Add to Server
                    </a>
                {/if}
            {:else}
                <button onclick={() => { closeAll(); onBecomeTester(); }} class="mobile-menu-link">
                    Become a Tester
                </button>
            {/if}
            <a href="/logout" class="mobile-menu-link">
                <SignOutIcon class="size-5" />
                <span>Sign out</span>
            </a>
            <button onclick={handleDeleteAccount} class="mobile-menu-link text-error-500">
                <TrashIcon class="size-5" />
                <span>Delete account</span>
            </button>
        </div>
    {/if}

    <!-- Install prompt -->
    {#if installPrompt}
        <div class="mobile-info-popup">
            {#if installConfirm && isIos}
                <p class="mobile-info-title">How to add on iOS</p>
                <p class="mobile-info-desc mobile-info-desc--body">
                    Tap the <strong>Share</strong> button in Safari, then select <strong>Add to Home Screen</strong>. This adds Firesong Herald to your home screen for quick access.
                </p>
                <button onclick={closeInstallPrompt} class="mobile-install-btn">Got it</button>
            {:else}
                <p class="mobile-info-title">Add to Home Screen</p>
                <p class="mobile-info-desc mobile-info-desc--body">
                    This will add Firesong Herald to your home screen for quick access. Nothing will be installed beyond a shortcut. You can remove it at any time.
                </p>
                <div class="mobile-install-actions">
                    <button onclick={closeInstallPrompt} class="mobile-install-btn mobile-install-btn--cancel">Cancel</button>
                    <button onclick={confirmInstall} class="mobile-install-btn mobile-install-btn--confirm">Add to Home Screen</button>
                </div>
            {/if}
        </div>
    {/if}

    <!-- Bar -->
    <div class="mobile-bottom-inner">
        <a href="/" class="mobile-bar-btn" aria-label="Home">
            <HouseIcon class="size-6" />
        </a>

        {#if user && isTester}
            <a href="/app" class="mobile-bar-btn" aria-label="Dashboard">
                <SquaresFourIcon class="size-6" />
            </a>
        {:else}
            <button
                    type="button"
                    onclick={() => { closeAll(); user ? onBecomeTester() : onBecomeTester(); }}
                    class="mobile-bar-btn"
                    aria-label="Become a tester"
            >
                <SquaresFourIcon class="size-6 opacity-30" />
            </button>
        {/if}

        <button onclick={toggleInfo} class="mobile-bar-btn" aria-label="Navigation info">
            <InfoIcon class="size-6" />
        </button>

        {#if user}
            <button
                    type="button"
                    onclick={toggleUser}
                    class="mobile-bar-btn"
                    aria-label="Account"
                    aria-expanded={userOpen}
            >
                <img
                        src={avatarUrl(user.discordId, user.avatar)}
                        alt="{user.globalName ?? user.username}'s avatar"
                        class="size-6 rounded-full"
                />
            </button>
        {:else}
            <a href="/login" class="mobile-bar-btn" aria-label="Sign in">
                <UserCircleIcon class="size-6" />
            </a>
        {/if}

        <button onclick={toggleMenu} class="mobile-bar-btn" aria-label="More">
            <ListIcon class="size-6" />
        </button>
    </div>

</div>