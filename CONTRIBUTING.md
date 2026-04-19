# Contributing to Firesong Herald

Firesong Herald is an open-source Discord event management bot with a web dashboard, licenced under AGPL-3.0. Contributions are welcome.

Please read this document before opening issues or pull requests.

---

## Prerequisites

- Node.js 24+
- npm
- Docker and Docker Compose (for running the database and services locally)
- A Discord application and bot token for local testing

### Windows Users

If you see garbled characters in your terminal output, fix UTF-8 encoding in PowerShell permanently:

```powershell
New-Item -Path $PROFILE -ItemType File -Force
notepad $PROFILE
```

Add this line, save, and restart PowerShell:

```powershell
[console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding
```

---

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Copy `.env.example` to `.env` and fill in your local values
4. Install dependencies in each workspace:
   ```bash
   cd bot && npm install && cd ../api && npm install && cd ../db && npm install && cd ../dashboard && npm install && cd ..
   ```
5. Generate the Prisma client:
   ```bash
   cd db && npx prisma generate && cd ..
   ```
6. Start the stack:
   ```bash
   docker compose -f compose.dev.yml up --build
   ```

---

## Making Changes

- Create a branch following the naming convention in [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md)
- Commit your changes following the commit format in [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md)
- Keep changes focused — one issue per branch
- If your change introduces a user-facing addition, fix, or removal, add an entry to the `[Unreleased]` section of [CHANGELOG.md](./CHANGELOG.md) following the format defined in [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md)

---

## Opening a Pull Request

- Open a PR against `main`
- Use the PR title format from [GIT_CONVENTIONS.md](./GIT_CONVENTIONS.md)
- Include a short description of what the change does
- Link the related issue with `Closes #N` in the PR description
- Keep PRs small and focused where possible

---

## Code Style

- TypeScript throughout — no plain JavaScript
- Modular structure, separated by concern
- Named functions preferred over arrow functions for anything with real logic
- Follow the existing file and folder structure of the relevant workspace

---

## Reporting Bugs

Use the bug report issue template. Include steps to reproduce, expected behaviour, and actual behaviour.

## Requesting Features

Use the feature request issue template. Describe the problem you are trying to solve, not just the solution.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).