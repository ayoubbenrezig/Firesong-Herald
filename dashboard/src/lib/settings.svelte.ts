// Global state for the settings modal.
// Import openSettings() from anywhere to trigger it.

import { layout } from '$lib/layout.svelte';

const settingsState = $state({ open: false });

export function openSettings(): void {
    layout.closeMobile();
    settingsState.open = true;
}

export function closeSettings(): void {
    settingsState.open = false;
}

export function isSettingsOpen(): boolean {
    return settingsState.open;
}