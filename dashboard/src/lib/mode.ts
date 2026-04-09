export function setMode(mode: 'light' | 'dark'): void {
    try {
        document.documentElement.setAttribute('data-mode', mode);
        localStorage.setItem('mode', mode);
    } catch {
        console.error('Failed to persist mode:', mode);
    }
}

export function toggleMode(): void {
    try {
        const current = localStorage.getItem('mode') ?? 'light';
        setMode(current === 'dark' ? 'light' : 'dark');
    } catch {
        console.error('Failed to toggle mode');
    }
}