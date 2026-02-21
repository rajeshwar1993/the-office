# Requirement Verification Questions

## Q1: Playwright Test Directory Location

Where should Playwright E2E tests live in pulse-web?

A) **`e2e/`** — Top-level directory (Playwright convention, separate from unit tests)
B) **`tests/e2e/`** — Under a general tests directory
C) **`src/__e2e__/`** — Co-located within the src directory
X) Other (please describe after [Answer]: tag below)

[Answer]: A — `e2e/` top-level directory

---

## Q2: Patrol Test Scope for Initial Setup

For the initial Patrol setup, which native screens should we write sample integration tests for?

A) **Splash screen only** — Minimal viable test to prove the setup works
B) **Splash + Auth screens** — Cover the two primary native screens (Recommended)
C) **Splash + Auth + WebView load** — Full native-to-web handoff verification
X) Other (please describe after [Answer]: tag below)

[Answer]: B — Splash + Auth screens

---

## Q3: Auth State Management in Playwright Tests

How should Playwright tests handle authenticated state for testing protected pages (dashboard, connections, settings)?

A) **Storage state approach** — Use Playwright's `storageState` to save/restore auth cookies/localStorage (Recommended)
B) **API-based login** — Call Supabase auth API directly in test setup to get real tokens
C) **Mocked auth** — Intercept all Supabase auth requests and return mock responses
X) Other (please describe after [Answer]: tag below)

[Answer]: A — Storage state approach

---

## Q4: Cross-Browser Testing Scope

Which browsers should Playwright be configured to test against?

A) **Chromium only** — Fastest, sufficient for WebView testing since Android WebView is Chromium-based (Recommended)
B) **Chromium + WebKit** — Cover Android + iOS WebView engines
C) **Chromium + Firefox + WebKit** — Full cross-browser coverage
X) Other (please describe after [Answer]: tag below)

[Answer]: A — Chromium only
