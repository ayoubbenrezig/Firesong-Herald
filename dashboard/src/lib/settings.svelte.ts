// Global state for the settings modal.
// Import openSettings() from anywhere to trigger it.

const settingsState = $state({ open: false });

export function openSettings(): void {
    settingsState.open = true;
}

export function closeSettings(): void {
    settingsState.open = false;
}

export function isSettingsOpen(): boolean {
    return settingsState.open;
}