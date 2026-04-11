# TypeScript Setup Guide

## Overview

The project uses TypeScript throughout — bot, API, and dashboard. This document covers the setup, conventions, and key decisions made across the stack.

---

## Workspaces

| Workspace | Path | Runtime |
|---|---|---|
| Bot | `bot/` | Node.js + tsx (dev), tsc (prod) |
| Database | `db/` | Prisma CLI only |
| Dashboard | `dashboard/` | SvelteKit + Vite |

Each workspace has its own `package.json`, `tsconfig.json`, and `node_modules`.

---

## Development Workflow

**Bot:**
```bash
cd bot
npm run dev    # runs tsx src/index.ts with hot reload
npm run build  # compiles to dist/
npm start      # runs dist/index.js
npm test       # runs Vitest
```

**Dashboard:**
```bash
cd dashboard
npm run dev    # Vite dev server
npm run build  # compiles to static assets
```

---

## File Structure

```
bot/
  src/
    commands/       # slash commands by category
    handlers/       # Discord.js event and command loaders
    services/       # database and business logic
    utils/          # shared utilities (logger, etc.)
    index.ts        # entry point
  tests/            # Vitest unit tests
  tsconfig.json
  vitest.config.ts

db/
  prisma/
    schema.prisma   # database schema
  generated/
    prisma/         # auto-generated Prisma client
  prisma.config.ts  # Prisma 7 config (datasource URL)

dashboard/
  src/
    ...             # SvelteKit pages and components
```

---

## TypeScript Configuration

Both bot and dashboard use strict mode:

- No implicit `any`
- No unused variables or parameters
- Null/undefined safety enforced
- `moduleResolution: bundler` — works with tsx and Vite without requiring file extensions on imports

`bot/tsconfig.json` sets `rootDir: ..` to allow imports from `db/generated/prisma/` across workspace boundaries.

---

## Prisma Integration

Prisma 7 generates the client to a custom output path. Import from the generated path — not from `@prisma/client`:

```typescript
import { PrismaClient } from '../../db/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
```

Prisma 7 requires a driver adapter — `PrismaPg` is used for PostgreSQL. Calling `new PrismaClient()` without an adapter will throw at runtime.

After any schema change, regenerate the client:

```bash
cd db && npx prisma generate
```

---

## Logging

All logging goes through the centralised Pino logger — never use `console.*` directly:

```typescript
import { logger } from '../utils/logger';

logger.info('Bot started');
logger.error({ err: error }, 'Failed to create event');
```

In development, logs are pretty-printed with colour. In production, logs are compact JSON.

---

## Testing

Tests use Vitest with `vitest-mock-extended` for mocking Prisma. The config lives at `bot/vitest.config.ts` and tests live in `bot/src/tests/`.

Run tests:
```bash
cd bot && npm test
```

---

## Strict Mode

TypeScript strict mode is enabled in all workspaces. This means:

- No implicit `any` types
- No unused variables or parameters
- Null/undefined safety enforced
- Function return types checked

This is intentional — it catches bugs early and keeps the codebase maintainable.