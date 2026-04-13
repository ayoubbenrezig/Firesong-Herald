# Git Conventions

This file covers commit messages, branch naming, pull requests, and merge strategy for Firesong Herald.

---

## Commit Format

```
Type: description of what was done
```

## Types

| Type       | When to use                                   |
|------------|-----------------------------------------------|
| `Add`      | New feature or functionality                  |
| `Fix`      | Bug fix                                       |
| `Refactor` | Code restructuring without behavior change    |
| `Update`   | Modification to something existing            |
| `Cleanup`  | Code cleanup, reorganisation, formatting      |
| `Init`     | Initial setup of a tool, framework, or config |
| `Release`  | Version release marker                        |
| `Docs`     | Documentation changes                         |
| `Remove`   | Removing code, files, or dependencies         |

## Commit Rules

- Type is always PascalCase
- Always include the type prefix, no bare messages
- Description starts lowercase after the colon
- Description is past tense, not imperative (e.g. `implemented X`, not `implement X`)
- Keep the first line to one line where possible

## Closing Issues

When a commit resolves a GitHub issue, include it in the commit body:

```
Type: description of what was done

Closes #123
```

If the fix is partial or related:

```
Type: description of what was done

Related to #123
```

---

## Versioning

Release commits use the format:

```
Release vX.Y.Z
```

- `X` = major, `Y` = minor (new feature), `Z` = patch (bug fix)
- Stage suffix: `vX.Y.Z-alpha`, `vX.Y.Z-beta`, or `vX.Y.Z` for full release
- Version counter resets on stage change (e.g. `v0.4.0-alpha` -> `v0.1.0-beta`)

---

## Branch Naming

```
type/short-description
```

Prefixes match the work being done:

| Prefix      | When to use                  |
|-------------|------------------------------|
| `feature/`  | New feature or functionality |
| `fix/`      | Bug fix                      |
| `refactor/` | Code restructuring           |
| `docs/`     | Documentation changes        |
| `cleanup/`  | Cleanup or reorganisation    |
| `init/`     | Initial setup of something   |

Examples:

```
feature/event-creation
fix/rsvp-state-breakage
docs/community-guidelines
init/prisma-postgres
```

---

## Pull Requests

### When to open a PR

Open a PR when the change touches logic or project structure. Commit directly to main for purely cosmetic changes, typo fixes, or renames with no behaviour change.

### PR title

Match the commit format:

```
Type: description of what was done
```

### PR description

```
## What this does
Short description of the change.

## Related issues
Closes #N
```

### Merge strategy

Always squash and merge. Write the final commit message at merge time following the commit format above.

---

## Examples

```
Add: implemented user authentication with session handling
Fix: resolved encoding issue in HTML helper
Refactor: extracted redundant logic into shared utility
Update: extended login flow with inactive user checks
Cleanup: reorganised CSS and JS assets
Init: set up Prisma and PostgreSQL
Docs: added project overview and usage instructions
Remove: removed Composer and related development tools
Release v0.1.0-alpha
Release v0.1.0-beta
Release v1.0.0
```

---

## Changelog

Firesong Herald maintains a `CHANGELOG.md` in the project root.
Format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

### Category order

Always in this order. Skip any category with no entries.

1. `Added` — new features
2. `Changed` — changes to existing functionality
3. `Deprecated` — features to be removed in a future release
4. `Removed` — features removed in this release
5. `Fixed` — bug fixes
6. `Security` — security fixes or hardening

### Rules

- File name: `CHANGELOG.md` in the project root
- Most recent release at the top, oldest at the bottom
- Keep an `[Unreleased]` section at the top — add entries there as PRs are merged, move to a version section at release time
- Each entry is one line, written in past tense to match commit style
- Version headers link to the GitHub compare URL, defined at the bottom of the file
- Skip internal refactors and housekeeping unless they affect behaviour
- Never edit a released version's entries

### Version header format

```
## [v0.1.0-alpha] - 2026-04-13
```

### Footer links

At the bottom of `CHANGELOG.md`, maintain comparison links:

```
[Unreleased]: https://github.com/ayoubbenrezig/Firesong-Herald/compare/v0.1.0-alpha...HEAD
[v0.1.0-alpha]: https://github.com/ayoubbenrezig/Firesong-Herald/releases/tag/v0.1.0-alpha
```