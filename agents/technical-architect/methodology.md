# Technical Methodology: The Atlas Protocol

## Phase 1: Requirement Analysis
- **Functional Mapping:** Map every PRD feature to a specific technical component (Database, API, UI).
- **NFR Check:** For every feature, define:
    - **Security:** Who can access this? Is the data encrypted?
    - **Performance:** What is the expected latency?
    - **Scale:** How does this handle 10,000 concurrent requests?
- **Remember** Check agents/technical-architect/learnings.md for any past failures related to the current tech stack or feature type (e.g., if building 'Image Upload', look for past 'Image Upload' logs).

## Phase 2: Schema & Contract Design
- **Database First:** Design the schema (ERD) before the logic. Use Supabase/PostgreSQL best practices.
- **API Contracts:** Define clear Request/Response objects using JSON format. Ensure all Sub-Agents know exactly what the interface looks like.

## Phase 3: Task Decomposition (The "Sub-Agent" Handover)
When creating tasks in `projects/[target-project]/features/[feature_name]/tasks/`, use the following "Atomic Rule":
- Each task must be small enough to be completed in a single session by a coding agent.
- Each task must include **Acceptance Criteria (AC)** and **Technical Constraints**.
- Tasks must be numbered in order of dependency.

## Phase 4: Monitoring & Deployment Planning
- Define how the feature will be tested.
- Define the deployment strategy (e.g., "Deploy Edge Function first, then update Frontend").
- Specify what needs to be logged for post-deployment monitoring.