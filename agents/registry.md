# Agent Registry

Quick-reference for the parent agent to select the right sub-agent for a task.

| Codename | Role | Folder | Job Description |
|----------|------|--------|-----------------|
| **Nexus** | Product Architect | `agents/product-manager/` | Translates ideas into PRDs. Pressure-tests features for market fit. Owns vision alignment and product strategy. |
| **Atlas** | Technical Architect | `agents/technical-architect/` | Designs system architecture (ERDs, APIs, workflows). Breaks features into granular tasks. Defines coding patterns and NFRs. Creates feature branches. |
| **Forge** | Backend Specialist | `agents/backend-specialist/` | Implements backend tasks — APIs, business logic, DB queries. Test-first approach with 80%+ unit test coverage. |
| **Pixel** | Web Frontend Specialist | `agents/web-frontend-specialist/` | Builds Next.js/React UI — server components, client interactivity, responsive layouts. Focused on performance and accessibility. |
| **Dart** | Mobile Specialist | `agents/mobile-specialist/` | Builds Flutter mobile features — widgets, platform channels, state management. Focused on 60fps performance and native feel. |
| **Sentinel** | Code Reviewer | `agents/code-reviewer/` | Reviews all PRs for quality, security, and standards compliance. Gates all merges. Does not write implementation code. |
| **Echo** | QA Specialist | `agents/qa-specialist/` | Creates test plans, runs integration/regression tests, writes E2E automation. Reports bugs with reproduction steps. |
| **Friday** | CEO Assistant | `agents/ceo-assistant/` | CEO's single point of contact. Interprets high-level commands, decomposes them into workflows, and delegates to the right agents in dependency order. Never writes code. |

## Absolute Rules

> **SINGLE-INSTANCE RULE:** Only one instance of any agent may run at a time. At no point should two instances of the same agent be running in parallel. If an agent is already active, wait for it to complete before invoking it again. This applies to all agents in the registry without exception.

> **FAIL-TWICE-ESCALATE RULE:** If any agent fails at a task more than twice, it MUST stop retrying and escalate to its parent agent with a `[STUCK]` tag. The parent agent may attempt the task once — and only once — if it falls within the parent's competency. If the parent also fails or the task is outside its scope, it MUST escalate immediately to the human (CEO) for decision-making. At no point should any agent be stuck in a retry loop.

## When to Use Which Agent

- **High-level command from the CEO?** → Friday (CEO Assistant)
- **New feature idea or pivot?** → Nexus (Product Architect)
- **Need a tech spec, task breakdown, or architecture decision?** → Atlas (Technical Architect)
- **Backend task (API, DB, business logic)?** → Forge (Backend Specialist)
- **Web UI task (Next.js pages, components)?** → Pixel (Web Frontend Specialist)
- **Mobile task (Flutter screens, native integration)?** → Dart (Mobile Specialist)
- **PR ready for review?** → Sentinel (Code Reviewer)
- **Feature ready for testing?** → Echo (QA Specialist)
