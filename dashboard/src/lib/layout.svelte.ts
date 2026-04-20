const BREAKPOINT = 1024;

function createLayoutState() {
    let isMobile = $state(false);
    let mobileOpen = $state(false);
    let expanded = $state(true);

    function init(): () => void {
        try {
            const savedExpanded = localStorage.getItem('sidebarExpanded');
            if (savedExpanded !== null) expanded = savedExpanded === 'true';
        } catch {
            console.error('Failed to restore layout state');
        }

        function handleResize(): void {
            isMobile = window.innerWidth < BREAKPOINT;
            if (!isMobile) mobileOpen = false;
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }

    function setExpanded(value: boolean): void {
        expanded = value;
        try {
            localStorage.setItem('sidebarExpanded', String(value));
        } catch {
            console.error('Failed to persist sidebar expanded state');
        }
    }

    function toggleMobileOpen(): void {
        mobileOpen = !mobileOpen;
    }

    function closeMobile(): void {
        mobileOpen = false;
    }

    return {
        get isMobile() { return isMobile; },
        get mobileOpen() { return mobileOpen; },
        get expanded() { return expanded; },
        init,
        setExpanded,
        toggleMobileOpen,
        closeMobile
    };
}

export const layout = createLayoutState();