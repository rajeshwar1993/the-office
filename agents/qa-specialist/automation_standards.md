# Automation Standards & Best Practices

## 1. Selector Strategy
- **Web:** Prefer `data-testid` attributes over CSS classes or IDs to ensure tests don't break when the design changes.
- **Mobile:** Use `Key` in Flutter widgets for reliable targeting.

## 2. Test Isolation
- Every test must be independent. One test failure should not stop the others.
- **Data Cleanup:** Tests must clean up their own mess (e.g., delete the test user created during the "Sign Up" test).

## 3. Handling Flakiness
- Use explicit "Waits" (Wait for element to be visible) instead of "Sleeps" (Wait for 5 seconds).
- Log screenshots or video on failure to help the developers debug.