# the-office

A portable workspace root for AI-assisted software development with [Claude Code](https://claude.ai/code).

## What's Inside

- **`.claude/skills/`** — Shareable skill definitions that load automatically in Claude Code
- **`shared/`** — Cross-cutting process docs (git strategy, code review flow)
- **`workflows/`** — Automation workflows (fully git-tracked)
- **`projects/`** — Clone your project repos here (separate repos, gitignored)
- **`CLAUDE.md`** — Workspace-level instructions for Claude Code

## Getting Started

1. Clone this repo:
   ```bash
   git clone <this-repo-url> the-office
   ```

2. Clone your project repos into `projects/`:
   ```bash
   cd the-office
   git clone <project-repo-url> projects/my-project
   ```

3. Open `the-office/` in Claude Code. Skills and conventions are loaded automatically.

## Skill Catalog

### Core SDLC (any project)

| Skill | Command | Purpose |
|-------|---------|---------|
| Architect | `/architect` | Product strategy & technical design |
| Build | `/build` | Full-stack implementation with TDD |
| Review | `/review` | Code review, security audit, QA |
| AI-DLC Inception | `/aidlc-inception` | Structured feature planning lifecycle |

### Content Pipeline (`workflows/ai-content-pipeline/`)

| Skill | Command | Purpose |
|-------|---------|---------|
| Content Gen v1 | `/content-gen` | Fast batch video script generation (WebSearch research) |
| Content Gen v2 | `/content-gen-v2` | Deep batch with yt-dlp + NotebookLM research |
| HeyGen Video | `/generate-heygen-video` | Automate HeyGen video generation via Playwright |

### Business Audit (`workflows/reputation-audit/`)

| Skill | Command | Purpose |
|-------|---------|---------|
| Business Audit | `/business-overview-audit` | PDF reputation reports for local businesses |

## Structure

```
the-office/
├── .claude/
│   ├── settings.json          # Agent Teams + Playwright plugin
│   └── skills/                # All skills (8 total, grouped by domain)
├── CLAUDE.md
├── shared/
│   ├── git_strategy.md
│   └── code_review_flow.md
├── workflows/                 # Fully git-tracked automations
│   ├── ai-content-pipeline/
│   └── reputation-audit/
└── projects/                  # Separate repos, gitignored
    └── .gitkeep
```

## Git Tracking Strategy

| What | Tracked? | Details |
|------|----------|---------|
| Skills & shared docs | Yes | Core part of the-office repo |
| Workflows | Yes | Everything tracked except `node_modules/` and tool caches |
| Projects | No | Separate repos cloned into `projects/`, gitignored |

## How It Works

Each project repo cloned into `projects/` retains its own git history, branches, and can have its own `CLAUDE.md` with project-specific instructions. The workspace-level `CLAUDE.md` provides generic conventions that apply to all projects.

Feature documentation (PRDs, tech specs, AIDLC artifacts) lives in the workspace root at `docs/<project-name>/<feature-name>/`.

## Agent Teams

Agent Teams is enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`). Spawn specialized teammates for complex tasks — each teammate picks up the appropriate skill and works in parallel. Best for multi-file features, cross-layer reviews, and competing debugging hypotheses.
