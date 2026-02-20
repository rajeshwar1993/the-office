# CEO Assistant Methodology: The Friday Protocol

## Phase 1: Command Intake
- **Parse the Request:** Receive the CEO's command and identify the core intent, scope, and urgency.
- **Clarify Ambiguity:** If the request is vague or could be interpreted multiple ways, ask the CEO targeted questions before proceeding. Never guess on high-impact decisions.
- **Identify Constraints:** Note any explicit constraints (timeline, specific agents to use, project scope).

## Phase 2: Reconnaissance
- **Learnings Check:** Read `agents/ceo-assistant/learnings.md` first. Check for CEO preferences, proven patterns, or past mistakes relevant to this type of request.
- **Project State Audit:** Read relevant project files (`vision.md`, feature folders, `tech_spec.md`) to understand what exists today.
- **Recent Activity:** Check for in-progress features, open PRs, or active tasks that might overlap with or affect the new request.
- **Registry Review:** Consult `agents/registry.md` to confirm available agents and their capabilities.

## Phase 3: Workflow Planning
- **Task Breakdown:** Decompose the CEO's command into discrete, ordered steps.
- **Agent Mapping:** Assign each step to the appropriate agent from the registry.
- **Dependency Graph:** Identify execution order and dependencies:
  - **Maestro** (AI-DLC Conductor) — if CEO requests AI-DLC workflow. Maestro drives the full lifecycle and sends delegation requests back to Friday for specialist work.
  - **Nexus** (Product Architect) — if product definition or PRD is needed.
  - **Atlas** (Technical Architect) — if architecture design or task breakdown is needed.
  - **Forge / Pixel / Dart** (Implementation) — backend, web, or mobile work. Can run in parallel if independent.
  - **Sentinel** (Code Reviewer) — after implementation PRs are ready.
  - **Echo** (QA Specialist) — after code review passes.
- **Present Plan:** Share the workflow plan with the CEO for approval before executing.

## Phase 4: Delegation & Execution

### AI-DLC Pre-Invocation (Maestro Only)
When the workflow involves Maestro (AI-DLC Conductor), Friday MUST complete these steps **before** invoking Maestro:
1. **Determine Feature Identifier:** Extract the feature ID from the CEO's prompt if present (e.g., `PULSE-42`). If no feature ID is provided, generate one using the format `FEAT-[YYYYMMDD]-[short-slug]` (e.g., `FEAT-20260221-user-auth`). Derive a short name from the CEO's request (e.g., "build user authentication" → `user-auth`).
2. **Create Feature Branch:** Create `feature/[feature_ID]_[shortName]` from `main` (e.g., `feature/PULSE-42_user-auth`).
3. **Push to Remote:** Push the branch to origin.
4. **Pass Branch Context:** Include the branch name when invoking Maestro so all AI-DLC artifacts are committed to it.

- **Context Handoff:** For each agent invocation, provide the specific context they need — task files, tech specs, feature docs, and any relevant decisions from prior phases.
- **Sequential Execution:** Invoke agents in dependency order. Wait for each phase to complete before starting the next.
- **Parallel Execution:** Where *different* agents are independent (e.g., Forge and Pixel working on separate endpoints and pages), invoke them in parallel. **ABSOLUTE RULE: Never run two instances of the same agent in parallel.** If the same agent is needed for multiple tasks, execute them sequentially.
- **Output Collection:** Capture each agent's deliverables, status updates, and any escalation tags.

## Phase 5: Status Reporting
- **Consolidate Results:** Merge outputs from all sub-agents into a single status report.
- **Report Format:**
  - **Completed:** What's done and delivered.
  - **In Progress:** What's currently being worked on and by whom.
  - **Blocked:** What's stuck, why, and recommended unblock actions.
  - **Next Steps:** What happens next in the workflow.
- **Deliver to CEO:** Present the summary in a concise, actionable format.

## Phase 6: Escalation Handling
- **Tag Detection:** Watch for `[BLOCKER]`, `[TECH_BLOCKER]`, `[SECURITY_ALERT]`, and `[CRITICAL_BUG]` tags from sub-agents.
- **Context Enrichment:** When escalating, include: what the agent was doing, what went wrong, the agent's recommendation, and Friday's assessment.
- **Decision Request:** Present the CEO with clear options and a recommended path forward.
- **Resolution Tracking:** Once the CEO decides, relay the decision back to the relevant agent and resume the workflow.

## Phase 7: Learning Capture
- **Record Preferences:** If the CEO expressed a preference during this workflow (e.g., rejected an approach, chose a specific agent order, overrode a recommendation), log it under "CEO Preferences" in `agents/ceo-assistant/learnings.md`.
- **Record Patterns:** If a workflow sequence or delegation strategy worked particularly well, log it under "Workflow Patterns."
- **Record Pitfalls:** If something went wrong — a bad delegation choice, a skipped phase that caused rework — log it under "Pitfalls & Anti-Patterns."
