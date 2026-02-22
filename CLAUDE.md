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
│   ├── claude-code-adapter.md # Platform adapter — rule precedence, retired rules, Light Mode
│   ├── git_strategy.md        # Branching model, commit conventions, PR templates
│   ├── code_review_flow.md    # PR review lifecycle (simplified for solo developer)
│   └── tech_stack.md          # Pulse project tech stack (architecture, frameworks, conventions)
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
- **Default (solo developer):** Single Sentinel review pass. GitHub PR status is the source of truth.
- **Flow:** Coding agent opens PR → Sentinel reviews → approved or comments → fixes → re-review
- **Full flow (team setting):** Adds Atlas comment triage between Sentinel and coding agent
- **Sequential:** One PR at a time per the single-instance rule

### Tech Stack (`shared/tech_stack.md`)
- **Architecture:** Hybrid Flutter + Next.js (WebView)
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind v4, Biome
- **Mobile:** Flutter 3.10.8+, Dart, Riverpod, GoRouter
- **Backend:** Supabase (PostgreSQL 17, Deno 2 Edge Functions)
- Referenced by Sentinel, Nexus, Pixel, and Dart for tech context

### Claude Code Platform Adapter (`shared/claude-code-adapter.md`)
- **Rule precedence:** Workspace CLAUDE.md > the-office shared > personal-aidlc > agent identity
- **Git:** `shared/git_strategy.md` is the ONLY git strategy (AI-DLC `code-branching.md` retired)
- **Questions:** Ask directly in conversation (AI-DLC question files not used)
- **Light Mode:** For low-complexity features — 3 stages, 2 approval gates max
- **Retired rules:** welcome-message, content-validation, overconfidence-prevention, terminology, question-format-guide

## Key Rules

- **Single-Instance Rule:** Only one instance of any agent may run at a time.
- **Fail-Twice-Escalate:** Any agent that fails a task twice must stop and escalate with `[STUCK]`.
- **Friday is the hub:** CEO communication and escalations flow through Friday. Maestro may invoke specialists directly during AI-DLC workflows.
- **Approval gates are blocking:** CEO must explicitly approve before workflows proceed past gates. CEO may waive with brief approval.
- **Retrospectives:** Friday runs a lightweight retrospective after every feature (see `workflows.md` section 3).

## Conventions When Editing Agent Files

- Agent identity files define **what** the agent does; methodology files define **how**.
- When adding a new shared process, reference it in every relevant agent's operational protocol (READ ALWAYS / READ list).
- Escalation tags (`[BLOCKER]`, `[STUCK]`, `[SECURITY_ALERT]`, `[TECH_BLOCKER]`, `[CRITICAL_BUG]`) are reserved keywords — always surface them to Friday/CEO.
- Never duplicate process definitions across agent files — reference the shared file instead.
