# Requirements: E2E Testing Infrastructure

## Intent Analysis
- **User Request**: Set up end-to-end testing infrastructure for the Pulse hybrid app (Flutter shell + Next.js WebView)
- **Request Type**: Infrastructure / Tooling Setup
- **Scope Estimate**: Medium-Large (two test frameworks across two repositories)
- **Complexity Estimate**: Medium (framework setup, config, sample tests — no business logic)
- **Depth Level**: Standard

## Objective

Establish a comprehensive E2E testing infrastructure for the Pulse hybrid app using a two-layer approach:
1. **Playwright** for the Next.js web app (pulse-web) — testing the primary UI independently in a browser
2. **Patrol** for the Flutter app (pulse-app) — testing native screens and basic WebView integration

This infrastructure will enable automated validation of user flows across both the web and native layers of the application.

## Scope

### In Scope

| Area | Details |
|------|---------|
| Playwright setup in pulse-web | Install, configure, create test structure, write sample tests |
| Patrol setup in pulse-app | Install, configure, create test structure, write sample tests |
| FlutterBridge mocking | Mock `window.FlutterBridge` in Playwright tests to simulate Flutter messages |
| CI-ready configuration | Tests should be runnable in headless mode for future CI/CD integration |
| Test helper utilities | Shared setup, fixtures, and helpers for common patterns |
| Sample E2E tests | Demonstrate testing patterns for key flows in each layer |

### Out of Scope

| Area | Reason |
|------|--------|
| Appium (Layer 3) | Deferred — evaluate after Layers 1+2 are established |
| CI/CD pipeline setup | Infrastructure only; CI workflows are a separate task |
| Full test coverage | Sample tests to demonstrate patterns; comprehensive coverage is ongoing work |
| Visual regression testing | Can be added later as a Playwright plugin |
| Performance testing | Separate concern from E2E functional testing |
| Cloud test execution (BrowserStack, Sauce Labs) | Future enhancement |

## Functional Requirements

### Layer 1: Playwright (pulse-web)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-1 | Install and configure Playwright | Set up Playwright with TypeScript support in pulse-web |
| FR-1.1 | Browser configuration | Configure Chromium, Firefox, and WebKit (Safari) for cross-browser testing |
| FR-1.2 | Mobile viewport testing | Configure mobile device emulation profiles (iPhone, Android) |
| FR-1.3 | Base URL configuration | Point to local dev server (`localhost:3000`) with configurable base URL |
| FR-2 | Test directory structure | Create organized test structure under `pulse-web/e2e/` or `pulse-web/tests/e2e/` |
| FR-2.1 | Page Object Model | Implement POM pattern for maintainable test code |
| FR-2.2 | Test fixtures | Create shared fixtures for auth state, Supabase mocking, FlutterBridge mocking |
| FR-3 | FlutterBridge mock | Create a mock for `window.FlutterBridge` that simulates Flutter-to-Web communication |
| FR-3.1 | Bridge message simulation | Support sending mock messages: `ready`, `LOCALE_CHANGED`, auth token injection |
| FR-4 | Auth test helpers | Create helpers to set up authenticated state (Supabase session in cookies/localStorage) |
| FR-5 | Sample E2E tests | Write sample tests demonstrating patterns for key flows |
| FR-5.1 | Dashboard load test | Verify dashboard renders with mocked data |
| FR-5.2 | Navigation test | Verify navigation between dashboard, connections, settings |
| FR-5.3 | Locale switching test | Verify language switching via FlutterBridge mock |
| FR-6 | NPM scripts | Add `test:e2e`, `test:e2e:ui`, `test:e2e:headed` scripts to package.json |

