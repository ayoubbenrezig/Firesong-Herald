# Contributing to Firesong Herald

Firesong Herald is an open-source Discord event management bot with a web dashboard, licensed under AGPL-3.0. Contributions are welcome.

Please read this document before opening issues or pull requests.

---

## Prerequisites

- Node.js 24+
- npm
- Docker and Docker Compose (for running the database locally)
- A Discord application and bot token for local testing

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies in each workspace:
   ```bash
   cd bot && npm install && cd ../db && npm install && cd ../dashboard && npm install && cd ..
   ```
4. Generate the Prisma client:
   ```bash
   cd db && npx prisma generate && cd ..
   ```
5. Copy `.env.example` to `.env` and fill in your local values
6. Start the database:
   ```bash
   docker compose up db
   ```

## Making Changes

- Create a branch following the naming convention in [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md)
- Commit your changes following the commit format in [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md)
- Keep changes focused — one issue per branch

## Opening a Pull Request

- Open a PR against `main`
- Use the PR title format from [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md)
- Include a short description of what the change does
- Link the related issue with `Closes #N` in the PR description
- Keep PRs small and focused where possible

## Code Style

- TypeScript throughout — no plain JavaScript
- Modular structure, separated by concern
- Named functions preferred over arrow functions for anything with real logic
- Follow the existing file and folder structure of the relevant workspace

## Reporting Bugs

Use the bug report issue template. Include steps to reproduce, expected behaviour, and actual behaviour.

## Requesting Features

Use the feature request issue template. Describe the problem you are trying to solve, not just the solution.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).