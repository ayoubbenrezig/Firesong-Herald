# MVP Plan

**Project:** Discord Event Management Bot  
**Stage:** MVP Planning  
**Status:** Defined

---

## Tech Stack

| Layer | Technology |
|---|---|
| Bot | Node.js (discord.js) |
| Database | PostgreSQL |
| Backend API | PHP (Laravel) |
| Frontend Dashboard | SvelteKit |

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
