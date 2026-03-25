---
name: aidlc-inception
description: "Inception phase for complex features: workspace detection, reverse engineering, requirements, user stories, workflow planning, application design, and units generation. Produces planning artifacts and stops before construction."
user-invocable: true
---

# AI-DLC Inception

Structured inception process that produces planning artifacts for complex features. Runs 7 stages (some conditional), each with an approval gate, then **stops** — no code is written. Use `/build` for implementation after inception completes.

**When to use:** Complex features with multiple components, cross-cutting concerns, unclear requirements, or when the user explicitly requests structured planning.

**When NOT to use:** Bug fixes, simple refactors, single-component features, documentation changes. Use `/build` directly for straightforward work.

---

## The 7 Inception Stages

| # | Stage | Condition | Who |
|---|-------|-----------|-----|
| 1 | Workspace Detection | ALWAYS | Direct |
| 2 | Reverse Engineering | Brownfield only | `/architect` |
| 3 | Requirements Analysis | ALWAYS (adaptive depth) | `/architect` |
| 4 | User Stories | CONDITIONAL (user-facing features) | `/architect` |
| 5 | Workflow Planning | ALWAYS | Direct |
| 6 | Application Design | CONDITIONAL (new components) | `/architect` |
| 7 | Units Generation | CONDITIONAL (multi-unit) | `/architect` |

---

## Pre-Flight

### 1. Determine Project and Feature Names

Before anything else, determine the two values needed for the feature docs directory:

- **`<project-name>`** — The target project repo (e.g., `pulse-web`, `pulse-supabase`). Infer from the user's request or ask if ambiguous.
- **`<feature-name>`** — A short kebab-case name for the feature (e.g., `ghost-calendar`, `user-auth`). Derive from the user's request or ask.

These define the feature docs directory: `docs/<project-name>/<feature-name>/`

### 2. Check for Existing State (Session Resumption)

Scan `docs/` in the workspace root for any existing `aidlc-state.md` files. If the user's request matches an existing feature (by name or description), load that state.

**If found:**
- Parse current phase, stage, and progress.
- Load artifacts from all completed stages (see Smart Context Loading below).
- Present resumption summary:

```
Welcome back. Current status:
- Feature: [identifier]
- Feature Docs: docs/<project-name>/<feature-name>/
- Current Stage: [stage name]
- Last Completed: [last completed stage]
- Next Step: [next action]

Continue where you left off, or review a previous stage?
```

- Resume from the last incomplete stage.

**Smart Context Loading by Stage:**
- Workspace Detection / Reverse Engineering: Load workspace analysis
- Requirements / User Stories: Load RE artifacts + requirements
- Workflow Planning / Application Design / Units Generation: Load all prior artifacts

### 3. Load References

- Read `shared/git_strategy.md` for branch and commit conventions.
- Read the target project's CLAUDE.md (`projects/<project-name>/CLAUDE.md`) for project-specific conventions, tech stack, and architecture. If the project repo doesn't exist yet (greenfield with no repo), skip this — conventions will be established during Requirements Analysis.

### 4. Initialize Feature Docs Structure

All inception artifacts are stored in the **workspace root** (the-office/) under:

```
docs/<project-name>/<feature-name>/
```

Where `<project-name>` is the target project (e.g., `pulse-web`) and `<feature-name>` is the feature being built. This is referred to as the **feature docs directory** throughout this skill.

If no existing state, create:

```
docs/<project-name>/<feature-name>/
├── inception/
│   ├── plans/
│   ├── reverse-engineering/
│   ├── requirements/
│   ├── user-stories/
│   ├── application-design/
│   └── units/
├── aidlc-state.md
└── audit.md
```

Initialize `aidlc-state.md` with the State Management template (below).
Initialize `audit.md` with this initial entry:

```markdown
# Audit Trail — <feature-name>

---

## Inception Started
**Timestamp:** [ISO 8601]
**User Input:** "[Complete raw user input — the original request that triggered inception]"
**AI Response:** "Inception started. Feature docs directory created at docs/<project-name>/<feature-name>/."
**Context:** Pre-Flight initialization

---
```