### Layer 2: Patrol (pulse-app)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-7 | Install and configure Patrol | Add Patrol dependencies and configure for iOS/Android |
| FR-7.1 | Patrol CLI setup | Install `patrol_cli` and configure `patrol.yaml` |
| FR-7.2 | Native test runners | Configure Android (`MainActivityTest.java`) and iOS (`RunnerUITests`) test targets |
| FR-8 | Test directory structure | Create organized test structure under `pulse-app/integration_test/` |
| FR-8.1 | Test tag organization | Use Patrol test tags to categorize: `@native`, `@webview`, `@smoke` |
| FR-9 | Sample integration tests | Write sample tests for native Flutter screens |
| FR-9.1 | Splash screen test | Verify splash screen renders and transitions |
| FR-9.2 | Auth flow test | Verify OTP auth screen renders and accepts input |
| FR-9.3 | WebView load test | Verify WebView loads and receives ready signal |
| FR-10 | Test configuration | Support test environment configuration (mock Supabase URL, test credentials) |

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Test execution speed (Playwright) | Individual test < 10 seconds, full suite < 2 minutes |
| NFR-2 | Test execution speed (Patrol) | Individual test < 30 seconds, full suite < 5 minutes |
| NFR-3 | Test reliability | Tests should be deterministic — no flaky tests in initial suite |
| NFR-4 | Developer experience | Clear test patterns, good error messages, easy to add new tests |
| NFR-5 | Parallel execution | Playwright tests should support parallel execution out of the box |
| NFR-6 | Headless support | Both frameworks must run in headless/CI mode |
| NFR-7 | Isolation | Tests should not depend on external services; mock all external dependencies |

## NFR Baseline

| Category | Baseline |
|----------|----------|
| Performance | Tests run in reasonable time (see NFR-1, NFR-2) |
| Reliability | Zero flaky tests in initial suite; retry logic for network-dependent tests |
| Maintainability | POM pattern, shared fixtures, clear naming conventions |
| Portability | Tests run on macOS, Linux (CI); no platform-specific hacks |

## Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-1 | `npm run test:e2e` in pulse-web runs Playwright tests successfully in headless mode |
| AC-2 | `npm run test:e2e:headed` in pulse-web runs Playwright tests in headed mode for debugging |
| AC-3 | Playwright tests demonstrate FlutterBridge mocking pattern |
| AC-4 | Playwright tests cover at least one navigation flow and one page render |
| AC-5 | Patrol is installed and configured in pulse-app with native test runners |
| AC-6 | `patrol test` runs at least one integration test on a connected device/emulator |
| AC-7 | Sample Patrol test verifies a native Flutter screen renders correctly |
| AC-8 | Both test suites produce clear pass/fail output with actionable error messages |
| AC-9 | Test directory structures follow conventions documented in each framework's best practices |
| AC-10 | All test dependencies are properly declared in package.json / pubspec.yaml |

## Target File Structure

### pulse-web (Playwright)
```
pulse-web/
├── playwright.config.ts
├── e2e/
│   ├── fixtures/
│   │   ├── base.ts              # Extended test fixture with common setup
│   │   └── flutter-bridge.ts    # FlutterBridge mock fixture
│   ├── pages/
│   │   ├── dashboard.page.ts    # Dashboard page object
│   │   ├── connections.page.ts  # Connections page object
│   │   └── settings.page.ts    # Settings page object
│   ├── tests/
│   │   ├── dashboard.spec.ts    # Dashboard E2E tests
│   │   ├── navigation.spec.ts   # Cross-page navigation tests
│   │   └── locale.spec.ts       # Locale switching tests
│   └── helpers/
│       └── auth.ts              # Auth state helpers
├── package.json                 # Updated with E2E scripts
```

### pulse-app (Patrol)
```
pulse-app/
├── patrol.yaml                          # Patrol CLI configuration
├── integration_test/
│   ├── test_bundle.dart                 # Test entry point
│   ├── tests/
│   │   ├── splash_test.dart             # Splash screen integration test
│   │   ├── auth_test.dart               # Auth flow integration test
│   │   └── webview_test.dart            # WebView load integration test
│   └── helpers/
│       └── test_helpers.dart            # Shared test utilities
├── android/app/src/androidTest/         # Android native test runner
│   └── java/.../MainActivityTest.java
├── ios/RunnerUITests/                   # iOS native test runner
│   └── RunnerUITests.swift
├── pubspec.yaml                         # Updated with Patrol dependencies
```

## Impact Analysis

| Repository | Changes |
|------------|---------|
| pulse-web | New Playwright config, E2E test directory, package.json script updates |
| pulse-app | New Patrol config, integration_test directory, pubspec.yaml updates, native test runner configs |
