# Inception Stages — Detailed Reference

Stage-by-stage instructions for the AI-DLC inception phase. See `SKILL.md` for the orchestration overview, state management, and cross-cutting rules.

> **Path convention:** All file paths below are relative to the **feature docs directory** defined in SKILL.md: `docs/<project-name>/<feature-name>/` in the workspace root.

---

## Stage 1: Workspace Detection (ALWAYS)

**Purpose:** Determine workspace state and check for existing AI-DLC projects.

**No approval gate** — this stage auto-proceeds.

### Steps

#### 1.1 Scan Project Repo for Existing Code

Check if the target project repo exists at `workspaces/<project-name>/`:

**If the directory exists:**
- Scan for source code files (.ts, .tsx, .js, .dart, .py, .go, .rs, .java, .kt, etc.)
- Check for build files (package.json, pubspec.yaml, pom.xml, build.gradle, Cargo.toml, etc.)
- Look for project structure indicators

**If the directory does NOT exist:**
- Mark as greenfield — the project repo will be created during construction
- Record findings with "N/A" values and skip to step 1.3

Record findings:
```markdown
## Workspace State
- **Existing Code:** [Yes/No]
- **Programming Languages:** [List if found, "N/A" if greenfield]
- **Build System:** [npm/flutter/etc. if found, "N/A" if greenfield]
- **Project Structure:** [Monolith/Multi-repo/Library/New Project]
- **Project Repo Path:** [Path if exists, "Not yet created" if greenfield]
```

#### 1.2 Determine Repository Information (Brownfield Only)

If existing code was found (brownfield), determine:
- Single repository or multiple?
- If multiple: collect repository names for path collection during Reverse Engineering.

Skip this step for greenfield projects.

#### 1.3 Determine Next Stage

| Workspace | Condition | Next Stage |
|-----------|-----------|------------|
| Empty (greenfield) | — | Requirements Analysis |
| Has code (brownfield) | No RE artifacts exist | Reverse Engineering |
| Has code (brownfield) | RE artifacts already exist | Requirements Analysis |

#### 1.4 Update State with Workspace Findings

Update `aidlc-state.md` (created during Pre-Flight) with workspace scan results:
- Set **Existing Code**, **Project Type**, **Project Repo Path**, **Repositories Involved** in the Workspace State section
- Mark Workspace Detection as COMPLETED with timestamp
- Set **Stage** to the next stage determined in step 1.3

#### 1.5 Present Findings and Auto-Proceed

Present a brief summary:
```
Workspace Detection complete:
- Project Type: [Greenfield/Brownfield]
- [Key findings in bullet points]
- Proceeding to [next stage]...
```

Auto-proceed to the determined next stage.

---

## Stage 2: Reverse Engineering (CONDITIONAL — Brownfield Only)

**Condition:** Existing codebase detected AND no previous RE artifacts in `inception/reverse-engineering/`.

**Skip when:** Greenfield project (no existing code).

**Delegate to:** `/architect`

### Steps

#### 2.1 Collect Repository Paths (Multi-Repo Only)

If user indicated multiple repositories during Workspace Detection:
- For each repository name, ask for the absolute path
- Validate each path exists and contains source code
- Update `aidlc-state.md` with validated paths

#### 2.2 Delegate Analysis to /architect

Provide `/architect` with:
- Project repo path(s) (under `workspaces/`)
- Feature identifier and description
- Project CLAUDE.md content (for project-specific conventions)
- Instruction to analyze: architecture, components, APIs, tech stack

#### 2.3 Expected Deliverables

`/architect` should produce these files in `inception/reverse-engineering/`:

| Artifact | Content |
|----------|---------|
| `architecture.md` | System overview, architecture diagram (Mermaid), component descriptions, data flow, integration points |
| `code-structure.md` | Build system, key classes/modules, existing files inventory, design patterns, critical dependencies |
| `api-documentation.md` | REST APIs (endpoints, methods, request/response), internal APIs, data models |
| `component-inventory.md` | Application packages, infrastructure packages, shared packages, test packages with counts |
| `technology-stack.md` | Languages, frameworks, infrastructure services, build tools, testing tools with versions |

#### 2.4 Update State

Update `aidlc-state.md`: mark Reverse Engineering as COMPLETED with timestamp.

#### 2.5 Approval Gate

Present findings summary and wait for explicit approval before proceeding to Requirements Analysis.

