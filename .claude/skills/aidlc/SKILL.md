---
name: aidlc
description: "AI-DLC feature lifecycle: Inception → Construction → Operations. Structured development with approval gates. Use for complex features that benefit from formal requirements and design stages."
user-invocable: true
---

# AI-DLC: Structured Feature Lifecycle

The AI-DLC (AI-Driven Development Lifecycle) provides a structured process for building features through three phases: Inception (planning), Construction (building), and Operations (deployment).

**When to use:** Complex features with multiple units of work, cross-cutting concerns, or when the CEO explicitly requests structured development.

**When NOT to use:** Bug fixes, simple refactors, single-component features, documentation changes. Use direct implementation instead.

---

## Light Mode Assessment

Before running the full process, assess whether **Light Mode** applies.

**Use Light Mode if ALL of these are true:**
- Single unit of work (no decomposition needed)
- Clear, unambiguous requirements
- Low risk / low complexity
- Bug fix, simple refactor, single-component feature, or documentation change

**Light Mode workflow:**
1. Requirements Analysis (minimal depth) — ask clarifying questions in conversation
2. Code Generation (combined plan + execute) — invoke `/build`
3. Build and Test — verify implementation

**Light Mode skips:** Workspace Detection, Reverse Engineering, User Stories, Workflow Planning, Application Design, Units Generation, Functional Design, NFR stages, Infrastructure Design, `aidlc-state.md`, `audit.md`

**Approval gates:** Maximum 2 (after requirements, after code)

If complexity warrants the full process mid-execution, escalate to full mode.

---

## Full Mode: Phase Overview

### Inception Phase — WHAT to build and WHY

| Stage | Condition | Delegation |
|-------|-----------|------------|
| Workspace Detection | ALWAYS | Direct |
| Reverse Engineering | Brownfield only | `/architect` |
| Requirements Analysis | ALWAYS (adaptive depth) | `/architect` |
| User Stories | CONDITIONAL (user-facing features) | `/architect` |
| Workflow Planning | ALWAYS | Direct |
| Application Design | CONDITIONAL (new components) | `/architect` |
| Units Generation | CONDITIONAL (multi-unit) | `/architect` |

**Inception Exit Checklist (verify before Construction):**
- [ ] Requirements document with NFR baseline
- [ ] Execution plan with stage decisions
- [ ] Technology stack documented
- [ ] (If multi-unit) Data model overview, integration contracts, cross-cutting concerns
- [ ] (If brownfield) Reverse engineering artifacts

### Construction Phase — HOW to build it

Per-unit loop. Each unit is completed fully before moving to the next:

| Stage | Condition | Delegation |
|-------|-----------|------------|
| Functional Design | CONDITIONAL | `/architect` |
| NFR Requirements | CONDITIONAL | `/architect` |
| NFR Design | CONDITIONAL | `/architect` |
| Infrastructure Design | CONDITIONAL | `/architect` |
| Code Generation (Plan) | ALWAYS | Direct |
| Code Generation (Execute) | ALWAYS | `/build` + `/review` |
| Build and Test | ALWAYS (after all units) | `/review` |

### Operations Phase — Deployment

Mark workflow as COMPLETE. Generate final summary of all phases, stages, artifacts, and decisions.

---

## Pre-Construction Verification (MANDATORY — before invoking /build)

Before delegating any Code Generation unit:

1. **Feature Branch:**
   - [ ] Feature branch `feature/<ID>_<name>` created from `main` in ALL affected repos
   - [ ] Branch pushed to remote
   - [ ] Branch name confirmed
   - **If not done: STOP. Create branches now.**

2. **Delegation Context Must Include:**
   - [ ] Explicit instruction to work on the feature branch (not `main`)
   - [ ] Explicit instruction to generate unit tests alongside implementation code
   - [ ] Explicit instruction to commit using scoped conventional commits

3. **Post-Construction Gate (after ALL units complete):**
   - [ ] All code committed to feature branch
   - [ ] Unit tests exist and pass
   - [ ] PR created from feature branch → `main`
   - [ ] Code review completed via `/review`
   - **If any missing: STOP. Complete before reporting done.**

---

## Delegation Patterns

- **Product/design work** → invoke `/architect`
- **Implementation work** → invoke `/build`
- **Code review and testing** → invoke `/review`
- **Orchestration, workflow planning** → handle directly (no skill needed)

## Approval Gates

- **Inception stages:** Present summary to CEO. Do not proceed without explicit approval.
- **Construction stages:** Standardized 2-option: "Request Changes" or "Continue to Next Stage."
- **CEO may waive gates** with brief approval ("go ahead", "proceed").

## Full Process Details

For complete stage-by-stage details, conditional logic, state management templates, and audit trail formats, see `aidlc-methodology.md` in this skill directory.
