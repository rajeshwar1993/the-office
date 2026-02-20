# AI-DLC Conductor Methodology: The Maestro Protocol

## Pre-Flight

Before entering any phase, execute these steps:

1. **Load Core References:**
   - Read `personal-aidlc/aidlc-rules/aidlc-rules/core-workflow.md` for the canonical workflow.
   - Read all common rule files (`process-overview.md`, `session-continuity.md`, `content-validation.md`, `question-format-guide.md`, `git-operations.md`).
   - Read `agents/registry.md` for delegation targets.

2. **Check for Existing State (Resumption):**
   - Look for `aidlc-docs/aidlc-state.md` in the target project.
   - If found, parse current phase, stage, and unit progress.
   - Resume from the last incomplete stage rather than restarting.
   - Report resumption status to Friday for CEO awareness.

3. **Initialize `aidlc-docs/` Structure:**
   - If no existing state, create the directory structure:
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

### Stage Execution Table

| Stage | Condition | Delegation | Approval |
|-------|-----------|------------|----------|
| Workspace Detection | ALWAYS | None (Maestro direct) | Auto-proceed |
| Reverse Engineering | Brownfield only | Atlas (via Friday) | CEO via Friday |
| Requirements Analysis | ALWAYS (adaptive depth) | Nexus (via Friday) | CEO via Friday |
| User Stories | CONDITIONAL (multi-factor assessment) | Nexus (via Friday) | CEO via Friday |
| Workflow Planning | ALWAYS | None (Maestro direct) | CEO via Friday |
| Application Design | CONDITIONAL | Atlas (via Friday) | CEO via Friday |
| Units Generation | CONDITIONAL | Atlas (via Friday) | CEO via Friday |

### Stage Details

#### Workspace Detection (ALWAYS)
- **Rule file:** `inception/workspace-detection.md`
- **Maestro direct:** Scan workspace, determine brownfield/greenfield, collect feature identifier, check for existing reverse engineering artifacts.
- **Auto-proceed** to next stage based on findings.
- **State update:** Record workspace type, feature identifier, next stage decision.

#### Reverse Engineering (CONDITIONAL — Brownfield Only)
- **Rule file:** `inception/reverse-engineering.md`
- **Condition:** Execute if existing codebase detected AND no previous reverse engineering artifacts found. Skip if greenfield or artifacts exist.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Atlas
  Task: Reverse-engineer existing codebase — analyze architecture, components, APIs, tech stack, dependencies, and interaction patterns.
  Input Files: Project root directory, any existing documentation
  Expected Deliverable: Reverse engineering artifacts (architecture docs, component inventory, API docs, tech stack docs, interaction diagrams)
  Acceptance Criteria: Comprehensive coverage of all packages/components, business transaction overview, technology stack documented
  ```
- **Approval:** Present findings to CEO via Friday. Do not proceed until explicit approval.

#### Requirements Analysis (ALWAYS — Adaptive Depth)
- **Rule file:** `inception/requirements-analysis.md`
- **Depth assessment:** Minimal (simple/clear request), Standard (normal complexity), Comprehensive (complex/high-risk).
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Nexus
  Task: Analyze requirements for the feature — determine functional and non-functional requirements at [minimal/standard/comprehensive] depth.
  Input Files: CEO's original request, reverse engineering artifacts (if brownfield), aidlc-docs/audit.md
  Expected Deliverable: Requirements document with functional requirements, non-functional requirements, and NFR baseline
  Acceptance Criteria: All requirements traceable to user intent, NFR baseline defined, technology stack documented (if greenfield)
  ```
- **Approval:** Present requirements to CEO via Friday. Do not proceed until explicit approval.

#### User Stories (CONDITIONAL)
- **Rule file:** `inception/user-stories.md`
- **Condition:** Multi-factor assessment per core-workflow.md — always execute for new user-facing features, complex business requirements, multiple user types. Skip for pure refactoring, simple bug fixes, infrastructure-only changes.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Nexus
  Task: Generate user stories based on approved requirements. Part 1: Create story plan with questions. Part 2: Generate stories and personas after plan approval.
  Input Files: Requirements document, reverse engineering artifacts (if brownfield)
  Expected Deliverable: User stories with acceptance criteria, persona definitions
  Acceptance Criteria: Stories traceable to requirements, acceptance criteria testable, personas reflect actual user types
  ```
- **Approval:** Present stories to CEO via Friday. Do not proceed until explicit approval.

#### Workflow Planning (ALWAYS)
- **Rule file:** `inception/workflow-planning.md`
- **Maestro direct:** Determine which Construction stages to execute, depth level for each, and multi-package change sequence (if brownfield). Generate workflow visualization.
- **Inputs:** All prior inception artifacts (reverse engineering, requirements, stories).
- **Approval:** Present execution plan to CEO via Friday, emphasizing user control to override recommendations. Do not proceed until explicit approval.

#### Application Design (CONDITIONAL)
- **Rule file:** `inception/application-design.md`
- **Condition:** Execute if new components/services needed, component methods and business rules need definition, or service layer design required. Skip if changes are within existing component boundaries.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Atlas
  Task: Design application architecture — define components, services, dependencies, and cross-cutting concerns.
  Input Files: Requirements document, user stories (if generated), reverse engineering artifacts (if brownfield)
  Expected Deliverable: Component and service definitions, cross-cutting concerns documentation, data model overview (if multi-unit)
  Acceptance Criteria: All components defined with clear responsibilities, dependencies mapped, cross-cutting concerns addressed
  ```
