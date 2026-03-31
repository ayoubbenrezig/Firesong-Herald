# TypeScript Migration Guide

## What Changed?

The project has been migrated from JavaScript to **TypeScript throughout**. This affects both the bot and dashboard.

## What This Means For You

### Development Workflow

**Before (JavaScript):**
```bash
node bot/index.js
```

**After (TypeScript):**
```bash
# Development with hot reload
npm run dev  (in bot/ or dashboard/)

# Production
npm run build
npm start
```

### File Structure

- **Bot:** Code now lives in `bot/src/` as `.ts` files instead of root `index.js`
- **Dashboard:** Code in `dashboard/src/` with `.ts` and `.svelte` files
- **Compiled Output:** TypeScript compiles to `dist/` directory (git-ignored)

### Type Safety Across the Project

- **Prisma Types:** Auto-generated from schema, available in both bot and dashboard
- **API Communication:** Types shared between bot and dashboard via Prisma client
- **Discord.js Types:** Built-in types from `discord.js` package
- **Environment Variables:** Type-check with `dotenv`

### Development Tools

**Bot:**
- `tsc` - TypeScript compiler
- `tsx` - Run TypeScript directly for development
- `.ts` files only

**Dashboard:**
- `vite` - Build tool and dev server
- `@sveltejs/vite-plugin-svelte` - Svelte support
- `.ts` and `.svelte` files
- `vite.config.ts` - Vite configuration

### Configuration Files Added

- **`bot/tsconfig.json`** - Strict TypeScript settings for Node.js
- **`dashboard/tsconfig.json`** - Browser + DOM settings for Svelte
- **`dashboard/tsconfig.node.json`** - Vite config type checking
- **`dashboard/vite.config.ts`** - Build and dev server config

### Package.json Changes

Both services now include:
- `typescript` and `@types/node` in `devDependencies`
- Build/dev scripts
- Proper version numbering (`0.1.0-alpha`)

### Build & Run in Docker

Dockerfiles have been updated:
- **Bot:** `npm run build` → compiles TS → runs `dist/index.js`
- **Dashboard:** Multi-stage build (compile TypeScript, serve built assets)

## Why TypeScript?

1. **Type Safety** - Catch errors at development time, not runtime
2. **IntelliSense** - Better autocomplete and docs in your editor
3. **Refactoring Confidence** - Change code without breaking things silently
4. **Prisma Integration** - Auto-generated types from schema stay in sync
5. **Shared Types** - Bot and dashboard can import types from each other

## Next Steps

1. **Install dependencies:**
   ```bash
   cd bot && npm install && cd ../dashboard && npm install && cd ..
   ```

2. **Start developing:**
   ```bash
   # Bot (development)
   cd bot && npm run dev

   # Dashboard (development, in another terminal)
   cd dashboard && npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build  (in each service directory)
   ```

## Strict Mode Enabled

TypeScript is in **strict mode** in both services. This means:
- No implicit `any` types
- No unused variables or parameters
- Null/undefined safety enforced
- Function return types must be explicit

This is intentional — it catches bugs early and makes the codebase more maintainable.

## Prisma Schema Integration

When you create `prisma/schema.prisma`, both services will have access to Prisma-generated types:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const event = await prisma.event.findUnique({...});
// event is fully typed automatically
```

No manual type definitions needed — the schema generates them for you.

