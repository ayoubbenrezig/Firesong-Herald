// Available colour schemes with display labels, emojis, and primary swatch colours
export const THEMES = [
    { id: 'catppuccin', label: 'Catppuccin', emoji: '🐈', swatch: '#8caaee' },
    { id: 'cerberus',   label: 'Cerberus',   emoji: '🐺', swatch: '#2563eb' },
    { id: 'concord',    label: 'Concord',    emoji: '🚇', swatch: '#7c3aed' },
    { id: 'crimson',    label: 'Crimson',    emoji: '🌹', swatch: '#dc2626' },
    { id: 'fennec',     label: 'Fennec',     emoji: '🦊', swatch: '#ea580c' },
    { id: 'hamlindigo', label: 'Hamlindigo', emoji: '👖', swatch: '#4f46e5' },
    { id: 'legacy',     label: 'Legacy',     emoji: '💀', swatch: '#6b7280' },
    { id: 'mint',       label: 'Mint',       emoji: '🍃', swatch: '#16a34a' },
    { id: 'modern',     label: 'Modern',     emoji: '🌸', swatch: '#db2777' },
    { id: 'mona',       label: 'Mona',       emoji: '🧑', swatch: '#0891b2' },
    { id: 'nosh',       label: 'Nosh',       emoji: '🥙', swatch: '#b45309' },
    { id: 'nouveau',    label: 'Nouveau',    emoji: '👑', swatch: '#9333ea' },
    { id: 'pine',       label: 'Pine',       emoji: '🌲', swatch: '#15803d' },
    { id: 'reign',      label: 'Reign',      emoji: '🟨', swatch: '#ca8a04' },
    { id: 'rocket',     label: 'Rocket',     emoji: '🚀', swatch: '#2563eb' },
    { id: 'rose',       label: 'Rose',       emoji: '🌷', swatch: '#e11d48' },
    { id: 'sahara',     label: 'Sahara',     emoji: '🏜️', swatch: '#d97706' },
    { id: 'seafoam',    label: 'Seafoam',    emoji: '🐡', swatch: '#0d9488' },
    { id: 'terminus',   label: 'Terminus',   emoji: '🔮', swatch: '#7c3aed' },
    { id: 'vintage',    label: 'Vintage',    emoji: '📺', swatch: '#92400e' },
    { id: 'vox',        label: 'Vox',        emoji: '👾', swatch: '#4ade80' },
    { id: 'wintry',     label: 'Wintry',     emoji: '☁️', swatch: '#38bdf8' },
] as const;

// Theme identifier type derived from THEMES array
export type ThemeId = (typeof THEMES)[number]['id'];

// ── Reactive state ────────────────────────────────────────────────────────────

const themeState = $state({ current: 'catppuccin' as ThemeId });

export function getCurrentTheme(): ThemeId {
    return themeState.current;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

/** Reads theme from localStorage and applies it. Call once on app mount. */
export function initTheme(): void {
    try {
        const saved = localStorage.getItem('theme');
        const valid = THEMES.find((t) => t.id === saved);
        const id: ThemeId = valid ? valid.id : 'catppuccin';
        themeState.current = id;
        document.documentElement.setAttribute('data-theme', id);
    } catch {
        console.error('Failed to init theme');
    }
}

// ── Actions ───────────────────────────────────────────────────────────────────

/** Previews a theme visually without persisting it. */
export function previewTheme(id: ThemeId): void {
    try {
        document.documentElement.setAttribute('data-theme', id);
    } catch {
        console.error('Failed to preview theme:', id);
    }
}

/** Applies and persists a theme to localStorage. */
export function setTheme(id: ThemeId): void {
    try {
        themeState.current = id;
        document.documentElement.setAttribute('data-theme', id);
        localStorage.setItem('theme', id);
    } catch {
        console.error('Failed to persist theme:', id);
    }
}