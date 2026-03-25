# CLAUDE.md

This file provides guidance to Claude Code when working in this workspace.

## What Is the-office?

**the-office** is a portable workspace root for AI-assisted software development. It contains shared processes, skills, workflows, and a `projects/` directory where project repos are cloned. Open this directory in Claude Code to get all skills and conventions automatically.

## Workspace Structure

```
the-office/
├── .claude/
│   ├── settings.json                # Shared config + Agent Teams enabled
│   └── skills/                      # All skills (grouped by domain below)
├── CLAUDE.md                        # This file
├── shared/                          # Cross-cutting process docs
│   ├── git_strategy.md              # Branch & commit conventions
│   └── code_review_flow.md          # PR review lifecycle
├── workflows/                       # Automation workflows (fully git-tracked)
│   ├── ai-content-pipeline/         # Multi-avatar video content pipeline
│   └── reputation-audit/            # Google Maps scraping & PDF audit reports
└── projects/                        # Development projects (separate repos, gitignored)
    └── .gitkeep
```

## Workflows

Automation workflows live in `workflows/`. They are fully git-tracked (source, config, output, templates — everything except `node_modules/` and tool caches).

| Workflow | Purpose |
|----------|---------|
| `ai-content-pipeline` | Researches trending topics, synthesizes content ideas, generates multi-format video scripts (1 long-form + 3 shorts + 3 reels per topic) for any AI avatar |
| `reputation-audit` | Scrapes Google Maps listings, classifies businesses, generates PDF audit reports via Puppeteer |

## Projects

Development project repos are cloned into `projects/`. Each project has its own git repo, deployment pipeline, and CLAUDE.md. The `projects/` directory is gitignored so project repos don't pollute the-office's history.

```bash
# Example: set up a project
git clone <repo-url> projects/my-project
```

When a feature spans multiple repos, create separate feature branches, commits, and PRs in each repo with cross-references.

## Skill Catalog

### Core SDLC (use on any project)

| Skill | Command | Use When |
|-------|---------|----------|
| Architect | `/architect` | Designing a feature: JTBD analysis, PRDs, schema design, API contracts, task decomposition |
| Build | `/build` | Implementing code: TDD approach, platform-specific patterns (backend, web, mobile) |
| Review | `/review` | Reviewing a PR: security audit, logic/performance review, test generation, QA |
| AI-DLC Inception | `/aidlc-inception` | Planning a complex feature end-to-end: requirements, user stories, design, task breakdown |

### Content Pipeline (use with `workflows/ai-content-pipeline/`)

| Skill | Command | Use When |
|-------|---------|----------|
| Content Gen v1 | `/content-gen` | Fast batch (10 topics default), WebSearch-only research |
| Content Gen v2 | `/content-gen-v2` | Deep batch (2 topics default) with yt-dlp + NotebookLM research |
| HeyGen Video | `/generate-heygen-video` | Automating video creation from production prompts via Playwright |

### Business Audit (use with `workflows/reputation-audit/`)

| Skill | Command | Use When |
|-------|---------|----------|
| Business Audit | `/business-overview-audit` | Generating PDF reputation reports for local businesses |

## Agent Teams

Agent Teams is enabled for multi-agent collaboration. Spawn specialized teammates for complex tasks:

```
Example: Create a team for a new feature
- Architect teammate: use /architect to design the feature
- Builder teammate: use /build to implement
- Reviewer teammate: use /review to QA everything
```

Best for: parallel implementation of independent tasks, competing hypotheses during debugging, cross-layer code reviews. Not needed for sequential workflows (content pipeline, reputation audit).

## Git Strategy

Defined in `shared/git_strategy.md`:

- **Branch hierarchy:** `main` → `feature/<ID>_<name>` → `task/<ID>_<name>`
- **Commits:** Scoped conventional commits (`type(scope): description`)
- **Merges:** Squash merge only. Delete source branch after merge.

### Git Tracking Strategy

- **Workflows:** Fully tracked. Only `node_modules/`, `.puppeteer-cache/`, `.playwright-mcp/` are gitignored.
- **Projects:** Always separate repos, always gitignored from the-office.
- **Skills & shared docs:** Tracked as part of the-office repo.

## Pre-Implementation Checklist

Before writing any implementation code for a feature:

1. **Feature Branch:** Create `feature/<ID>_<name>` from `main` in ALL affected repos. Push to remote.
2. **Work on the feature branch** — never commit directly to `main`.
3. **Generate unit tests** alongside implementation code.
4. **Commit using scoped conventional commits:** `type(scope): description` (see `shared/git_strategy.md`).
5. **After implementation:** All tests pass, PR created from feature branch to `main`, code review completed.

## Code Review

PR review lifecycle is defined in `shared/code_review_flow.md`:

- **Solo developer (default):** Single review pass. GitHub PR status is the source of truth.
- **Flow:** PR opened → review → approved or comments → fixes → re-review

## Feature Documentation

Feature artifacts (PRDs, tech specs, AIDLC inception docs) live in the workspace root at `docs/<project-name>/<feature-name>/`. This keeps planning docs centralized in the-office rather than cluttering project repos.
