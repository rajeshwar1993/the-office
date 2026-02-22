# Claude Code Platform Adapter

This document defines how the agent system and AI-DLC methodology operate under **Claude Code** (conversational LLM with tool calls). It resolves platform mismatches between the original AI-DLC design (built for Amazon Q / Kiro — file-based IDE tools) and Claude Code's interaction model.

**This file is authoritative.** Where conflicts exist, follow this adapter.

---

## 1. Rule Precedence

When rules conflict across layers, follow this precedence (highest first):

1. **Workspace `CLAUDE.md`** — project-level conventions (git, build, tech stack)
2. **`the-office/shared/`** — agent system processes (git strategy, code review, this adapter)
3. **`personal-aidlc/`** — AI-DLC methodology rules (stage workflows, artifact generation)
4. **Individual agent `identity.md`** files

If an AI-DLC rule contradicts a shared process, the shared process wins.

---

## 2. Git Strategy: Single Source of Truth

**Use ONLY** `the-office/shared/git_strategy.md` for all git operations.

The AI-DLC `code-branching.md` (story/task branches with `[TASK-ID]` commits) is **retired**. Ignore it entirely.

| Aspect | Convention |
|--------|-----------|
| Feature branches | `feature/<Feature_ID>_<short-name>` (from `main`) |
| Task branches | `task/<Task_ID>_<short-name>` (from feature branch) |
| Commit format | Scoped conventional commits: `feat(scope): description` |
| Merge strategy | Squash merge only |

The AI-DLC `git-operations.md` rules for auto-committing `aidlc-docs/` are still valid, but commit messages must use the scoped conventional commit format above (e.g., `docs(aidlc): complete requirements analysis`).

---

## 3. Questions: Ask in Conversation

**Override:** AI-DLC `question-format-guide.md` mandates "NEVER ask questions directly in chat" and requires dedicated question files with `[Answer]:` tags.

**Claude Code rule:** Ask questions directly in the conversation. Do not create question files. Users answer in chat, not by editing markdown.

When clarification is needed:
- Ask concise, specific questions directly
- Use numbered lists for multiple questions
- Proceed when the user answers in chat

---

## 4. Retired AI-DLC Rules

The following AI-DLC common rules are **not loaded** under Claude Code:

| Rule File | Reason |
|-----------|--------|
| `common/welcome-message.md` | 112-line ASCII art welcome — wastes context tokens |
| `common/content-validation.md` | Mermaid/ASCII diagram validation — irrelevant in chat output |
| `common/ascii-diagram-standards.md` | ASCII box-drawing rules — not applicable |
| `common/overconfidence-prevention.md` | Merged into core principles (see below) |
| `common/terminology.md` | Glossary — reference on-demand only, not preloaded |
| `construction/code-branching.md` | Retired — use `shared/git_strategy.md` |

### Merged Principle (from overconfidence-prevention.md)

> When requirements are ambiguous, ask clarifying questions before proceeding. Do not make assumptions on high-impact decisions. Balance thoroughness with efficiency — don't artificially inflate simple problems.

---

## 5. Approval Gates: Streamlined

For **low-complexity features** (single unit, clear requirements, low risk):
- **Maximum 2 gates:** After requirements analysis, after code generation
- Skip `aidlc-state.md` and `audit.md` — the conversation history IS the audit trail

For **standard/complex features:**
- Follow the full AI-DLC gate structure as defined in `core-workflow.md`
- CEO may waive gates with brief approval ("go ahead", "proceed")

---

## 6. Agent Communication Model

Maestro may invoke specialist agents **directly** when delegating implementation work during Construction. Friday is not required to relay every message between Maestro and specialists.

**Friday remains the hub for:**
- CEO communication (all status reports and approvals flow through Friday)
- Workflow initiation and completion
- Escalation handling (`[STUCK]`, `[BLOCKER]`, `[SECURITY_ALERT]`)
- Cross-workflow coordination

**Maestro may directly invoke:**
- Atlas, Forge, Pixel, Dart, Sentinel, Echo — for stage-specific delegation during an active AI-DLC workflow

This reduces the delegation chain from 5 hops (CEO -> Friday -> Maestro -> Friday -> Agent) to 3 hops (CEO -> Friday -> Maestro -> Agent).

---

## 7. Code Review: Simplified for Solo Developer

Use the simplified review flow defined in `shared/code_review_flow.md`:
- Single Sentinel review pass (no Atlas triage step for solo developer)
- GitHub PR status is the source of truth (no `pull_requests.md` state machine)
- Review cycle: Coding agent opens PR -> Sentinel reviews -> LGTM or fixes needed

The full multi-agent review cycle (with Atlas triage and `pull_requests.md` tracker) is available for team settings but is not the default.

---

## 8. Context Window Management

Agents must **not** preload all reference files at startup. Instead:

- Load `core-workflow.md` + the current stage's rule file only
- Load other rules on-demand when their content is specifically needed
- Agent identity files should be concise — no model recommendations, temperature settings, or inference style specifications (these are unenforceable in Claude Code)

---

## 9. AI-DLC Light Mode

For features assessed as **low complexity** (single unit, clear scope, minimal risk):

**Execute only:**
1. Requirements Analysis (minimal depth) — ask clarifying questions in chat
2. Code Generation (combined plan + execute) — single delegation to specialist
3. Build and Test — verify the implementation works

**Skip entirely:**
- Workspace Detection, Reverse Engineering, User Stories, Workflow Planning, Application Design, Units Generation
- Functional Design, NFR Requirements, NFR Design, Infrastructure Design
- `aidlc-state.md` and `audit.md` generation

**Approval gates:** Maximum 2 (after requirements, after code)

Light Mode is the default for bug fixes, simple refactors, single-component features, and documentation changes. The CEO or Maestro may escalate to full mode if complexity is discovered mid-execution.
