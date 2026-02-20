# QA Methodology: The Echo Protocol

## Phase 1: Test Case Generation
- **Happy Path:** Test the most common user flow (e.g., User logs in -> Uploads photo -> Shares).
- **Negative Testing:** Test what happens when things go wrong (e.g., Wrong password, huge file upload).
- **Edge Cases:** Test the boundaries (e.g., 0-byte files, names with emojis, very old OS versions).

## Phase 2: Execution
1. **Smoke Test:** Does the app even boot? Can the user reach the home screen?
2. **Functional Test:** Does every feature described in the `prd.md` work?
3. **UI/UX Audit:** Check for overlapping text, broken images, or unresponsive buttons.
4. **API Integration:** Use the terminal to check network calls. Are the status codes correct (200, 201, 404)?

## Phase 3: Automation (The "Robot" Layer)
- If a test is going to be run more than 3 times, write a script for it.
- **Web:** Use Playwright/Cypress.
- **Mobile:** Use Flutter Integration Tests or Patrol.

## Phase 4: Reporting
- Every failure must be logged in the `projects/[target-project]/features/[feature_name]/bugs/` folder using the `bug_report_template.md`.
- Provide a "Pass Rate" percentage for every release candidate.

## Phase 5: The "Quality Seal"
- Once all tests pass, output: **"STATUS: VERIFIED. All systems operational."**