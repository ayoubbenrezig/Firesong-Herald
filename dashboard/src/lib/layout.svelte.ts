const BREAKPOINT = 1024;
const SWIPE_EDGE_THRESHOLD = 30;   // px from left edge to start swipe
const SWIPE_MIN_DISTANCE   = 60;   // px minimum horizontal travel
const SWIPE_AXIS_RATIO     = 2;    // horizontal must be 2× vertical to count

function createLayoutState() {
    let isMobile   = $state(false);
    let mobileOpen = $state(false);
    let expanded   = $state(true);

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

        // ── Swipe-to-open gesture ─────────────────────────────────────────────
        let touchStartX = 0;
        let touchStartY = 0;

        function handleTouchStart(e: TouchEvent): void {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }

        function handleTouchEnd(e: TouchEvent): void {
            if (!isMobile || mobileOpen) return;

            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);

            const startedAtEdge = touchStartX <= SWIPE_EDGE_THRESHOLD;
            const movedEnough   = dx >= SWIPE_MIN_DISTANCE;
            const clearlyHoriz  = dx > dy * SWIPE_AXIS_RATIO;

            if (startedAtEdge && movedEnough && clearlyHoriz) {
                mobileOpen = true;
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend',   handleTouchEnd,   { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend',   handleTouchEnd);
        };
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
        get isMobile()   { return isMobile;   },
        get mobileOpen() { return mobileOpen; },
        get expanded()   { return expanded;   },
        init,
        setExpanded,
        toggleMobileOpen,
        closeMobile,
    };
}

export const layout = createLayoutState();