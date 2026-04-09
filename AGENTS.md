# AGENTS.md — Guidance for AI Coding Agents

## Project Overview

**Firesong Herald** is a Discord bot for event management with integrated PostgreSQL backend and future SvelteKit dashboard. Currently in **Alpha stage**, focusing entirely on the bot's core features. The project uses a unified Node.js + TypeScript stack across bot, API, and frontend layers.

### Architecture at a Glance

```
Discord Bot (Node.js + Discord.js)
    ↓ writes to
PostgreSQL (via Prisma ORM)
    ↓
Fastify API (REST + WebSockets) — planned
    ↓
SvelteKit Dashboard — planned for Beta
```

**Current Status:** Only the bot and database infrastructure are active. API and dashboard are scaffolded but not implemented.

---

## Critical Context for Agents

### Alpha Scope (Bot-Only, Current Phase)

The bot implements five core feature areas. Reference MVP.md and USER_FEEDBACK.md for the full consolidated feature list.

**Events:**
- Create, edit, delete with slash commands and modals
- Soft delete with grace period (no mass pings on permanent removal)
- Repeating/recurring events
- Tags for organising
- Auto-post to configured channel

**RSVPs:**
- Multiple RSVP options per event (e.g. "attendee", "volunteer")
- Admin can view and edit RSVPs
- Admin can remove individual RSVPs
- Ping attendees by name for reminders

**Admin & Reliability:**
- All interactions via Discord slash commands and modals
- Consistent, error-free responses — no repeated-click issues
- Basic audit log tracking who created/edited what and when

**Out of Scope for Alpha:** Auto-carry RSVP, role assignment on signup, roll call, attendance tracking, no-show tracking, personal schedule views. These are Beta or Full Release features.

### Tech Stack Rationale

| Layer | Tech | Why |
|---|---|---|
| Bot | Node.js + Discord.js | JavaScript-first, matches backend runtime |
| Database | PostgreSQL + Prisma ORM | Relational schema, auto-generated TypeScript types, zero-runtime-cost abstraction |
| Language | TypeScript throughout | Types everywhere, catches bugs at development time |
| Infrastructure | Docker Compose | db, bot, and dashboard (future) services with environment-based profiles |

**Key Decision:** Everything is Node.js. No language switching between bot and backend simplifies deployment and knowledge sharing.

---

## How to Build & Run

### Development Setup

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/ayoubbenrezig/Firesong-Herald.git
   cd Firesong-Herald
   npm install --workspaces  # Or: cd bot && npm install && cd ../dashboard && npm install
   ```

2. Create `.env` file in project root with Discord token and database credentials:
   ```env
   DISCORD_TOKEN=your_bot_token
   DISCORD_CLIENT_ID=your_client_id
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_DB=firesong_db
   POSTGRES_PORT=5432
   DATABASE_URL=postgresql://postgres:password@db:5432/firesong_db
   ```
   
   **Note:** The bot searches for `.env` in multiple locations (project root, working directory, parent) and logs which path it loads. See `bot/src/index.ts` for runtime validation logic.

3. **Development Mode (with auto-reload):**
   ```bash
   # Bot: Run from bot/ directory
   cd bot && npm run dev
   
   # Dashboard: Run from dashboard/ directory (separate terminal)
   cd dashboard && npm run dev
   ```

4. **Production Mode (Docker):**
   ```bash
   docker compose --profile bot up    # Start bot + database
   docker compose up db               # Start only database
   ```

**Container Architecture:**
- `db:` Always runs (no profile), persists to `db_data` volume
- `bot:` Profile `bot`, depends on `db`, runs `bot/Dockerfile`
- `dashboard:` Profile `dashboard` (not yet active), runs on port 3000

### Important Notes

- The bot's entry point is `bot/src/index.ts` (compiled to `dist/index.js` on build). The root `bot/index.js` is a legacy placeholder and should be ignored.
- Database `init.sql` is empty — schema will be created by Prisma migrations
- Dependencies are already defined: bot includes `discord.js`, `@prisma/client`, `dotenv`; dashboard includes Svelte, Vite, and `@prisma/client`
- For TypeScript setup details, migration patterns, and strict mode configuration, see `TYPESCRIPT_SETUP.md`

---

## Project Conventions & Patterns

### Commit Style (see GIT_CONVENTIONS.md)

Always use **PascalCase Type prefix** in commit messages:

```
Type: description of what was done
```

Types: `Add`, `Fix`, `Refactor`, `Update`, `Cleanup`, `Init`, `Release`, `Docs`, `Remove`

Examples:
- ✅ `Add: implemented event creation slash command`
- ✅ `Fix: resolved RSVP state breakage in repeating events`
- ❌ `add event creation` (wrong case, no type prefix)

When resolving issues, include in commit body: `Closes #123` or `Related to #123`.

