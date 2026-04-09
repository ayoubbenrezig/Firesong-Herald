export const THEMES = [
    { id: 'catppuccin', label: 'Catppuccin', emoji: '🐈' },
    { id: 'modern', label: 'Modern', emoji: '🌸' },
    { id: 'vox', label: 'Vox', emoji: '👾' },
    { id: 'nosh', label: 'Nosh', emoji: '🥙' },
    { id: 'rose', label: 'Rose', emoji: '🌷' },
    { id: 'pine', label: 'Pine', emoji: '🌲' },
    { id: 'vintage', label: 'Vintage', emoji: '📺' },
    { id: 'fennec', label: 'Fennec', emoji: '🦊' }
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

export function getTheme(): ThemeId {
    try {
        const saved = localStorage.getItem('theme');
        const valid = THEMES.find((t) => t.id === saved);
        return valid ? valid.id : 'catppuccin';
    } catch {
        return 'catppuccin';
    }
}

export function setTheme(id: ThemeId): void {
    try {
        document.documentElement.setAttribute('data-theme', id);
        localStorage.setItem('theme', id);
    } catch {
        console.error('Failed to persist theme:', id);
    }
}

export function previewTheme(id: ThemeId): void {
    try {
        document.documentElement.setAttribute('data-theme', id);
    } catch {
        console.error('Failed to preview theme:', id);
    }
}