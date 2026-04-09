<script lang="ts">
    import { Avatar, Switch } from '@skeletonlabs/skeleton-svelte';

    let checked = $state(false);
</script>

<div class="p-8 space-y-6">
    <h1 class="h1">Firesong Herald</h1>

    <div class="card p-4 space-y-2">
        <p class="font-bold">Card component</p>
        <p class="text-surface-400">This is a Skeleton card.</p>
    </div>

    <div class="flex gap-4">
        <button class="btn preset-filled-primary-500">Primary Button</button>
        <button class="btn preset-outlined-primary-500">Outlined Button</button>
    </div>

    <div class="flex items-center gap-4">
        <Switch checked={checked} onCheckedChange={(e) => (checked = e.checked)}>
            <Switch.Control>
                <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>Toggle is {checked ? 'on' : 'off'}</Switch.Label>
            <Switch.HiddenInput />
        </Switch>
    </div>

    <Avatar>
        <Avatar.Image src="https://i.pravatar.cc/150?img=48" alt="avatar" />
        <Avatar.Fallback>SK</Avatar.Fallback>
    </Avatar>

    <div class="flex gap-2">
        <span class="badge preset-filled-success-500">Success</span>
        <span class="badge preset-filled-error-500">Error</span>
    </div>
</div>