- **Approval:** Present design to CEO via Friday. Do not proceed until explicit approval.

#### Units Generation (CONDITIONAL)
- **Rule file:** `inception/units-generation.md`
- **Condition:** Execute if system needs decomposition into multiple units of work, multiple services/modules required, or complex system requiring structured breakdown. Skip if single simple unit.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Atlas
  Task: Decompose the system into implementation units — define unit boundaries, story mappings, integration contracts, and data ownership.
  Input Files: Application design, requirements, user stories
  Expected Deliverable: Unit definitions with story mappings, integration contracts (API contracts, event schemas), data ownership matrix
  Acceptance Criteria: Units are independently implementable, contracts are explicit, data ownership is unambiguous
  ```
- **Approval:** Present units to CEO via Friday. Do not proceed until explicit approval.

### Inception Exit Checklist

Before entering Construction, verify these artifacts exist:

**ALWAYS Required:**
- [ ] Requirements document with NFR baseline
- [ ] Execution plan with stage decisions (from Workflow Planning)
- [ ] Technology stack documented (from reverse engineering OR requirements analysis)

**IF Multi-Unit:**
- [ ] Data model overview across units
- [ ] Integration contracts between units
- [ ] Cross-cutting concerns defined

**IF Brownfield:**
- [ ] Reverse engineering artifacts (architecture, tech stack, dependencies)

**IF Application Design Executed:**
- [ ] Component and service definitions
- [ ] Cross-cutting concerns documentation

If any required artifact is missing, do not proceed. Escalate to Friday with `[BLOCKER]` indicating which artifact is missing and which stage should have produced it.

---

## CONSTRUCTION PHASE

**Purpose:** Detailed design, NFR implementation, and code generation — determine HOW to build it.

**Structure:** Per-unit loop. Each unit is completed fully (design + code) before moving to the next unit.

### Stage Execution Table (Per-Unit)

| Stage | Condition | Delegation | Approval |
|-------|-----------|------------|----------|
| Functional Design | CONDITIONAL | Atlas (via Friday) | 2-option via Friday |
| NFR Requirements | CONDITIONAL | Atlas (via Friday) | 2-option via Friday |
| NFR Design | CONDITIONAL | Atlas (via Friday) | 2-option via Friday |
| Infrastructure Design | CONDITIONAL | Atlas (via Friday) | 2-option via Friday |
| Code Generation (Plan) | ALWAYS | None (Maestro direct) | CEO via Friday |
| Code Generation (Execute) | ALWAYS | Forge/Pixel/Dart + Sentinel review (via Friday) | 2-option via Friday |
| Build and Test | ALWAYS (after all units) | Echo (via Friday) | CEO via Friday |

### Per-Unit Loop

**For each unit of work, execute the following stages in sequence:**

#### Functional Design (CONDITIONAL, per-unit)
- **Rule file:** `construction/functional-design.md`
- **Condition:** Execute if new data models/schemas, complex business logic, or business rules need detailed design. Skip for simple logic changes.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Atlas
  Task: Create functional design for unit "[unit-name]" — data models, business logic, validation rules, error handling.
  Input Files: Requirements, application design, unit definition
  Expected Deliverable: Functional design document for this unit
  Acceptance Criteria: All business rules documented, data models defined, error scenarios covered
  ```
- **Approval:** Standardized 2-option message: "Request Changes" or "Continue to Next Stage." Relay through Friday.

#### NFR Requirements (CONDITIONAL, per-unit)
- **Rule file:** `construction/nfr-requirements.md`
- **Condition:** Execute if performance requirements exist, security considerations needed, scalability concerns present, or tech stack selection required. Skip if no NFRs apply.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Atlas
  Task: Assess NFR requirements for unit "[unit-name]" — performance targets, security controls, scalability needs.
  Input Files: Requirements (NFR baseline), functional design (if executed), unit definition
  Expected Deliverable: NFR requirements assessment for this unit
  Acceptance Criteria: All relevant NFRs identified with measurable targets
  ```
- **Approval:** Standardized 2-option message via Friday.

#### NFR Design (CONDITIONAL, per-unit)
- **Rule file:** `construction/nfr-design.md`
- **Condition:** Execute if NFR Requirements was executed and NFR patterns need incorporation. Skip if NFR Requirements was skipped.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Atlas
  Task: Design NFR implementation patterns for unit "[unit-name]" — caching strategies, security patterns, performance optimizations.
  Input Files: NFR requirements assessment, functional design
  Expected Deliverable: NFR design document with implementation patterns
  Acceptance Criteria: Every NFR requirement has a corresponding design pattern or implementation approach
  ```
- **Approval:** Standardized 2-option message via Friday.

