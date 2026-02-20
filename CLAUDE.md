# CLAUDE.md — the-office

This directory defines an **agentic workforce** — a system of AI agents that collaborate to build software under human (CEO) oversight.

## Directory Structure

```
the-office/
├── agents/                    # One folder per agent
│   ├── registry.md            # Quick-reference: all agents, roles, selection guide
│   ├── ceo-assistant/         # Friday — orchestrator, CEO's single point of contact
│   ├── aidlc-conductor/       # Maestro — drives AI-DLC methodology lifecycle
│   ├── product-manager/       # Nexus — PRDs, product strategy
│   ├── technical-architect/   # Atlas — system design, task breakdown, review triage
│   ├── backend-specialist/    # Forge — backend + DB/Supabase implementation
│   ├── web-frontend-specialist/ # Pixel — Next.js/React UI
│   ├── mobile-specialist/     # Dart — Flutter mobile
│   ├── code-reviewer/         # Sentinel — PR review, security audit
│   └── qa-specialist/         # Echo — test plans, E2E automation
├── shared/                    # Cross-agent processes and conventions
│   ├── git_strategy.md        # Branching model, commit conventions, PR templates
│   └── code_review_flow.md    # PR review lifecycle, status tracking, agent roles
└── projects/                  # Per-project feature tracking and artifacts
    └── pulse/                 # Pulse app project
```

## Agent System

Each agent has:
- **`identity.md`** — persona, responsibilities, operational protocol, escalation rules
- **`methodology.md`** — step-by-step workflow phases
- **`learnings.md`** — accumulated lessons (updated after each cycle)
- Additional policy files (e.g., `coding_standards.md`, `review_checklist.md`)

### Agent Registry (`agents/registry.md`)

| Codename | Role | Key Responsibility |
|----------|------|--------------------|
| **Friday** | CEO Assistant | Orchestrates all workflows, delegates to agents, reports to CEO |
| **Maestro** | AI-DLC Conductor | Drives features through Inception → Construction → Operations |
| **Nexus** | Product Architect | PRDs, user stories, product strategy |
| **Atlas** | Technical Architect | System design, task breakdown, NFRs, review comment triage |
| **Forge** | Backend Specialist | Backend APIs, business logic, DB/Supabase (schemas, migrations, RLS) |
| **Pixel** | Web Frontend | Next.js/React UI, accessibility, performance |
| **Dart** | Mobile Specialist | Flutter widgets, platform channels, state management |
| **Sentinel** | Code Reviewer | PR audits, security review, standards enforcement |
| **Echo** | QA Specialist | Test plans, integration/regression tests, E2E automation |

## Shared Processes

### Git Strategy (`shared/git_strategy.md`)
- **Branch hierarchy:** `main` → `feature/<ID>_<name>` → `task/<ID>_<name>`
- **Commits:** Scoped conventional commits (`feat(scope): description`)
- **Merges:** Squash merge only. Sentinel gates all merges.

### Code Review Flow (`shared/code_review_flow.md`)
- **Tracker:** Each feature has a `pull_requests.md` table at `projects/[project]/features/[feature]/pull_requests.md`
- **AI Review Status state machine:** `REVIEW_REQUESTED` → `IN_REVIEW` → `LGTM` or `COMMENTS_ADDED` → `FIX_NEEDED` → cycle back
- **Roles:** Coding agents open PRs → Sentinel reviews → Atlas triages comments → coding agent fixes → repeat until LGTM
- **Sequential:** One PR at a time per the single-instance rule

## Key Rules

- **Single-Instance Rule:** Only one instance of any agent may run at a time.
- **Fail-Twice-Escalate:** Any agent that fails a task twice must stop and escalate with `[STUCK]`.
- **Friday is the hub:** All inter-agent communication and CEO communication flows through Friday.
- **Approval gates are blocking:** CEO must explicitly approve before workflows proceed past gates.

## Conventions When Editing Agent Files

- Agent identity files define **what** the agent does; methodology files define **how**.
- When adding a new shared process, reference it in every relevant agent's operational protocol (READ ALWAYS / READ list).
- Escalation tags (`[BLOCKER]`, `[STUCK]`, `[SECURITY_ALERT]`, `[TECH_BLOCKER]`, `[CRITICAL_BUG]`) are reserved keywords — always surface them to Friday/CEO.
- Never duplicate process definitions across agent files — reference the shared file instead.