**Versioning:** `vX.Y.Z-stage` (stage = alpha, beta, or omitted for full release). Version counter resets on stage change (e.g., `v0.4.0-alpha` → `v0.1.0-beta`).

**Branch Naming:** Use `type/short-description` (e.g., `feature/event-creation`, `fix/rsvp-state-breakage`, `docs/setup-guide`).

**PR Strategy:** Squash and merge always. Open PRs for logic/structure changes; commit cosmetic/typo fixes directly to main.

### TypeScript Development Pattern (See TYPESCRIPT_SETUP.md for details)

**Bot Development:**
- Code lives in `bot/src/` as `.ts` files (e.g., `bot/src/commands/event.ts`)
- Development: `npm run dev` from `bot/` directory (uses `tsx` for live reload)
- Building: `npm run build` compiles `src/**/*.ts` → `dist/` (git-ignored)
- Production: `npm start` runs `dist/index.js`
- TypeScript is in **strict mode** — no implicit `any`, unused vars, or unsafe nulls

**Dashboard Development:**
- Code in `dashboard/src/` with `.ts` and `.svelte` files
- Development: `npm run dev` from `dashboard/` (Vite dev server on localhost:5173)
- Building: `npm run build` outputs production-ready assets to `dist/`
- TypeScript strict mode applies here too — all errors must be fixed before compilation

**Type Safety:**
- Prisma auto-generates types from schema — always import from `@prisma/client` (never `any` types)
- Discord.js types come from the package — trust them, don't cast
- Environment variables: TypeScript won't catch `undefined` envs at compile time; check at runtime (see `bot/src/index.ts` example)

### Architecture & Code Organization

**Directory Structure:**
- `bot/` — Discord bot service entry point
- `dashboard/` — SvelteKit frontend (currently empty)
- `db/` — Database setup (init.sql, future Prisma migrations)
- `docs/` — Project documentation (currently unused)

**Service Isolation:**
Each service (bot, dashboard) is independently containerized. Database is the single source of truth accessed via Prisma ORM. No direct SQL calls in bot code — all queries go through Prisma generated types.

### Slash Commands Pattern (Expected)

Based on Discord.js and the bot's scope, slash commands are organized by feature domain:

**Directory Structure:**
```
bot/src/commands/
  ├── admin/      # Administrative commands (manage events, RSVPs, guild settings)
  ├── calendar/   # Calendar and event browsing commands
  ├── rsvp/       # RSVP and signup management commands
  ├── scheduling/ # Reminder and scheduling-related commands
  └── utility/    # General utility commands (ping, help, etc.)
```

**Implementation Pattern:**
Each command is a `.ts` file exporting a `SlashCommandBuilder` with handlers. Example structure:

```typescript
new SlashCommandBuilder()
  .setName("event")
  .setDescription("Manage events")
  .addSubcommand(sub => 
    sub.setName("create")
      .setDescription("Create a new event")
      .addStringOption(opt => opt.setName("title").setRequired(true))
  )
```

Modals handle multi-field input (event description, date, time, tags). Responses are non-ephemeral for audit trail visibility. Command handlers live in `bot/src/handlers/commandHandler.ts`.

