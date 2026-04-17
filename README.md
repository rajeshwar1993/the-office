# the-office

A portable shell workspace for AI-assisted software development with [Claude Code](https://claude.ai/code).

## What's inside

- **`.claude/skills/`** — generic SDLC skills loaded automatically at the root
- **`workflows/`** — self-contained automations, each with its own `CLAUDE.md` and local skills
- **`projects/`** — cloned product repos (each its own git repo, gitignored here)
- **`CLAUDE.md`** — the orientation doc Claude Code reads when you open this directory

There are no workspace-wide conventions (git strategy, review flow, etc.) — each project sets its own.

## Getting started

```bash
git clone <this-repo-url> the-office
cd the-office
git clone <project-repo-url> projects/my-project
```

Open `the-office/` in Claude Code. Skills load automatically based on your current working directory.

## Skill catalog

### Generic SDLC (available at root)

| Skill | Command | Purpose |
|---|---|---|
| Architect | `/architect` | Product strategy & technical design |
| Build | `/build` | Full-stack implementation with TDD |
| Review | `/review` | Code review, security audit, QA |
| AI-DLC Inception | `/aidlc-inception` | Structured feature planning lifecycle |

### Workflow-local (load when you `cd` into the workflow)

| Workflow | Skills | Purpose |
|---|---|---|
| `workflows/ai-content-pipeline` | `/content-gen`, `/content-gen-v2`, `/generate-heygen-video` | Multi-avatar video scripts + HeyGen automation |
| `workflows/reputation-audit` | `/business-overview-audit` | PDF reputation audits for local businesses |
| `workflows/gmaps-scraper` | `/scrape-gmaps` | ICP-filtered Google Maps scraping + reports |

## Structure

```
the-office/
├── .claude/
│   ├── settings.json            # Agent Teams + Playwright plugin
│   └── skills/                  # 4 generic SDLC skills
├── CLAUDE.md
├── workflows/                   # Self-contained automations
│   ├── ai-content-pipeline/     # with local .claude/skills/
│   ├── reputation-audit/        # with local .claude/skills/
│   └── gmaps-scraper/           # with local .claude/skills/
└── projects/                    # Separate repos, gitignored
    └── .gitkeep
```

## Git tracking

| What | Tracked? |
|---|---|
| Generic skills & workflows | Yes — everything except `node_modules/` and tool caches |
| Projects under `projects/` | No — they're separate repos, gitignored here |

## Agent Teams

Agent Teams is enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`). Spawn specialized teammates for complex tasks — each picks up the appropriate skill and works in parallel. Best for multi-file features, cross-layer reviews, and competing debugging hypotheses.
