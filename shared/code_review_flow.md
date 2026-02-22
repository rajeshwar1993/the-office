# Code Review Flow

## 1. Overview

This document defines the code review lifecycle for PRs opened by coding agents (Forge, Pixel, Dart). It complements `shared/git_strategy.md` — branching conventions, commit formats, and PR templates remain there. This file governs **what happens after a PR is opened**.

**Source of truth for PR status:** GitHub (via `gh` CLI). No separate `pull_requests.md` tracker is maintained.

---

## 2. Default Flow: Single Sentinel Review (Solo Developer)

For solo-developer projects, code review uses a single Sentinel pass without Atlas triage.

### The Review Cycle

1. **Coding agent** completes implementation, opens a PR to the parent feature branch using `gh pr create`.
2. **Sentinel** is invoked to review the PR.
3. **Sentinel** reviews the PR per `review_checklist.md` and `security_policy.md`.
   - **Clean pass:** Sentinel approves the PR. Coding agent may proceed to the next task.
   - **Issues found:** Sentinel leaves comments on the GitHub PR with specific fix guidance.
4. **Coding agent** reads Sentinel's comments, pushes fix commits to the PR branch.
5. **Sentinel** re-reviews. Cycle repeats until approved.
6. After 2 failed fix attempts on the same PR, the coding agent escalates `[STUCK]` to Friday.

### Agent Roles

| Agent | Responsibility |
|-------|---------------|
| **Coding agent** (Forge/Pixel/Dart) | Opens PR, addresses review comments, pushes fixes |
| **Sentinel** | Reviews code quality, security, standards compliance. Approves or requests changes. |
| **Friday** | Invokes Sentinel when a PR is ready. Surfaces `[SECURITY_ALERT]` and `[STUCK]` to CEO. |

### Rules

- **Sequential processing:** Review one PR at a time. Do not start reviewing the next PR until the current one is approved.
- **Single-instance rule:** Only one Sentinel review at a time.
- **`[STUCK]` rule:** After 2 failed fix attempts, the coding agent escalates to Friday. Friday may attempt once, then escalates to CEO.
- **Security alerts:** If Sentinel finds a critical security flaw, it raises `[SECURITY_ALERT]` to Friday immediately. Review pauses until CEO acknowledges.

---

## 3. Full Flow: Multi-Agent Review (Team Setting)

For team projects or high-risk changes, the full review cycle adds Atlas as a comment triage layer.

### The Review Cycle

1. **Coding agent** opens PR.
2. **Sentinel** reviews. If clean, approves. If issues found, leaves comments.
3. **Atlas** triages Sentinel's comments:
   - **All false positives:** Atlas approves the PR.
   - **Genuine issues:** Atlas replies with fix guidance. Coding agent fixes and Sentinel re-reviews.
   - **Deeper architectural issue:** Atlas escalates `[TECH_BLOCKER]` to Friday.
4. Cycle repeats until approved.

### When to Use Full Flow

- Multiple contributors on the same codebase
- High-risk changes (auth, payments, data migrations)
- CEO explicitly requests full review

---

## 4. Relationship to Other Documents

| Document | Scope | Boundary |
|----------|-------|----------|
| `shared/git_strategy.md` | Branching model, commit conventions, PR templates, merge rules | Stops at "PR is opened" |
| `shared/code_review_flow.md` (this file) | PR review lifecycle, agent roles in review | Starts at "PR is opened", ends at approval + merge |
| `shared/claude-code-adapter.md` | Declares solo-developer flow as default | Section 7 |
| `agents/code-reviewer/review_checklist.md` | What Sentinel checks during a review | Referenced by Sentinel |
| `agents/code-reviewer/security_policy.md` | Security-specific review criteria | Referenced by Sentinel |