### Database Access (Prisma Pattern)

When implementing features, use Prisma client:
```typescript
// Example
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const event = await prisma.event.create({
  data: { title, description, authorId }
});
```

No raw SQL. Prisma provides type safety and auto-migration support. Schema lives in `prisma/schema.prisma`. Generated types are output to `prisma/generated/prisma` (configured in schema's `generator client`). Always import types from `@prisma/client`.

---

## Integration Points & Dependencies

### Discord.js Integration

- Bot token read from `DISCORD_TOKEN` env var
- Events are posted to channels; bots must have `SEND_MESSAGES`, `ADD_REACTIONS` permissions
- RSVP tracking uses reactions or button components (UX choice pending)
- Audit log entries are Discord API interactions, stored in PostgreSQL for historical queries

### PostgreSQL & Prisma

- Connection string from `DATABASE_URL` env var
- All event, RSVP, and audit log data is relational
- Future WebSocket updates will push database changes from bot → dashboard via Fastify
- Prisma migrations are version-controlled; new features require new migrations

### Environment Variables

Every service reads `.env` at root. Required variables:
```
DISCORD_TOKEN, DISCORD_CLIENT_ID, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT, DATABASE_URL
```

**Environment Validation:** The bot validates `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` at startup (see `bot/src/index.ts`). If either is missing, startup fails with a clear error message. This prevents silent failures in production.

Dashboard and bot can have service-specific vars (not yet defined).

---

## Common Workflows & Gotchas

### Adding a New Event Feature

1. **Schema first:** Update `prisma/schema.prisma`, create migration
2. **Bot command:** Add slash command or modal in bot code
3. **Audit logging:** Every mutation logs to audit table with user ID, timestamp, action
4. **Testing:** Feature should work in isolation; test with multiple users and servers

**Gotcha:** The bot must not send mass pings on event deletion. Soft delete with grace period (e.g., 24 hours before permanent removal) is required per User A feedback.

### Managing the Database

- Volume `db_data` persists PostgreSQL state across container restarts
- To reset: `docker compose down -v` (removes volume)
- To inspect: `docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB`
- Migrations are applied on bot startup (Prisma `migrate deploy`)

### Repeating Events Complexity

User B and C flagged issues with repeating event RSVP state. The implementation must:
- Store recurrence rule in the event record (cron-like syntax or library)
- Track RSVP per *occurrence*, not per event definition
- Auto-carry RSVP only if user opts in (Beta feature)
- Prevent RSVP state from breaking when clicking reactions

---

## Files to Know

| File | Purpose |
|---|---|
| `MVP.md` | Defines Alpha scope, tech stack rationale, feature list by stage |
| `GIT_CONVENTIONS.md` | Commit message format and versioning rules |
| `TYPESCRIPT_SETUP.md` | TypeScript migration details, strict mode, dev/build workflow |
| `USER_FEEDBACK.md` | Consolidated requirements from community testers, pain points |
| `README.md` | Setup instructions and feature checklist |
| `compose.yml` | Service definitions (db, bot, dashboard) and profiles |
| `.env` | Runtime secrets (git-ignored, create locally) |

---

## Release Strategy & Versioning

- **Alpha (`v0.Y.Z-alpha`):** Closed testing, bot features only
- **Beta (`v0.Y.Z-beta`):** Wider testing, dashboard and extended features
- **Full Release (`vX.Y.Z`):** Public, production-ready

When promoting from Alpha → Beta, all bot Alpha features must be complete and tested. Dashboard and API become active.

---

## Questions to Ask Before Starting a Task

1. **Is this Alpha scope?** If it's auto-carry RSVP or personal schedule, it's Beta — defer.
2. **Does it require a database change?** Then you need a Prisma migration before bot code.
3. **Is it a user-facing command?** Ensure audit logging and non-ephemeral Discord responses.
4. **Have we seen this pain point before?** Check USER_FEEDBACK.md — it might already be a known issue or out-of-scope decision.

