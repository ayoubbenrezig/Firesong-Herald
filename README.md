# Firesong Herald

A Discord bot for event management — signups, RSVPs, reminders, and a live web dashboard.

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

2. Create a `.env` file in the root directory
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=firesong_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:password@db:5432/firesong_db
API_PORT=3001
API_HOST=0.0.0.0
DASHBOARD_URL=http://localhost:5173
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
# Database only
docker compose up db

# Full stack (database + bot)
docker compose --profile bot up
```

6. Start the API (separate terminal)
```bash
cd api && npm run dev
```

## Alpha Features

### Events
- [ ] Create, edit, delete events with slash commands and modals
- [ ] Soft delete with grace period
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