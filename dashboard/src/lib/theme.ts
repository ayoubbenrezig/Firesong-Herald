// Available colour schemes with display labels and emojis
export const THEMES = [
    { id: 'catppuccin', label: 'Catppuccin', emoji: '🐈' },
    { id: 'cerberus',   label: 'Cerberus',   emoji: '🐺' },
    { id: 'concord',    label: 'Concord',    emoji: '🚇' },
    { id: 'crimson',    label: 'Crimson',    emoji: '🔴' },
    { id: 'fennec',     label: 'Fennec',     emoji: '🦊' },
    { id: 'hamlindigo', label: 'Hamlindigo', emoji: '👖' },
    { id: 'legacy',     label: 'Legacy',     emoji: '💀' },
    { id: 'mint',       label: 'Mint',       emoji: '🍃' },
    { id: 'modern',     label: 'Modern',     emoji: '🌸' },
    { id: 'mona',       label: 'Mona',       emoji: '🧑' },
    { id: 'nosh',       label: 'Nosh',       emoji: '🥙' },
    { id: 'nouveau',    label: 'Nouveau',    emoji: '👑' },
    { id: 'pine',       label: 'Pine',       emoji: '🌲' },
    { id: 'reign',      label: 'Reign',      emoji: '🟨' },
    { id: 'rocket',     label: 'Rocket',     emoji: '🚀' },
    { id: 'rose',       label: 'Rose',       emoji: '🌷' },
    { id: 'sahara',     label: 'Sahara',     emoji: '🏜️' },
    { id: 'seafoam',    label: 'Seafoam',    emoji: '🐡' },
    { id: 'terminus',   label: 'Terminus',   emoji: '🟣' },
    { id: 'vintage',    label: 'Vintage',    emoji: '📺' },
    { id: 'vox',        label: 'Vox',        emoji: '👾' },
    { id: 'wintry',     label: 'Wintry',     emoji: '☁️' },
] as const;

// Theme identifier type derived from THEMES array
export type ThemeId = (typeof THEMES)[number]['id'];

// Retrieve the user's saved theme preference from localStorage, defaulting to Catppuccin
export function getTheme(): ThemeId {
    try {
        const saved = localStorage.getItem('theme');
        const valid = THEMES.find((t) => t.id === saved);
        return valid ? valid.id : 'catppuccin';
    } catch {
        return 'catppuccin';
    }
}

// Apply and persist a theme to localStorage
export function setTheme(id: ThemeId): void {
    try {
        document.documentElement.setAttribute('data-theme', id);
        localStorage.setItem('theme', id);
    } catch {
        console.error('Failed to persist theme:', id);
    }
}

// Temporarily apply a theme without saving to localStorage
export function previewTheme(id: ThemeId): void {
    try {
        document.documentElement.setAttribute('data-theme', id);
    } catch {
        console.error('Failed to preview theme:', id);
    }
}