# the-office

Shell workspace for AI-assisted software development. Three kinds of content live here:

- **`.claude/skills/`** — generic SDLC skills available everywhere in this tree.
- **`workflows/`** — self-contained automations. Each workflow has its own `CLAUDE.md` and local skills under `<workflow>/.claude/skills/`. Those skills are only available when you're working inside that workflow's subtree.
- **`projects/`** — cloned product repos. Each is its own git repo with its own `CLAUDE.md`. This directory is gitignored so project history stays separate.

There are **no** workspace-wide conventions (git strategy, review flow, feature docs layout, etc.) defined here. Each project defines its own in its own `CLAUDE.md`.

## Generic SDLC skills (available at root)

| Skill | Command | Use when |
|---|---|---|
| architect | `/architect` | Designing a feature: JTBD, PRD, schema, API contracts |
| build | `/build` | Implementing: TDD, platform-specific (backend/web/mobile) |
| review | `/review` | Reviewing a PR: security, logic, tests |
| aidlc-inception | `/aidlc-inception` | End-to-end feature planning |

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
