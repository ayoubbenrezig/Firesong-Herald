// $lib/mode.svelte.ts

const modeState = $state({ dark: false });

export function initMode(): void {
    try {
        const stored = localStorage.getItem('mode') ?? 'light';
        modeState.dark = stored === 'dark';
        document.documentElement.setAttribute('data-mode', stored);
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