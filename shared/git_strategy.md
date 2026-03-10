# Git Branching & Commit Strategy

This document defines the branching model, commit conventions, and PR workflow for all projects in this workspace.

---

## 1. Branch Hierarchy

```
main
 └── feature/F001_auth-flow          (created from main)
      ├── task/T001_login-screen      (created from feature branch)
      ├── task/T002_signup-screen      (created from feature branch)
      └── task/T003_otp-verification   (created from feature branch)
```

| Branch | Created From | PR Target | Purpose |
|--------|-------------|-----------|---------|
| `main` | — | — | Production-ready code. Protected; no direct commits. |
| `feature/<Feature_ID>_<short-name>` | `main` | `main` | Groups all work for a single feature. |
| `task/<Task_ID>_<short-name>` | Parent feature branch | Parent feature branch | A single unit of work within a feature. |

- Multiple task branches can exist per feature; each PRs into its parent feature branch.
- Feature branches are merged into `main` only when all tasks are complete and reviewed.

## 2. Branch Naming

- **Feature:** `feature/F001_auth-flow`
- **Task:** `task/T001_login-screen`
- IDs must match identifiers from the project's `docs/features/` directory and task files.
- Use lowercase kebab-case for the short name.

## 3. Commit Messages — Scoped Conventional Commits

### Format

```
type(scope): description
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `chore` | Build, config, dependency updates |

### Scope

The scope should be the feature area or component (e.g., `auth`, `dashboard`, `pulse`, `webview`, `migrations`).

### Examples

```
feat(auth): add email OTP login screen
fix(dashboard): correct pulse day calculation at midnight
refactor(webview): extract bridge message handler
test(pulse): add unit tests for auto-pulse service
docs(migrations): add inline comments to RLS policies
chore(deps): bump supabase-flutter to 2.x
```

## 4. PR Workflow

### Task PR (task branch → feature branch)

1. Agent pushes task branch and opens a PR targeting the parent feature branch.
2. PR title: `[Task_ID] Short description` (e.g., `[T001] Add login screen`).
3. PR description must follow the **PR Template** above.
4. Reviewer reviews and approves or requests changes.
5. On approval, **squash merge** into the feature branch.

### Feature PR (feature branch → main)

1. Once all task PRs are merged, the feature owner opens a PR targeting `main`.
2. PR title: `[Feature_ID] Feature name` (e.g., `[F001] Auth Flow`).
3. PR description must follow the **PR Template** above.
4. Reviewer reviews the integrated feature.
5. On approval, **squash merge** into `main`.

### PR Template

Use the following template for all PR descriptions:

```markdown
## Summary
- <brief bullet point describing a change>
- <brief bullet point describing another change>

## Linked Item
- **Task/Feature ID:** [ID]

## Testing
- <what was tested and how>
```

### Merge Rules

- All merges use **squash merge** to keep history clean.
- Never force-push to `main`.
- Delete the source branch after merge.

## 5. Role Responsibilities

### Architect

- Creates the **feature branch** from `main` when defining a feature's tech spec and tasks.
- Ensures the feature branch name follows the naming convention.

### Builder

- Creates a **task branch** from the parent feature branch before starting work.
- Commits frequently using scoped conventional commits.
- Opens a PR from the task branch to the feature branch when work is complete.
- Addresses review feedback from Reviewer promptly.

### Reviewer

- Reviews all PRs (task → feature, feature → main).
- Verifies commit messages follow conventions.
- Verifies branch naming and PR descriptions.
- Approves or requests changes; gates all merges.

---

## Quick Reference

```bash
# Create a feature branch
git checkout main && git pull
git checkout -b feature/F001_auth-flow

# Create a task branch from feature
git checkout feature/F001_auth-flow && git pull
git checkout -b task/T001_login-screen

# Commit
git commit -m "feat(auth): add email OTP login screen"

# Push and open PR (task → feature)
git push -u origin task/T001_login-screen
# Open PR targeting feature/F001_auth-flow
```
