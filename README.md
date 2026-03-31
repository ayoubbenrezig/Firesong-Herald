# Firesong Herald

A Discord bot for event management — signups, RSVPs, reminders, and a live web dashboard.

## Setup

### Prerequisites
- Node.js 24+ (or use Docker)
- PostgreSQL 18+ (or Docker Compose)
- Discord bot token and Client ID

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/ayoubbenrezig/Firesong-Herald.git
cd Firesong-Herald
```

2. Create a `.env` file in the root directory
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=firesong_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:password@db:5432/firesong_db
```

3. Install dependencies
```bash
cd bot && npm install && cd ../dashboard && npm install && cd ..
```

4. Start the stack
```bash
# Full stack (database + bot)
docker compose --profile bot up

# Database only
docker compose up db
```

## Alpha Features

### Events
- [ ] Create, edit, delete events with slash commands and modals
- [ ] Soft delete with grace period (no mass pings)
- [ ] Repeating / recurring events
- [ ] Tags for organization
- [ ] Auto-post to configured channel

### RSVPs
- [ ] Multiple RSVP options per event (e.g. attendee, volunteer)
- [ ] Admin view and edit of RSVPs
- [ ] Admin remove individual RSVPs
- [ ] Ping attendees by name for reminders

### Admin & Reliability
- [ ] All interactions via Discord slash commands and modals
- [ ] Consistent, error-free responses
- [ ] Basic audit log tracking

### Dashboard (Alpha)
- [ ] Discord OAuth2 authentication
- [ ] Event management UI
- [ ] RSVP management interface
- [ ] Live sync via WebSockets

## Roadmap

**Beta:**
- Auto-carry RSVP for repeating events
- Roll call / attendance marking
- No-show tracking
- Personal schedule views

**Full Release:**
- Role grouping and conditional sign-up logic
- Discord role assignment on sign-up
- Event restrictions by role
- Cross-server event views

## License

AGPL-3.0 license