---

## Stage 3: Requirements Analysis (ALWAYS — Adaptive Depth)

**Purpose:** Analyze the user's request and produce a formal requirements document.

**Delegate to:** `/architect`

### Steps

#### 3.1 Load Prior Context

If brownfield: load `architecture.md`, `component-inventory.md`, `technology-stack.md` from RE stage.

#### 3.2 Analyze User Request (Intent Analysis)

Evaluate:
- **Clarity:** Clear / Vague / Incomplete
- **Type:** New Feature / Bug Fix / Refactoring / Enhancement / Migration / New Project
- **Scope:** Single File / Single Component / Multiple Components / System-wide / Cross-system
- **Complexity:** Trivial / Simple / Moderate / Complex

#### 3.3 Determine Depth

| Depth | When |
|-------|------|
| Minimal | Clear, simple request — document basic understanding |
| Standard | Needs clarification — functional + non-functional requirements |
| Comprehensive | Complex, high-risk — detailed requirements with traceability |

#### 3.4 Delegate to /architect

Provide `/architect` with:
- User's original request
- Intent analysis results
- RE context (if brownfield)
- Instruction to produce requirements document with NFR baseline

#### 3.5 Clarifying Questions

If ambiguities exist, generate questions (see Question Format in SKILL.md).

**Areas to evaluate (all of them — ask questions for ANY that are unclear):**
- Functional Requirements: Core features, user interactions, system behaviors
- Non-Functional Requirements: Performance, security, scalability, usability, NFR baselines/targets
- User Scenarios: Use cases, user journeys, edge cases, error scenarios
- Business Context: Goals, constraints, success criteria
- Technical Context: Integration points, data requirements, system boundaries, tech stack preferences (greenfield)

**When in doubt, ask** — incomplete requirements lead to poor implementations.

Analyze all answers for contradictions/ambiguities. Create follow-up questions if needed. Keep asking until all ambiguities are resolved or user explicitly asks to proceed.

#### 3.6 Expected Deliverables

| Artifact | Content |
|----------|---------|
| `inception/requirements/requirements.md` | Intent analysis summary, functional requirements, NFR baseline (performance, security, scalability, availability, maintainability) |
| `inception/requirements/requirement-verification-questions.md` | Clarifying questions (if needed) |
| `inception/requirements/technical-foundation.md` | **Greenfield only** — tech stack decisions, dev standards, shared dependencies, build/test tools, code organization |

#### 3.7 Update State and Approval Gate

Update `aidlc-state.md`. Present requirements summary and wait for approval.

---

## Stage 4: User Stories (CONDITIONAL)

**Condition — Execute if ANY apply:**
- New user-facing features
- Complex business requirements
- Multiple user types/personas
- User experience changes
- Customer-facing APIs
- Cross-team projects

**Skip if ALL apply:**
- Pure refactoring / internal changes
- Simple bug fix with clear scope
- Infrastructure-only / developer tooling
- Documentation changes

**Default:** When in doubt, include user stories.

**Delegate to:** `/architect`

### Part 1: Planning

#### 4.1 Validate Need

Assess against execute/skip criteria. Document assessment reasoning.

#### 4.2 Create Story Plan

Delegate to `/architect`:
- Generate story development plan with step-by-step checklist
- Include methodology and approach for converting requirements to stories

#### 4.3 Generate Questions

