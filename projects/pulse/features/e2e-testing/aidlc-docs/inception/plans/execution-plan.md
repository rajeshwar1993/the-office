# Execution Plan — E2E Testing Infrastructure

## Detailed Analysis Summary

- **Transformation Type**: Infrastructure / Tooling Setup
- **Change Impact**: Additive only — new files and dependencies, no existing code modified
- **Component Relationships**: Two independent test suites (Playwright in pulse-web, Patrol in pulse-app) with no cross-dependencies
- **Risk Assessment**: Low — purely additive, no breaking changes to existing code

## Workflow Visualization

```
INCEPTION                          CONSTRUCTION
┌──────────────┐                  ┌──────────────────┐
│ Workspace    │──── DONE ──────▶ │                  │
│ Detection    │                  │                  │
└──────────────┘                  │                  │
┌──────────────┐                  │  Code Generation │
│ Reverse Eng. │──── SKIPPED      │  (2 Units)       │
└──────────────┘                  │                  │
┌──────────────┐                  │  Unit 1: PW      │
│ Requirements │──── DONE ──────▶ │  Unit 2: Patrol  │
└──────────────┘                  │                  │
┌──────────────┐                  │                  │
│ User Stories │──── SKIPPED      └────────┬─────────┘
└──────────────┘                           │
┌──────────────┐                  ┌────────▼─────────┐
│ App Design   │──── SKIPPED      │  Build & Test    │
└──────────────┘                  └──────────────────┘
┌──────────────┐
│ Units Gen    │──── SKIPPED
└──────────────┘
```

## Stage Decision Rationale

| Stage | Decision | Rationale |
|-------|----------|-----------|
| Workspace Detection | COMPLETED | Brownfield multi-repo identified |
| Reverse Engineering | SKIPPED | Architecture comprehensively documented during research phase |
| Requirements Analysis | COMPLETED | Requirements + verification questions answered |
| User Stories | SKIPPED | Infrastructure setup, not user-facing functionality |
| Workflow Planning | COMPLETED | This document |
| Application Design | SKIPPED | Standard framework setup, no custom architecture needed |
| Units Generation | SKIPPED | Two natural units (Playwright + Patrol) — no complex decomposition needed |

## Construction Approach

Two independent units executed in parallel:

### Unit 1: Playwright Setup (pulse-web)
- Install Playwright + dependencies
- Create `playwright.config.ts`
- Set up `e2e/` directory structure (fixtures, pages, tests, helpers)
- Create FlutterBridge mock fixture
- Create auth storage state helper
- Write sample E2E tests (dashboard, navigation, locale)
- Add NPM scripts

### Unit 2: Patrol Setup (pulse-app)
- Add Patrol dependencies to pubspec.yaml
- Create `patrol.yaml` configuration
- Configure Android native test runner (MainActivityTest.java)
- Configure iOS native test runner (RunnerUITests.swift)
- Set up `integration_test/` directory structure
- Write sample integration tests (splash, auth)
- Add test helpers
