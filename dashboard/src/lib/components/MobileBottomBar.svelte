<script lang="ts">
    import {
        HouseIcon,
        SquaresFourIcon,
        UserCircleIcon,
        InfoIcon,
        ListIcon,
        GithubLogoIcon,
    } from 'phosphor-svelte';

    let menuOpen = $state(false);
    let infoOpen = $state(false);

    function toggleMenu(): void {
        infoOpen = false;
        menuOpen = !menuOpen;
    }

    function toggleInfo(): void {
        menuOpen = false;
        infoOpen = !infoOpen;
    }

    const navItems = [
        { icon: HouseIcon, label: 'Home', description: 'Return to the landing page.' },
        { icon: SquaresFourIcon, label: 'Dashboard', description: 'Open the web dashboard.' },
        { icon: UserCircleIcon, label: 'Sign in', description: 'Sign in to your account.' },
        { icon: ListIcon, label: 'More', description: 'Opens GitHub, Privacy, and Terms links.' },
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