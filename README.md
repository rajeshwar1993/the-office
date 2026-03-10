# the-office

A portable workspace root for AI-assisted software development with [Claude Code](https://claude.ai/code).

## What's Inside

- **`.claude/skills/`** — Shareable skill definitions (architect, build, review, aidlc-inception) that load automatically in Claude Code
- **`shared/`** — Company-wide process docs (git strategy, code review flow)
- **`workspaces/`** — Clone your project repos here (gitignored)
- **`CLAUDE.md`** — Workspace-level instructions for Claude Code

## Getting Started

1. Clone this repo:
   ```bash
   git clone <this-repo-url> the-office
   ```

2. Clone your project repos into `workspaces/`:
   ```bash
   cd the-office
   git clone <project-repo-url> workspaces/my-project
   ```

3. Open `the-office/` in Claude Code. Skills and conventions are loaded automatically.

## Skills

| Skill | Command | Purpose |
|-------|---------|---------|
| Architect | `/architect` | Product strategy & technical design |
| Build | `/build` | Full-stack implementation with TDD |
| Review | `/review` | Code review, security audit, QA |
| AI-DLC Inception | `/aidlc-inception` | Inception phase for complex features: workspace detection, requirements, design, and planning artifacts |

## Structure

```
the-office/
├── .claude/
│   ├── settings.json
│   └── skills/
│       ├── aidlc-inception/
│       ├── architect/
│       ├── build/
│       └── review/
├── CLAUDE.md
├── shared/
│   ├── git_strategy.md
│   └── code_review_flow.md
└── workspaces/          # gitignored
    └── .gitkeep
```

## How It Works

Each project repo cloned into `workspaces/` retains its own git history, branches, and can have its own `CLAUDE.md` with project-specific instructions. The workspace-level `CLAUDE.md` provides generic conventions that apply to all projects.

Feature documentation (PRDs, tech specs, AIDLC artifacts) lives in each project repo at `docs/features/<feature-name>/`.
