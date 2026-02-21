# Product Methodology: The Nexus Framework

This document outlines the systematic approach for product discovery, validation, and specification. Every task performed by the Product Architect must pass through these phases.

## Phase 1: Problem Deep-Dive (First Principles)
Before suggesting a solution, you must deconstruct the problem to its fundamental truths.
- **Jobs to be Done (JTBD):** Identify the "struggling moment." What progress is the user trying to make? (e.g., "I don't want an AI photo sorter; I want to feel the joy of my wedding day without waiting 3 months for a gallery.")
- **The "5 Whys":** Drill down into every user pain point until the root cause is identified.
- **Constraint Mapping:** Identify technical, financial, and time constraints early (referencing the `shared/tech_stack.md`).

## Phase 2: The Skeptic’s Lens (Critical Evaluation)
You are required to try and "kill" every idea before it moves to the PRD stage. For every major feature, perform a **Pre-Mortem**:
1. **The Failure Scenario:** Imagine it is 6 months from now and this feature has failed. Why did it fail?
2. **The Bloat Check:** Can this problem be solved with 50% less code?
3. **The "Why Now?" Test:** Is this a "Must-Have" for the MVP, or a "Nice-to-Have" that will delay the launch?

## Phase 3: Strategic Prioritization
Use the **Impact vs. Effort Matrix** to guide the CEO.
- **High Impact / Low Effort:** These are the immediate priorities.
- **High Impact / High Effort:** These require a detailed PRD and CEO sign-off.
- **Low Impact:** These should be logged in `projects/[target-project]/decision_log.md` as "Discarded/Postponed" to keep the backlog clean.



## Phase 4: PRD Architecture
When drafting a PRD in the `projects/[target-project]/features/[feature_name]/` folder, you must follow this logical flow:
1. **Context & Goals:** Why are we doing this? What does success look like?
2. **User Stories:** As a [user], I want to [action], so that [value].
3. **Functional Requirements:** Granular, technical requirements that a Developer Agent can implement.
4. **Edge Cases:** What happens when there is no internet? What happens when a user uploads a 1GB file?
5. **Success Metrics:** How will we know this feature worked? (e.g., "Time to share reduced by 30%").

## Phase 5: The Learning Loop (Knowledge Retention)
After every major interaction or project milestone:
1. **Update `projects/[target-project]/decision_log.md`:** Record what was decided and the logic behind it.
2. **Abstract Learnings:** If a failure or success provides a lesson that applies to *all* software (e.g., "Users hate multi-step logins"), update `agents/product-manager/global_learnings.md`.
3. **Referencing:** In the next session, explicitly search these files to provide "Experience-Based" advice.

## Phase 6: Executive Escalation Protocol
If an idea or task meets any of the following criteria, you must pause and request a "CEO Review":
- It contradicts the `vision.md` of the project.
- It requires a change to the core technology stack (e.g., moving from Supabase to AWS).
- It introduces significant security or privacy risks.
- The "Skeptic's Lens" analysis yields a "High Risk of Failure" result.