# the-office

Shell workspace for AI-assisted software development. Three kinds of content live here:

- **`workflows/`** — self-contained automations. Each workflow has its own `CLAUDE.md` and local skills under `<workflow>/.claude/skills/`. Those skills are only available when you're working inside that workflow's subtree.
- **`projects/`** — cloned product repos. Each is its own git repo with its own `CLAUDE.md`. This directory is gitignored so project history stays separate.

There are **no** workspace-wide conventions (git strategy, review flow, feature docs layout, etc.) defined here. Each project defines its own in its own `CLAUDE.md`.

## Workflows

`cd` into a workflow to get its local skills.

| Workflow | Skills (local) | Purpose |
|---|---|---|
| `workflows/ai-content-pipeline` | `content-gen`, `content-gen-v2`, `generate-heygen-video` | Multi-avatar video scripts + HeyGen automation |
| `workflows/reputation-audit` | `business-overview-audit` | PDF reputation audits for local businesses |
| `workflows/gmaps-scraper` | `scrape-gmaps` | ICP-filtered Google Maps scraping + reports |

## Projects

Clone into `projects/<name>`. Each project repo owns its own deployment, conventions, CI, and docs.

```bash
git clone <repo-url> projects/<name>
```
