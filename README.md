# Firesong Herald

A Discord bot for event management: signups, RSVPs, reminders, and a live web dashboard.

## Setup

### Prerequisites
- Node.js 24+ (or use Docker)
- PostgreSQL 18+ (or Docker Compose)
- Discord bot token and Client ID

### Windows Users

If you are on Windows and see garbled characters in your terminal output, run the following in PowerShell to fix UTF-8 encoding:

```powershell
[console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding
```

To make this permanent, add the line to your PowerShell profile:

```powershell
New-Item -Path $PROFILE -ItemType File -Force
notepad $PROFILE
```

Paste the line above, save, and restart PowerShell.

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/ayoubbenrezig/Firesong-Herald.git
cd Firesong-Herald
```

2. Copy `.env.example` to `.env` and fill in your values
```bash
cp .env.example .env
```

Required variables:
```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_dev_guild_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3001/auth/discord/callback
JWT_SECRET=your_jwt_secret_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=firesong_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:password@db:5432/firesong_db
API_PORT=3001
API_HOST=0.0.0.0
DASHBOARD_URL=http://localhost:5173
BOT_INVITE_URL=your_bot_invite_url_here
```

3. Install dependencies
```bash
cd bot && npm install && cd ../api && npm install && cd ../db && npm install && cd ../dashboard && npm install && cd ..
```

4. Generate the Prisma client
```bash
cd db && npx prisma generate && cd ..
```

5. Start the stack
```bash
docker compose -f compose.dev.yml up --build
```

Runs all services (db, bot, api, dashboard) with watch mode. Services rebuild when source files change.

### Production

```bash
docker compose up --build
```

## Alpha Features

### Events
- [x] Create events via slash command and modal
- [ ] Edit an event
- [ ] Delete an event with soft delete and grace period
- [ ] Repeating / recurring events
- [ ] Tags for organization
- [ ] Auto-post to configured channel

### RSVPs
- [ ] Multiple RSVP options per event
- [ ] Admin view and edit of RSVPs
- [ ] Admin remove individual RSVPs
- [ ] Ping attendees by name for reminders

### Admin & Reliability
- [ ] All interactions via Discord slash commands and modals
- [ ] Consistent, error-free responses
- [ ] Basic audit log tracking

### Dashboard (Alpha)
- [x] Landing page with Discord OAuth2 sign-in
- [x] Tester access gating
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

## Contributing

Contributions are welcome. Please read the following before opening issues or pull requests:

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Git Conventions](./GIT_CONVENTIONS.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

To report a bug, use the [bug report template](/.github/ISSUE_TEMPLATE/bug_report.md). To suggest a feature, use the [feature request template](/.github/ISSUE_TEMPLATE/feature_request.md).

## Contact

For general enquiries or conduct reports, reach out at contact@firesongherald.com.

## License

[AGPL-3.0](./LICENSE)