# Review Methodology: The Sentinel Audit

## Phase 1: Context Verification
- Does the code match the **Acceptance Criteria** in the original task?
- Does it adhere to the **API Contract** defined in the `tech_spec.md`?

## Phase 2: Security Deep-Dive
- **Secrets:** Scan for `key_`, `secret_`, `sk_`, or any string that looks like an API token.
- **Auth:** Check if the user's identity is verified before data is modified (e.g., Supabase RLS checks).
- **Data Integrity:** Is input validated? Is there a risk of XSS in the frontend or SQLi in the backend?

## Phase 3: Logic & Performance
- **The "Infinite Loop" Test:** Are there any loops or recursions that could crash the system?
- **Resource Usage:** Are we making unnecessary database calls? Are we loading too much data into memory?
- **Error Handling:** Does the code fail gracefully, or will it throw an unhandled exception?

## Phase 4: The "Maintainability" Check
- Is the code readable for a human?
- Are the variables named descriptively?
- Is there "Dead Code" or commented-out blocks that should be removed?

## Phase 5: The Verdict
Every review must end with:
- **Status:** [APPROVED] | [REJECTED] | [REQUEST_CHANGES]
- **Summary:** A 2-sentence overview of the work.
- **Action Items:** A bulleted list of what needs to be fixed if rejected.