Focus on (only ask what's relevant):
- User Personas: types, roles, characteristics, motivations
- Story Granularity: detail level, story size, breakdown approach
- Breakdown Approach: organization method (user journey / feature / persona / domain / epic-based)
- Acceptance Criteria: format, testing approach, validation methods
- Business Context: goals, success metrics

#### 4.4 Mandatory Artifacts in Plan

The plan must include:
- [ ] `stories.md` — user stories following INVEST criteria with acceptance criteria
- [ ] `personas.md` — user archetypes and characteristics
- [ ] `story-registry.md` — ID registry mapping stories to tasks

#### 4.5 Store Plan and Collect Answers

Save plan as `inception/plans/story-generation-plan.md`.
Collect and validate answers. Analyze for ambiguities. Resolve all before proceeding.

#### 4.6 Approval Gate (Plan)

Present plan for approval. Do not proceed to generation until approved.

### Part 2: Generation

#### 4.7 Execute Plan

- Load approved plan from `inception/plans/story-generation-plan.md`
- Execute each step, marking checkboxes as completed
- Generate all artifacts per the plan

#### 4.8 Multi-Repo Story Handling

When a story touches multiple repositories, split into **Story Parts**:

```markdown
## Story: STORY-001 - [Title]
**Repositories Involved:** [repo-1], [repo-2]

### Part 1: [repo-1]
**Tasks:** TASK-001-1, TASK-001-2

### Part 2: [repo-2]
**Tasks:** TASK-001-3, TASK-001-4

### Contracts Between Repos
- API Contract: [endpoint, request/response format]
```

#### 4.9 Story ID Format

- Stories: `STORY-001`, `STORY-002`, etc.
- Tasks: `TASK-001-1`, `TASK-001-2` (story number - task sequence)
- Maintain registry in `story-registry.md`

#### 4.10 Expected Deliverables

All in `inception/user-stories/`:

| Artifact | Content |
|----------|---------|
| `stories.md` | User stories with INVEST criteria, acceptance criteria, task breakdown |
| `personas.md` | User archetypes with characteristics and motivations |
| `story-registry.md` | ID registry: stories, tasks, status, repo assignments |

#### 4.11 Update State and Approval Gate (Stories)

Present generated stories for approval before proceeding to Workflow Planning.

---

## Stage 5: Workflow Planning (ALWAYS)

**Purpose:** Analyze scope/impact, determine which remaining inception stages to execute, and create an execution plan.

**Handle directly** (no delegation).

### Steps

#### 5.1 Load All Prior Context

- RE artifacts (if brownfield): architecture, component inventory, technology stack
- Requirements: `requirements.md`, `requirement-verification-questions.md` (with answers)
- User Stories (if executed): `stories.md`, `personas.md`

#### 5.2 Scope and Impact Analysis

**Brownfield — Transformation Scope:**
- Single component change vs architectural transformation
- Infrastructure vs application changes
- Cross-package impact (shared models, client libraries, test packages)

**Change Impact Assessment (all projects):**
1. User-facing changes?
2. Structural changes?
3. Data model changes?
4. API changes?
5. NFR impact?

**Risk Assessment:**
- Low: Isolated change, easy rollback, well-understood
- Medium: Multiple components, moderate rollback, some unknowns
- High: System-wide impact, complex rollback, significant unknowns
- Critical: Production-critical, difficult rollback, high uncertainty

#### 5.3 Determine Remaining Inception Stages

Only decide for stages not yet executed:

**Application Design — Execute IF:**
- New components or services needed
- Component methods and business rules need definition
- Service layer design required
- Component dependencies need clarification

**Application Design — Skip IF:**
- Changes within existing component boundaries
- No new components or methods
- Pure implementation changes

**Units Generation — Execute IF:**
- System needs decomposition into multiple units of work
- Multiple packages require changes
- New data models/schemas or API changes
- Complex algorithms or business logic across components

**Units Generation — Skip IF:**
- Single unit of work
- Simple logic / UI-only changes
- Configuration updates

For each: document EXECUTE or SKIP with rationale.

#### 5.4 Generate Workflow Visualization

Create Mermaid flowchart showing all 7 inception stages with status:

**Styling:**
- Completed: `fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff` (green)
- Conditional EXECUTE: `fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000` (orange, dashed)
- Conditional SKIP: `fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000` (gray, dashed)
- Start/End: `fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000` (purple)

Always include a text alternative below the Mermaid diagram.

#### 5.5 Create Execution Plan Document

Save as `inception/plans/execution-plan.md`:

```markdown
# Execution Plan

## Analysis Summary

### Change Impact Assessment
- **User-facing changes:** [Yes/No — Description]
- **Structural changes:** [Yes/No — Description]
- **Data model changes:** [Yes/No — Description]
- **API changes:** [Yes/No — Description]
- **NFR impact:** [Yes/No — Description]

### Risk Assessment
- **Risk Level:** [Low/Medium/High/Critical]
- **Rollback Complexity:** [Easy/Moderate/Difficult]

## Workflow Visualization

[Mermaid flowchart]

[Text alternative]

## Inception Stages

- [x] Workspace Detection — COMPLETED
- [x/skip] Reverse Engineering — [COMPLETED/SKIPPED: rationale]
- [x] Requirements Analysis — COMPLETED
- [x/skip] User Stories — [COMPLETED/SKIPPED: rationale]
- [x] Workflow Planning — IN PROGRESS
- [ ] Application Design — [EXECUTE/SKIP: rationale]
- [ ] Units Generation — [EXECUTE/SKIP: rationale]

## Success Criteria
- **Primary Goal:** [Main objective]
- **Key Deliverables:** [List]
```

#### 5.6 Plan Deliverables Check

Ensure the execution plan accounts for all required deliverables:

**Already produced (verify these exist from prior stages):**
- [ ] Technology stack documented (greenfield: `inception/requirements/technical-foundation.md`, brownfield: `inception/reverse-engineering/technology-stack.md`)
- [ ] NFR baseline defined in `inception/requirements/requirements.md`

If any of the above are missing, flag as `[BLOCKER]` and address before finalizing.

**Planned for upcoming stages (verify the execution plan lists these):**
- [ ] If Application Design marked EXECUTE: plan includes `inception/application-design/cross-cutting-concerns.md`
- [ ] If multi-unit or complex data: plan includes `inception/application-design/data-model-overview.md`
- [ ] If Units Generation marked EXECUTE: plan includes `inception/units/integration-contracts.md` (if multi-unit) and `inception/units/data-ownership.md` (if shared data)

#### 5.7 Update State and Approval Gate

Present execution plan. Include option to add/remove stages:
- "Add Skipped Stages" — include stages currently marked SKIP
- "Request Changes" — modify the plan

---

## Stage 6: Application Design (CONDITIONAL)

**Condition:** New components/services needed, service layer design required, or component dependencies need clarification.

**Delegate to:** `/architect`

### Steps

#### 6.1 Analyze Context

Load requirements, stories (if available), and RE artifacts (if brownfield). Identify key business capabilities and functional areas.

#### 6.2 Delegate to /architect

Provide all context. Request:
- Component identification with responsibilities
- Service layer design with orchestration patterns
- Dependency and communication patterns
- Cross-cutting concerns strategy

#### 6.3 Generate Questions

Only ask what's relevant to THIS specific design (not a mandatory checklist):
- Component boundaries (if unclear)
- Service orchestration (if ambiguous)
- Communication patterns (if multiple components)
- Cross-cutting concerns: auth, logging, error handling (if strategies unclear)
- Data model relationships (if complex data)

Collect answers, analyze for ambiguities, resolve before proceeding.

#### 6.4 Expected Deliverables

All in `inception/application-design/`:

| Artifact | Content |
|----------|---------|
| `components.md` | Component names, purposes, responsibilities, interfaces |
| `services.md` | Service definitions, responsibilities, interactions, orchestration |
| `component-dependency.md` | Dependency matrix, communication patterns, data flow diagrams |
| `cross-cutting-concerns.md` | Auth/authz strategy, logging/monitoring, error handling, config management, transaction management, caching, validation |
| `data-model-overview.md` | **IF multi-unit or complex data** — ER diagram, data ownership, shared entities, consistency strategy |

#### 6.5 Update State and Approval Gate

Present application design for approval. If Units Generation was marked SKIP in the execution plan, include option: "Add Units Generation — re-enable Units Generation stage."

---

## Stage 7: Units Generation (CONDITIONAL)

**Condition:** System needs decomposition into multiple units of work.

**Delegate to:** `/architect`

**Definition:** A unit of work is a logical grouping of stories for development. For microservices, each unit may become an independently deployable service. For monoliths, units represent logical modules.

### Part 1: Planning

#### 7.1 Create Decomposition Plan

Delegate to `/architect`:
- Generate plan with checkboxes for decomposing system into units
- Focus on unit boundaries, story mappings, integration contracts

#### 7.2 Generate Questions

Only ask what's relevant:
- Story grouping strategy (if multiple stories, grouping unclear)
- Integration contracts (how should units communicate: REST, events, shared DB?)
- Data ownership (which unit owns which entities?)
- Code organization (greenfield multi-unit only: deployment model, directory structure)

#### 7.3 Mandatory Artifacts in Plan

- [ ] `unit-of-work.md` — unit definitions and responsibilities
- [ ] `unit-of-work-dependency.md` — dependency matrix between units
- [ ] `unit-of-work-story-map.md` — mapping stories to units
- [ ] `integration-contracts.md` (if multiple units) — API contracts, event schemas, error handling contracts
- [ ] `data-ownership.md` (if shared data) — entity ownership, access rules, sync strategy

#### 7.4 Collect Answers and Get Plan Approval

Save plan as `inception/plans/unit-of-work-plan.md`.
Collect answers, analyze for ambiguities, resolve all.
Present plan for approval. Do not proceed to generation until approved.

### Part 2: Generation

#### 7.5 Execute Plan

- Load approved plan from `inception/plans/unit-of-work-plan.md`
- Execute each step, marking checkboxes
- Generate all unit artifacts per the plan

#### 7.6 Expected Deliverables

All in `inception/units/`:

| Artifact | Content |
|----------|---------|
| `unit-of-work.md` | Unit definitions, responsibilities, boundaries |
| `unit-of-work-dependency.md` | Dependency matrix showing unit relationships |
| `unit-of-work-story-map.md` | Story-to-unit mapping with task assignments |
| `integration-contracts.md` | API contracts, event schemas, message queue contracts, error handling contracts (if multi-unit) |
| `data-ownership.md` | Entity ownership by unit, shared entities, sync strategy, DB-per-unit decision (if shared data) |

#### 7.7 Update State and Approval Gate

Present units for approval. This is the final inception stage.

---

## Common Patterns

### Contradiction and Ambiguity Detection

After receiving any user answers (conversational or file-based), ALWAYS check for:

**Contradictions (logically inconsistent):**
- Scope mismatch: "Bug fix" but "entire codebase affected"
- Risk mismatch: "Low risk" but "breaking changes"
- Impact mismatch: "Single component" but "significant architecture changes"

**Ambiguities (unclear or vague):**
- "mix of", "somewhere between", "not sure", "depends", "maybe", "probably"
- Undefined criteria or terms
- Answers that combine options without clear decision rules
- Assumption-based responses

**Resolution:**
- Ask targeted follow-up questions referencing the specific contradiction
- Create clarification file if file-based questions were used
- Do NOT proceed until contradictions are resolved

### Re-entering a Skipped Stage

When a user selects "Add [Stage Name]" at an approval gate (only available at Stage 5+ gates):

1. **Update state:** Change the stage status from SKIPPED to PENDING in `aidlc-state.md`
2. **Update execution plan:** Edit `inception/plans/execution-plan.md` to mark the stage as EXECUTE
3. **Log in audit:** Record the re-entry decision with rationale in `audit.md`
4. **Add to Decisions table:** Record in `aidlc-state.md` Decisions table with user approval
5. **Execute immediately:** Run the newly-added stage before continuing to the next planned stage
6. **Normal flow resumes:** After the re-entered stage completes and is approved, continue with the stage that was next in the original flow

**Example:** At Stage 6's approval gate, user says "Add Units Generation." Update state, execute Stage 7, get approval, then proceed to inception exit.

### Multi-Repo Feature Handling

When a feature spans multiple project repos (e.g., `pulse-web` + `pulse-supabase`):

- **Project name:** Use the primary repo's name for `<project-name>`. The primary repo is the one most affected by the feature.
- **State tracking:** Single `aidlc-state.md` tracks the feature across all repos. List all repos in the **Repositories Involved** field.
- **Reverse Engineering:** Run RE on each repo. Store artifacts in `inception/reverse-engineering/`, prefixed by repo name (e.g., `pulse-web-architecture.md`, `pulse-supabase-architecture.md`).
- **Requirements:** Single `requirements.md` covering the full feature scope across repos.
- **User Stories:** Use Story Parts (see Stage 4.8) to split stories across repos with integration contracts.

### Error Recovery

**Missing artifacts during resumption:**
1. Identify which stage created the missing artifacts
2. If stage marked complete but artifacts missing: re-execute that stage
3. If stage not marked complete: resume from that stage

**Corrupted state file:**
1. Create backup
2. Ask user which stage they're on
3. Regenerate state from existing artifacts

**Incomplete answers:**
- Highlight unanswered questions
- Do not proceed until all required questions are answered

**User wants to restart a stage:**
1. Confirm (existing artifacts will be replaced)
2. Archive existing artifacts
3. Reset stage status in `aidlc-state.md`
4. Re-execute from beginning

**User wants to skip a stage:**
1. Confirm user understands implications
2. Document skip reason in `audit.md`
3. Mark as SKIPPED in `aidlc-state.md`
4. Proceed to next stage