---

## Stage Execution Flow

For each stage:

1. **Check condition** — Is this stage ALWAYS or CONDITIONAL? If conditional, evaluate whether it applies.
2. **If skipping** — Record skip with rationale in `aidlc-state.md`, proceed to next stage.
3. **Execute** — Follow the detailed instructions in `inception-stages.md`.
4. **Update state** — Mark stage complete in `aidlc-state.md` with timestamp.
5. **Log in audit** — Append completion entry to `audit.md`.
6. **Present results** — Show approval gate to user.
7. **Wait for approval** — Do NOT proceed until user explicitly approves.
8. **Next stage** — Proceed to the next stage.

**Exception:** Stage 1 (Workspace Detection) auto-proceeds without an approval gate.

---

## Delegation to /architect

Stages 2–4 and 6–7 delegate analysis work to `/architect`. Invoke `/architect` using the Skill tool with a prompt that includes all necessary context.

**Context to provide in the prompt:**
- The user's original request (quote exactly)
- Current stage name and what it needs (e.g., "Stage 3: Requirements Analysis — produce a requirements document")
- All relevant artifacts from prior stages (include file contents, not just paths)
- Feature identifier and project name
- Specific deliverables: list each artifact filename, what it should contain, and the target directory (e.g., "Write `requirements.md` to `inception/requirements/` in the feature docs directory")

**Important:** The `/architect` skill produces its own analysis format (PRDs, tech specs, etc.). In your prompt, explicitly ask it to write output directly as the inception artifact files (e.g., `requirements.md`, `architecture.md`) following the templates in `inception-stages.md`, rather than its default format.

**After /architect completes:**
- Verify all expected artifact files were created in the correct directory
- If any artifacts are missing, invoke `/architect` again with a targeted prompt for the missing deliverables
- Present results at the approval gate
- Do not proceed until user approves

---

## Adaptive Depth

When a stage executes, ALL its defined artifacts are created. "Depth" refers to detail level within those artifacts, which adapts to complexity:

| Depth | When | Behavior |
|-------|------|----------|
| Minimal | Clear, simple request | Concise artifacts with essential detail |
| Standard | Normal complexity | Balanced artifacts with functional + NFR coverage |
| Comprehensive | Complex, high-risk, multi-stakeholder | Extensive artifacts with traceability and edge cases |

**Factors:** Request clarity, problem complexity, scope, risk level, available context, user preferences.

**Principle:** Create exactly the detail needed — no more, no less.

---

## Question Format

**Hybrid approach** — conversational for simple, file-based for complex:

### Conversational (1–3 questions)
Ask directly in chat. Use for quick clarifications during any stage.

### File-Based (4+ questions)
Create a question file in the appropriate `inception/` subdirectory within the feature docs directory.

**Format:**
```markdown
## Question [Number]
[Clear, specific question text]

A) [First option]
B) [Second option]
C) [Additional options as needed...]
X) Other (please describe after [Answer]: tag below)

[Answer]:
```

**Rules:**
- Always include "Other" as the last option (MANDATORY)
- Only include meaningful options — don't pad to fill slots
- Minimum 2 meaningful options + Other
- Ask user to fill in all `[Answer]:` tags

### Contradiction Detection (MANDATORY)

After receiving answers, check for:
- **Contradictions:** Logically inconsistent answers (e.g., "bug fix" but "entire codebase affected")
- **Ambiguities:** Vague responses ("mix of", "somewhere between", "not sure", "depends", "probably")
- **Missing detail:** Answers that lack specifics needed for the stage

**If contradictions or ambiguities found:**
- For conversational: Ask targeted follow-up questions
- For file-based: Create a `{stage}-clarification-questions.md` file
- Do NOT proceed until all ambiguities are resolved

---

## Approval Gates

After each stage (except Workspace Detection), present results in this format:

