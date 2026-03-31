# Commit Style Guide

## Format

```
Type: description of what was done
```

## Types

| Type | When to use |
|---|---|
| `Add` | New feature or functionality |
| `Fix` | Bug fix |
| `Refactor` | Code restructuring without behavior change |
| `Update` | Modification to something existing |
| `Cleanup` | Code cleanup, reorganisation, formatting |
| `Init` | Initial setup of a tool, framework, or config |
| `Release` | Version release marker |
| `Docs` | Documentation changes |
| `Remove` | Removing code, files, or dependencies |

## Rules

- Type is always **PascalCase**
- Always include the type prefix — no bare messages
- Description starts lowercase after the colon
- Description is a past-tense phrase, not imperative (e.g. `implemented X`, not `implement X`)
- Keep the first line to one line where possible
- Release commits use the format: `Release vX.Y.Z`
- Release versions follow semantic versioning: `X` = major, `Y` = minor (new feature), `Z` = patch (bug fix)
- Stage is indicated by a label suffix: `vX.Y.Z-alpha`, `vX.Y.Z-beta`, or `vX.Y.Z` for full release
- Version counter resets on stage change (e.g. `v0.4.0-alpha` → `v0.1.0-beta`)

## Closing Issues

When a commit resolves a GitHub issue, include it in the commit body (not the subject line):

```
Type: description of what was done

Closes #123
```

or if the fix is partial/related:

```
Type: description of what was done

Related to #123
```

GitHub will automatically link and close the issue when the commit is pushed to `main`.

**Examples:**
```
Fix: resolved RSVP state breakage in repeating events

Closes #8
```

```
Add: implemented event creation slash command

Closes #1
Closes #3
```

## Examples

```
Add: implemented user authentication with session handling
Fix: resolved encoding issue in HTML helper
Refactor: extracted redundant logic into shared utility
Update: extended login flow with inactive user checks
Cleanup: reorganised CSS and JS assets
Init: set up Pest PHP testing framework
Docs: added project overview and usage instructions
Remove: removed Composer and related development tools
Release v0.1.0-alpha
Release v0.1.0-beta
Release v1.0.0
```
