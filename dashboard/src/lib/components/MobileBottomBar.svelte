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
    } from 'phosphor-svelte';

    let menuOpen = $state(false);
    let infoOpen = $state(false);
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

    function toggleMenu(): void {
        infoOpen = false;
        installPrompt = false;
        menuOpen = !menuOpen;
    }

    function toggleInfo(): void {
        menuOpen = false;
        installPrompt = false;
        infoOpen = !infoOpen;
    }

    function openInstallPrompt(): void {
        menuOpen = false;
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

    const navItems = [
        { icon: HouseIcon, label: 'Home', description: 'Return to the landing page.' },
        { icon: SquaresFourIcon, label: 'Dashboard', description: 'Open the web dashboard.' },
        { icon: UserCircleIcon, label: 'Sign in', description: 'Sign in to your account.' },
        { icon: ListIcon, label: 'More', description: 'Opens GitHub, Privacy, and Terms links.' },
        ...(!isInstalled ? [{ icon: DownloadSimpleIcon, label: 'Add to Home Screen', description: 'Found in the menu (≡).\nAdds Firesong Herald to your home screen for quick access.' }] : []),
    ];
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
        <a href="/app" class="mobile-bar-btn" aria-label="Dashboard">
            <SquaresFourIcon class="size-6" />
        </a>
        <button onclick={toggleInfo} class="mobile-bar-btn" aria-label="Navigation info">
            <InfoIcon class="size-6" />
        </button>
        <a href="/login" class="mobile-bar-btn" aria-label="Sign in">
            <UserCircleIcon class="size-6" />
        </a>
        <button onclick={toggleMenu} class="mobile-bar-btn" aria-label="More">
            <ListIcon class="size-6" />
        </button>
    </div>

</div>