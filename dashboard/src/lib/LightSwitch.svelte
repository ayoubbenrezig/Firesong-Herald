<script lang="ts">
    export function setMode(mode: 'light' | 'dark'): void {
        document.documentElement.setAttribute('data-mode', mode);
        localStorage.setItem('mode', mode);
    }

    export function toggleMode(): void {
        const current = localStorage.getItem('mode') ?? 'light';
        setMode(current === 'dark' ? 'light' : 'dark');
    }
</script>