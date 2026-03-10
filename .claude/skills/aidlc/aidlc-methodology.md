# AI-DLC Full Methodology

Detailed stage-by-stage reference for the AI-DLC lifecycle. See `SKILL.md` for the overview and Light Mode assessment.

---

## Pre-Flight (Full Mode)

Before entering any phase:

1. **Load References:**
   - Read `shared/git_strategy.md` for branch and commit conventions.
   - Read feature docs in the project repo's `docs/features/` directory if they exist.

2. **Check for Existing State (Resumption):**
   - Look for `aidlc-docs/aidlc-state.md` in the target project's feature directory.
   - If found, parse current phase, stage, and unit progress.
   - Resume from the last incomplete stage rather than restarting.

3. **Initialize `aidlc-docs/` Structure:**
   - If no existing state, create:
     ```
     aidlc-docs/
     ├── inception/
     │   ├── plans/
     │   ├── reverse-engineering/
     │   ├── requirements/
     │   ├── user-stories/
     │   └── application-design/
     ├── construction/
     │   ├── plans/
     │   └── build-and-test/
     ├── operations/
     ├── aidlc-state.md
     └── audit.md
     ```
   - Initialize `aidlc-state.md` with feature identifier, phase = INCEPTION, and timestamp.
   - Initialize `audit.md` with the CEO's original request (complete raw input).

---

## INCEPTION PHASE

**Purpose:** Planning, requirements gathering, and architectural decisions — determine WHAT to build and WHY.

### Stage Details

#### Workspace Detection (ALWAYS)
- **Pre-condition:** Feature branch already created and pushed.
- Scan workspace, determine brownfield/greenfield, check for existing reverse engineering artifacts.
- Auto-proceed to next stage based on findings.
- **State update:** Record workspace type, feature identifier, branch name, next stage decision.

#### Reverse Engineering (CONDITIONAL — Brownfield Only)
- **Condition:** Execute if existing codebase detected AND no previous reverse engineering artifacts found.
- Invoke `/architect` to reverse-engineer existing codebase — analyze architecture, components, APIs, tech stack, dependencies.
- **Expected deliverable:** Reverse engineering artifacts (architecture docs, component inventory, API docs, tech stack docs).
- **Approval:** Present findings to CEO. Do not proceed until explicit approval.

#### Requirements Analysis (ALWAYS — Adaptive Depth)
- **Depth assessment:** Minimal (simple/clear request), Standard (normal complexity), Comprehensive (complex/high-risk).
- Invoke `/architect` to analyze requirements — functional and non-functional requirements.
- **Expected deliverable:** Requirements document with functional requirements, NFR baseline.
- **Approval:** Present requirements to CEO. Do not proceed until explicit approval.

#### User Stories (CONDITIONAL)
- **Condition:** Always execute for new user-facing features, complex business requirements, multiple user types. Skip for pure refactoring, simple bug fixes, infrastructure-only changes.
- Invoke `/architect` to generate user stories based on approved requirements.
- **Expected deliverable:** User stories with acceptance criteria, persona definitions.
- **Approval:** Present stories to CEO. Do not proceed until explicit approval.

#### Workflow Planning (ALWAYS)
- Determine which Construction stages to execute, depth level for each, and multi-package change sequence (if brownfield).
- Generate workflow visualization.
- **Approval:** Present execution plan to CEO. Do not proceed until explicit approval.

#### Application Design (CONDITIONAL)
- **Condition:** Execute if new components/services needed, component methods and business rules need definition, or service layer design required.
- Invoke `/architect` to design application architecture — components, services, dependencies, cross-cutting concerns.
- **Expected deliverable:** Component and service definitions, cross-cutting concerns documentation.
- **Approval:** Present design to CEO. Do not proceed until explicit approval.

#### Units Generation (CONDITIONAL)
- **Condition:** Execute if system needs decomposition into multiple units of work.
- Invoke `/architect` to decompose the system — unit boundaries, story mappings, integration contracts, data ownership.
- **Expected deliverable:** Unit definitions with story mappings, integration contracts, data ownership matrix.
- **Approval:** Present units to CEO. Do not proceed until explicit approval.

### Inception Exit Checklist

Before entering Construction, verify these artifacts exist:

**ALWAYS Required:**
- [ ] Requirements document with NFR baseline
- [ ] Execution plan with stage decisions (from Workflow Planning)
- [ ] Technology stack documented

**IF Multi-Unit:**
- [ ] Data model overview across units
- [ ] Integration contracts between units
- [ ] Cross-cutting concerns defined

**IF Brownfield:**
- [ ] Reverse engineering artifacts

**IF Application Design Executed:**
- [ ] Component and service definitions

If any required artifact is missing, do not proceed. Escalate with `[BLOCKER]` indicating which artifact is missing.

---

## CONSTRUCTION PHASE

**Purpose:** Detailed design, NFR implementation, and code generation — determine HOW to build it.

**Structure:** Per-unit loop. Each unit is completed fully (design + code) before moving to the next.

