# Firesong Herald: Dashboard

SvelteKit web dashboard for Firesong Herald. Provides Discord OAuth2 authentication, a landing page, and the event management interface.

## Tech Stack

- SvelteKit 2, Svelte 5
- TypeScript (strict mode)
- Tailwind CSS v4
- Skeleton UI v4
- Phosphor Svelte icons
- Vite, adapter-node (Node.js server output)

## Development

From the `dashboard/` directory:

```bash
npm install
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Compile to production Node.js server
npm run check     # Type-check with svelte-check
npm run lint      # Prettier + ESLint
npm run format    # Auto-format with Prettier
npm test          # Run Vitest unit tests
```

Environment variables are read from `.env` in the project root. See the [project root](../) for the full variable reference.

## Production

In production, the dashboard is compiled to a Node.js server via `@sveltejs/adapter-node` and served behind the Caddy reverse proxy. See `compose.yml` and `Caddyfile` at the project root.

## Project Documentation

See the [project root](../) for setup instructions, contributing guidelines, and the full architecture overview.