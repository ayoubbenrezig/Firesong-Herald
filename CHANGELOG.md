# Changelog

All notable changes to Firesong Herald will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [v0.1.0-alpha] - 2026-04-13

### Added

- Production server provisioned on Hetzner CPX22 with Ubuntu 24.04
- Domain configured with Cloudflare DNS and automatic HTTPS via Caddy
- Docker Compose setup for bot, API, dashboard, database, and reverse proxy
- Dockerfiles for bot, API, and dashboard with multi-stage builds
- Caddy reverse proxy with HSTS, X-Frame-Options, and Referrer-Policy headers
- Prisma schema for all core tables: servers, server roles, events, RSVP options, signups, users, audit logs, event recurrence, event alerts, calendars
- Fastify API scaffold with Discord OAuth2, JWT session handling, health route, and structured logging via Pino
- SvelteKit dashboard scaffold with Skeleton UI, Tailwind CSS, and adapter-node for production
- Discord bot scaffold with modular TypeScript/ESM architecture, dynamic event loader, and slash command deployment
- TypeDoc documentation generation

[Unreleased]: https://github.com/ayoubbenrezig/Firesong-Herald/compare/v0.1.0-alpha...HEAD
[v0.1.0-alpha]: https://github.com/ayoubbenrezig/Firesong-Herald/releases/tag/v0.1.0-alpha