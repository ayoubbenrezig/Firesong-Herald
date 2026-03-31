# MVP Plan

**Project:** Discord Event Management Bot
**Stage:** MVP Planning
**Status:** Defined

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Bot | Node.js + Discord.js | Bot is already Node, stays one language |
| Backend API | Node.js + Fastify | Lightweight, fast, same runtime as bot |
| Database | PostgreSQL | Relational data, signups, events, roles all have relationships |
| ORM | Prisma | Translates JS to SQL, auto-generates types from DB schema |
| Frontend | SvelteKit | Compiles to vanilla JS, no runtime overhead, file-based routing |
| Language | TypeScript throughout | Types everywhere, catches bugs at write time, zero runtime cost |
| Real-time | WebSockets inside Fastify | Live sync between Discord and dashboard |

---

## How It All Connects

```
Discord Bot
    ↓ writes to
PostgreSQL (via Prisma)
    ↓
Fastify
  ├── REST API     → handles requests
  └── WebSockets   → pushes live updates
        ↓
SvelteKit Dashboard
```

---

## Release Stages

| Stage | Audience |
|---|---|
| Alpha | Closed, test community only |
| Beta | Wider testing, more stable |
| Full Release | Public, ready to sell or publish |

---

## Scope

The Alpha release focuses entirely on the bot. The dashboard is planned for a later cycle once the bot is stable and the data layer is proven. The database is included from day one so the dashboard can be added without rearchitecting anything.

---

## Alpha Features

### Events
- [ ] Create an event (title, description, date, time, tags)
- [ ] Edit an event
- [ ] Delete an event with soft delete, grace period before permanent removal, no mass pings on delete
- [ ] Repeating / recurring events
- [ ] Tags / categories
- [ ] Auto-post event to a configured channel on creation

### RSVPs
- [ ] Multiple RSVP options per event (e.g. attendee, volunteer)
- [ ] Admin can view all RSVPs for an event
- [ ] Admin can edit or remove individual RSVPs
- [ ] Ping attendees by name for event reminders

### Admin & Reliability
- [ ] Basic audit log, tracking who created or edited what and when
- [ ] All interactions via Discord slash commands and modals
- [ ] Consistent, error-free responses, no repeated-click issues

---

## Out of Scope for Alpha

These are confirmed for later cycles.

### Beta
- Auto-carry RSVP for repeating events
- Auto-delete post after event ends
- Roll call / attendance marking
- No-show tracking and data export
- Direct image attachments
- Text formatting in event posts
- Role-based daily pings
- Daily auto-post with upcoming events

### Full Release
- Role grouping, conditional sign-up logic
- Assign / remove Discord roles on sign-up
- Restrict events by role
- Restrict repeat no-shows to limited roles
- Personal weekly schedule view
- Discord calendar integration
- SvelteKit dashboard (requires Discord OAuth, PostgreSQL already in place)
- Mobile experience improvements
- Cross-server event view
- External announcement system integration
- Host profiles

---

## Signup Flow (Dashboard)

The embed has two buttons:

- **Button 1** — sign up directly in Discord. Bot already has the user ID from the interaction, zero friction, no auth needed.
- **Button 2** — opens browser UI. Much cleaner experience. Discord OAuth2 identifies them once, session persists, they see their events, signups, everything.

Both write to the same DB. Both sync back to the Discord embed instantly via WebSocket.

---

## Authentication

- Discord OAuth2 — user logs in with Discord once, never again
- Fastify issues a JWT session token, stored in browser
- No passwords, no separate account system — Discord IS the identity layer
- Owner ID checked live against Discord API, never stored
- Admin and mod role IDs stored in `server_settings`, checked against user's Discord roles on every request

---

## Role System

```
owner   → checked live via Discord API
admin   → has the designated admin_role_id
mod     → has the designated mod_role_id
member  → everyone else, default, no row needed
```

Per server, completely isolated by `server_id`. Owner designates which Discord role IDs map to admin and mod. Dynamic — changes any time.

---

## Database Structure

One DB, isolated by `server_id`. No cross-server data leakage ever.

```
servers           → server_id, discord_server_id, name
server_settings   → server_id, admin_role_id, mod_role_id, missing_permissions
events            → id, server_id, name, date, ...
signups           → event_id, discord_user_id, expires_at
```

---

## Permission Handling

On bot join and on dashboard load — fetch bot's current permissions, compare against required list, map to human-readable descriptions, store in `server_settings`, display on dashboard with clear explanation of what breaks without each permission. WebSocket pushes updates instantly if something changes.

---

## Build Order

1. DB schema in Prisma
2. Discord OAuth2 auth
3. Permission fetch and mapping
4. Events and signups API
5. WebSocket layer
6. SvelteKit dashboard on top

---

## Deployment

Domain → DNS A record → VPS IP → Nginx reverse proxy → Fastify API + Svelte static files. SSL via Certbot, free, auto-renews. Platforms like Railway or Render handle all of that automatically if you don't want to touch server config manually.

---

## Development Workflow

Each cycle follows this pattern:

1. Plan features for the cycle
2. Build
3. Test (dev bot, private test server)
4. Deploy (prod bot)
5. Collect feedback
6. Repeat

---

*This is a living document. At the start of each cycle, tick completed items, move features from the next stage into the active build list, and commit the change to Git.*
