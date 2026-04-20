// $lib/mode.svelte.ts

const modeState = $state({ dark: false });

export function initMode(): void {
    try {
        const stored = localStorage.getItem('mode');
        let mode: 'light' | 'dark';

        if (stored === 'light' || stored === 'dark') {
            // User has an explicit saved preference
            mode = stored;
        } else {
            // First visit — use system preference
            mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        modeState.dark = mode === 'dark';
        document.documentElement.setAttribute('data-mode', mode);
    } catch {
        console.error('Failed to init mode');
    }
}

export function toggleMode(): void {
    try {
        modeState.dark = !modeState.dark;
        const next = modeState.dark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-mode', next);
        localStorage.setItem('mode', next);
    } catch {
        console.error('Failed to toggle mode');
    }
}

export function isDark(): boolean {
    return modeState.dark;
}