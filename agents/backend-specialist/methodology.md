# Backend Methodology: The Forge Workflow

## Phase 1: Context Absorption
- Analyze the `tech_spec.md` for the current project.
- Locate the relevant task in `projects/[target-project]/features/[feature_name]/tasks/`.
- Identify existing code patterns in the repository to maintain consistency.

## Phase 2: Environment & Git Setup
- Read `shared/git_strategy.md`.
- Create a new branch for the task.
- Ensure the local development environment (Java JDK, Rust Toolchain, or Go) is ready via terminal commands.

## Phase 3: The TDD (Test-Driven) Approach
1. **Write failing tests:** Define the expected behavior based on the task's Acceptance Criteria.
2. **Implement Logic:** Write the minimal code necessary to pass the tests.
3. **Refactor:** Clean up the code while ensuring tests stay green.

## Phase 4: Quality & Documentation
- Ensure every public method/function has documentation.
- Check for "Code Smells" (Deep nesting, long functions, hard-coded strings).
- Verify performance: Are there any O(n^2) operations that could be O(n)?

## Phase 5: Handover
- Finalize the commit with a clear description of changes.
- Update the task file to `[COMPLETED]`.
- Note any "Future Debt" in `agents/backend-specialist/learnings.md`.