```markdown
## [Stage Name] Complete

[Brief bullet-point summary of what was produced — factual, no workflow instructions]

**Review:** Examine artifacts at `inception/[subdirectory]/` in the feature docs directory

**Options:**
- **Request Changes** — Ask for modifications
- [ONLY at Stage 5+ approval gates] **Add [Stage Name]** — Re-enable a stage marked SKIP in the execution plan (see Re-entering a Skipped Stage)
- **Approve & Continue** — Proceed to [Next Stage Name]
```

**Notes:**
- The "Add [Stage Name]" option is only available AFTER Workflow Planning (Stage 5) has completed, because Stage 5 is where skip/execute decisions are made. Stages 2–4 approval gates should NOT offer to add/remove future stages.
- At Stage 5's approval gate, the user can add or remove any remaining stages (Application Design, Units Generation).
- At Stages 6–7 approval gates, the user can add any remaining skipped stage.

**Rules:**
- Do NOT proceed without explicit user approval
- "Go ahead", "proceed", "approved" count as approval
- Log approval response with timestamp in `audit.md`
- If changes requested: update artifacts, re-present for approval

---

## State Management

Maintain `aidlc-state.md` (in the feature docs directory root) throughout inception:

```markdown
# AI-DLC State

## Feature
- **Identifier:** [feature-id]
- **Description:** [User's original request]
- **Project:** [project-name]
- **Feature Docs:** [docs/<project-name>/<feature-name>/]
- **Started:** [ISO 8601 timestamp]
- **Last Updated:** [ISO 8601 timestamp]

## Current Position
- **Phase:** INCEPTION
- **Stage:** [Current stage name]

## Inception Progress
- [ ] Workspace Detection — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Reverse Engineering — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Requirements Analysis — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] User Stories — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Workflow Planning — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Application Design — [COMPLETED | SKIPPED | PENDING] — [timestamp]
- [ ] Units Generation — [COMPLETED | SKIPPED | PENDING] — [timestamp]

## Workspace State
- **Existing Code:** [Yes/No]
- **Project Type:** [Greenfield/Brownfield]
- **Project Repo Path:** [Absolute path to project repo, e.g., projects/pulse-web]
- **Repositories Involved:** [List or "Current workspace only"]

## Decisions
| Decision | Rationale | User Approved | Timestamp |
|----------|-----------|---------------|-----------|
```

**Update rules:**
- Update in the SAME interaction where work is completed
- Never skip a state update
- Include skip rationale for conditional stages that are skipped
- Add a row to the **Decisions** table when: a conditional stage is skipped or included (with rationale), the user overrides a recommendation, a significant technical choice is made (e.g., tech stack selection), or a skipped stage is re-entered

---

## Audit Trail

Maintain `audit.md` (in the feature docs directory root) as an append-only log:

```markdown
## [Stage Name or Interaction Type]
**Timestamp:** [ISO 8601]
**User Input:** "[Complete raw user input — never summarized]"
**AI Response:** "[Action taken or response summary]"
**Context:** [Stage, action, or decision made]

---
```

**Rules:**
- NEVER overwrite existing entries — append only
- Log EVERY user input with complete raw text
- Log every approval gate prompt and response
- Use ISO 8601 timestamps

---

## Inception Exit

When all 7 stages are complete (executed or skipped):

### Exit Checklist

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

### Exit Actions

1. Verify all checklist items are present. If any missing, report with `[BLOCKER]`.
2. Mark inception phase as COMPLETE in `aidlc-state.md`.
3. Log completion in `audit.md`.
4. Present final summary:

```markdown
## Inception Complete

All inception stages are finished. Summary:
- **Stages Executed:** [list]
- **Stages Skipped:** [list with rationale]
- **Key Artifacts:** [list with file paths]
- **Key Decisions:** [list]

Inception artifacts are ready. Use `/build` when ready to begin construction.
```

5. **STOP.** Do not proceed to construction. Do not invoke `/build`. The user decides when to start building.

---

## Detailed Stage Reference

For complete stage-by-stage instructions (steps, deliverables, templates, conditional logic), see `inception-stages.md` in this skill directory.