#### Infrastructure Design (CONDITIONAL, per-unit)
- **Rule file:** `construction/infrastructure-design.md`
- **Condition:** Execute if infrastructure services need mapping, deployment architecture required, or cloud resources need specification. Skip if no infrastructure changes.
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Atlas
  Task: Design infrastructure for unit "[unit-name]" — services, deployment, cloud resources, configuration.
  Input Files: Functional design, NFR design (if executed), unit definition
  Expected Deliverable: Infrastructure design document
  Acceptance Criteria: All infrastructure components specified, deployment topology defined, resource requirements documented
  ```
- **Approval:** Standardized 2-option message via Friday.

#### Code Generation — Part 1: Planning (ALWAYS, per-unit)
- **Rule file:** `construction/code-generation.md`
- **Maestro direct:** Create a detailed code generation plan with explicit steps and checkboxes. The plan maps unit requirements to implementation tasks, identifies which specialist agents are needed (Forge for backend, Pixel for web frontend, Dart for mobile), and defines the execution sequence.
- **Approval:** Present plan to CEO via Friday. Do not proceed to execution until explicit approval.

#### Code Generation — Part 2: Execution (ALWAYS, per-unit)
- **Rule file:** `construction/code-generation.md`
- **Delegation:** Based on the approved plan, delegate implementation to the appropriate specialists:
  ```
  [DELEGATION REQUEST]
  Target Agent: Forge / Pixel / Dart (as determined by plan)
  Task: Implement code for unit "[unit-name]" per the approved code generation plan — [specific implementation task].
  Input Files: Code generation plan, functional design, NFR design (if executed), infrastructure design (if executed)
  Expected Deliverable: Implementation code with unit tests
  Acceptance Criteria: All plan steps completed, tests passing, code follows project conventions
  ```
- **Post-implementation review:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Sentinel
  Task: Review implementation for unit "[unit-name]" — quality, security, standards compliance.
  Input Files: Implementation code, code generation plan, functional design
  Expected Deliverable: Code review with findings and approval/rejection
  Acceptance Criteria: No critical or high-severity findings, all standards met
  ```
- **Approval:** Standardized 2-option message via Friday.

### Build and Test (ALWAYS — After All Units Complete)
- **Rule file:** `construction/build-and-test.md`
- **Delegation:**
  ```
  [DELEGATION REQUEST]
  Target Agent: Echo
  Task: Generate and execute build and test instructions — build all units, run unit tests, integration tests, and performance tests (if applicable).
  Input Files: All unit implementations, functional designs, NFR requirements (if executed), integration contracts (if multi-unit)
  Expected Deliverable: Build and test results — build-instructions.md, unit-test-instructions.md, integration-test-instructions.md, performance-test-instructions.md, build-and-test-summary.md
  Acceptance Criteria: All builds succeed, all tests pass, test coverage meets project standards
  ```
- **Approval:** Present results to CEO via Friday: "Build and test instructions complete. Ready to proceed to Operations stage?"

---

## OPERATIONS PHASE

**Purpose:** Deployment and monitoring (placeholder for future expansion).

**Current Status:** This phase is a placeholder. When reached:

1. Mark the Construction phase as complete in `aidlc-state.md`.
2. Generate a final workflow summary including:
   - All phases and stages executed (with timestamps)
   - All artifacts generated (with file paths)
   - All delegation requests and their outcomes
   - All approval gates and CEO decisions
   - Total units completed
3. Present the summary to the CEO via Friday.
4. Mark the overall AI-DLC workflow as **COMPLETE** in `aidlc-state.md`.
5. Log the completion in `audit.md`.

**Future Expansion:** The Operations phase will eventually include deployment planning, monitoring/observability setup, incident response procedures, and production readiness checklists.

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
- Never skip a state update — if a stage completes or is skipped, record it immediately.
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
- Log every approval prompt before presenting it.
- Log every delegation request sent and its outcome.
- Use ISO 8601 timestamps.

### Git Operations

Follow the rules in `personal-aidlc/aidlc-rules/aidlc-rule-details/common/git-operations.md`:
- Auto-commit and push `aidlc-docs/` changes after each stage completion.
- Create feature branch from `main` during Workspace Detection.
- Commit messages should reference the AI-DLC stage.

### Delegation Request Format

When requesting specialist work through Friday:

```
[DELEGATION REQUEST]
Target Agent: <Codename from registry>
Task: <Clear, actionable task description>
Input Files: <List of files the agent needs to read>
Expected Deliverable: <What the agent should produce>
Acceptance Criteria: <How to verify the deliverable is correct>
```

### Approval Request Format

When presenting an approval gate to the CEO through Friday:

**Inception stages:**
```
[APPROVAL REQUEST]
Stage: <Stage name>
Summary: <What was produced>
Artifacts: <List of generated files>
Decision Needed: Approve to proceed to [next stage] / Request changes
```

**Construction stages (standardized 2-option):**
```
[APPROVAL REQUEST]
Stage: <Stage name> (Unit: <unit-name>)
Summary: <What was produced>
Artifacts: <List of generated files>
Options:
  1. Request Changes — provide feedback for revision
  2. Continue to Next Stage — approve and proceed
```