### Per-Unit Loop

**For each unit of work, execute the following stages in sequence:**

#### Functional Design (CONDITIONAL, per-unit)
- **Condition:** Execute if new data models/schemas, complex business logic, or business rules need detailed design.
- Invoke `/architect` for functional design — data models, business logic, validation rules, error handling.
- **Approval:** "Request Changes" or "Continue to Next Stage."

#### NFR Requirements (CONDITIONAL, per-unit)
- **Condition:** Execute if performance, security, or scalability considerations exist.
- Invoke `/architect` to assess NFR requirements — performance targets, security controls, scalability needs.

#### NFR Design (CONDITIONAL, per-unit)
- **Condition:** Execute if NFR Requirements was executed and NFR patterns need incorporation.
- Invoke `/architect` to design NFR implementation patterns — caching, security patterns, performance.

#### Infrastructure Design (CONDITIONAL, per-unit)
- **Condition:** Execute if infrastructure services need mapping or deployment architecture required.
- Invoke `/architect` to design infrastructure — services, deployment, cloud resources.

#### Code Generation — Part 1: Planning (ALWAYS, per-unit)
- Create a detailed code generation plan with explicit steps and checkboxes.
- Map unit requirements to implementation tasks.
- Identify platform (backend/web/mobile) and define execution sequence.
- **Approval:** Present plan to CEO. Do not proceed to execution until explicit approval.

#### Code Generation — Part 2: Execution (ALWAYS, per-unit)
- Invoke `/build` to implement code per the approved plan.
- **Delegation must include:**
  - Code generation plan
  - Feature branch name
  - Explicit instruction to generate unit tests
  - Explicit instruction to use scoped conventional commits
- After implementation, invoke `/review` for code review.
- **Code Review Flow:** Follows `shared/code_review_flow.md`. The PR must reach approval before proceeding.

### Build and Test (ALWAYS — After All Units Complete)
- Invoke `/review` to generate and execute build and test instructions.
- **Expected deliverable:** Build and test results — build success, test results, coverage report.
- **Approval:** Present results to CEO: "Build and test complete. Ready to proceed to Operations?"

---

## OPERATIONS PHASE

**Purpose:** Deployment and monitoring.

When reached:
1. Mark the Construction phase as complete in `aidlc-state.md`.
2. Generate a final workflow summary including:
   - All phases and stages executed (with timestamps)
   - All artifacts generated (with file paths)
   - All delegation requests and their outcomes
   - All approval gates and CEO decisions
   - Total units completed
3. Present the summary to the CEO.
4. Mark the overall AI-DLC workflow as **COMPLETE** in `aidlc-state.md`.
5. Log the completion in `audit.md`.

---

## Cross-Cutting Concerns

### State Management (`aidlc-state.md`)

Maintain execution state throughout the lifecycle:

```markdown
# AI-DLC State

## Feature
- **Identifier:** [feature-id]
- **Description:** [CEO's original request]
- **Started:** [ISO 8601 timestamp]
- **Last Updated:** [ISO 8601 timestamp]

## Current Position
- **Phase:** [INCEPTION | CONSTRUCTION | OPERATIONS | COMPLETE]
- **Stage:** [Current stage name]
- **Unit:** [Current unit name, if in Construction]

## Inception Progress
- [x] Workspace Detection — [COMPLETED | SKIPPED] — [timestamp]
- [ ] Reverse Engineering — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Requirements Analysis — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] User Stories — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Workflow Planning — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Application Design — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Units Generation — [COMPLETED | SKIPPED | PENDING] — [timestamp]

## Construction Progress
### Unit: [unit-name]
- [ ] Functional Design — [status] — [timestamp]
- [ ] NFR Requirements — [status] — [timestamp]
- [ ] NFR Design — [status] — [timestamp]
- [ ] Infrastructure Design — [status] — [timestamp]
- [ ] Code Generation (Plan) — [status] — [timestamp]
- [ ] Code Generation (Execute) — [status] — [timestamp]

### Build and Test
- [ ] Build and Test — [status] — [timestamp]

## Decisions
| Decision | Rationale | CEO Approved | Timestamp |
|----------|-----------|--------------|-----------|
```

**Update rules:**
- Update state in the SAME interaction where work is completed.
- Never skip a state update.
- Include skip rationale for conditional stages that are skipped.

### Audit Trail (`audit.md`)

Append-only log of all interactions:

```markdown
## [Stage Name or Interaction Type]
**Timestamp**: [ISO 8601]
**User Input**: "[Complete raw user input — never summarized]"
**AI Response**: "[AI's response or action taken]"
**Context**: [Stage, action, or decision made]

---
```

**Audit rules:**
- NEVER overwrite existing audit entries — append only.
- Log EVERY user input with complete raw text.
- Use ISO 8601 timestamps.

### Git Operations

- Auto-commit and push `aidlc-docs/` changes after each stage completion.
- Commit messages must use scoped conventional format: `docs(aidlc): complete requirements analysis`
