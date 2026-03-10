# Code Review Flow

## 1. Overview

This document defines the code review lifecycle for PRs opened by Builder. It complements `shared/git_strategy.md` — branching conventions, commit formats, and PR templates remain there. This file governs **what happens after a PR is opened**.

**Source of truth for PR status:** GitHub (via `gh` CLI). No separate `pull_requests.md` tracker is maintained.

---

## 2. Default Flow: Single Reviewer Pass (Solo Developer)

For solo-developer projects, code review uses a single Reviewer pass without Architect triage.

### The Review Cycle

1. **Builder** completes implementation, opens a PR to the parent feature branch using `gh pr create`.
2. **Reviewer** is invoked to review the PR.
3. **Reviewer** reviews the PR per `security-policy.md` and the review checklist in methodology.
   - **Clean pass:** Reviewer approves the PR. Builder may proceed to the next task.
   - **Issues found:** Reviewer leaves comments on the GitHub PR with specific fix guidance.
4. **Builder** reads Reviewer's comments, pushes fix commits to the PR branch.
5. **Reviewer** re-reviews. Cycle repeats until approved.
6. After 2 failed fix attempts on the same PR, Builder escalates `[STUCK]` to Conductor.

### Agent Roles

| Agent | Responsibility |
|-------|---------------|
| **Builder** | Opens PR, addresses review comments, pushes fixes |
| **Reviewer** | Reviews code quality, security, standards compliance. Approves or requests changes. |
| **Conductor** | Invokes Reviewer when a PR is ready. Surfaces `[SECURITY_ALERT]` and `[STUCK]` to CEO. |

### Rules

- **Sequential processing:** Review one PR at a time. Do not start reviewing the next PR until the current one is approved.
- **Single-instance rule:** Only one Reviewer review at a time.
- **`[STUCK]` rule:** After 2 failed fix attempts, Builder escalates to Conductor. Conductor may attempt once, then escalates to CEO.
- **Security alerts:** If Reviewer finds a critical security flaw, it raises `[SECURITY_ALERT]` to Conductor immediately. Review pauses until CEO acknowledges.

---

## 3. Full Flow: Multi-Agent Review (Team Setting)

For team projects or high-risk changes, the full review cycle adds Architect as a comment triage layer.

### The Review Cycle

1. **Builder** opens PR.
2. **Reviewer** reviews. If clean, approves. If issues found, leaves comments.
3. **Architect** triages Reviewer's comments:
   - **All false positives:** Architect approves the PR.
   - **Genuine issues:** Architect replies with fix guidance. Builder fixes and Reviewer re-reviews.
   - **Deeper architectural issue:** Architect escalates `[TECH_BLOCKER]` to Conductor.
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
| `shared/code_review_flow.md` (this file) | PR review lifecycle, roles in review | Starts at "PR is opened", ends at approval + merge |
| `.claude/skills/review/SKILL.md` | What to check during a review (code review + QA) | Referenced by `/review` skill |
| `.claude/skills/review/security-policy.md` | Security-specific review criteria | Referenced by `/review` skill |
