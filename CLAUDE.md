# CLAUDE.md

This file provides guidance to Claude Code when working in this workspace.

## What Is the-office?

**the-office** is a portable workspace root for AI-assisted software development. It contains shared processes, skills, and a `workspaces/` directory where project repos are cloned. Open this directory in Claude Code to get all skills and conventions automatically.

## Workspace Structure

```
the-office/                          # Open THIS in Claude Code
├── .claude/
│   ├── settings.json                # Shared plugin config (git-tracked)
│   └── skills/                      # Git-tracked, shareable skills
│       ├── aidlc-inception/          # Inception phase planning
│       ├── architect/               # Product strategy & technical design
│       ├── build/                   # Full-stack implementation (TDD)
│       └── review/                  # Code review & QA
├── CLAUDE.md                        # This file
├── README.md
├── .gitignore
├── shared/                          # Company-wide process docs
│   ├── git_strategy.md              # Branch & commit conventions
│   └── code_review_flow.md          # PR review lifecycle
├── workflows/                       # Task-oriented automations (git-tracked)
│   └── reputation-audit/            # Google Maps scraping & PDF audit reports
└── workspaces/                      # Gitignored — clone project repos here
    └── .gitkeep
```

## Workflows

Task-oriented automations live in `workflows/`. Unlike project repos (which are cloned into `workspaces/`), workflows are git-tracked as part of the-office.

| Workflow | Purpose |
|----------|---------|
| `reputation-audit` | Scrapes Google Maps listings, classifies businesses, generates PDF audit reports via Puppeteer |

## Workspaces

Project repos are cloned into `workspaces/`. Each project has its own git history, branches, and CLAUDE.md. The `workspaces/` directory is gitignored so project repos don't pollute the-office's history.

```bash
# Example: set up a project
git clone <repo-url> workspaces/my-project
```

When a feature spans multiple repos, create separate feature branches, commits, and PRs in each repo with cross-references.

## Skills

| Skill | Command | Purpose |
|-------|---------|---------|
| Architect | `/architect` | Product strategy (JTBD, PRDs, skeptic's lens) + technical design (schema, API contracts, task decomposition) |
| Build | `/build` | Full-stack implementation with TDD (backend, web, mobile) |
| Review | `/review` | Code review, security audit, QA, and test automation |
| AI-DLC Inception | `/aidlc-inception` | Inception phase for complex features: workspace detection, requirements, design, and planning artifacts |

## Git Strategy

Defined in `shared/git_strategy.md`:

- **Branch hierarchy:** `main` → `feature/<ID>_<name>` → `task/<ID>_<name>`
- **Commits:** Scoped conventional commits (`type(scope): description`)
- **Merges:** Squash merge only. Delete source branch after merge.

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
