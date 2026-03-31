# Firesong Herald

A Discord bot for event management — signups, RSVPs, reminders, and a live web dashboard.

## Setup

1. Clone the repository
```bash
git clone https://github.com/ayoubbenrezig/Firesong-Herald.git
cd Firesong-Herald
```

2. Create a `.env` file in the root directory
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name
POSTGRES_PORT=5432
DATABASE_URL=postgresql://your_db_user:your_db_password@db:5432/your_db_name
```

3. Start the stack
```bash
docker compose --profile bot up
```

## Features

- [ ] Event creation, editing, and deletion
- [ ] Repeating / recurring events
- [ ] Multiple RSVP options per event
- [ ] Discord OAuth2 dashboard
- [ ] Live sync via WebSockets

## License

MIT
