# Code Generation Plan — E2E Testing Infrastructure

## Unit 1: Playwright Setup (pulse-web)

### Phase A: Installation & Configuration

#### Step 1: Install Playwright dependencies
- [x] Run `npm install -D @playwright/test` to add to devDependencies
- [x] Install Playwright browsers (Chromium only per requirements)

#### Step 2: Create playwright.config.ts
- [x] Configure Chromium-only browser project + mobile-chrome viewport
- [x] Set baseURL to `http://localhost:3000`
- [x] Configure test directory as `e2e/tests`
- [x] Set up webServer to start Next.js dev server
- [x] Configure retries, timeout, and reporter

#### Step 3: Update package.json scripts
- [x] Add `test:e2e` — headless Playwright run
- [x] Add `test:e2e:ui` — Playwright UI mode
- [x] Add `test:e2e:headed` — headed mode for debugging

#### Step 4: Add .gitignore entries
- [x] Add Playwright artifacts (test-results/, playwright-report/, blob-report/, e2e/.auth/)

### Phase B: Test Infrastructure

#### Step 5: Create FlutterBridge mock fixture
- [x] Create `e2e/fixtures/flutter-bridge.ts`
- [x] Mock `window.FlutterBridge.postMessage()` — capture messages sent from web to Flutter
- [x] Mock `flutter-locale-changed` event dispatch — simulate Flutter sending locale changes
- [x] Export `FlutterBridgeMock` class with install/getMessages/waitForMessage/sendLocaleChanged

#### Step 6: Create base test fixture
- [x] Create `e2e/fixtures/base.ts`
- [x] Extend Playwright test with FlutterBridge mock auto-installed
- [x] Export `test` and `expect` for all test files to import

#### Step 7: Create auth helpers
- [x] Create `e2e/helpers/auth.ts`
- [x] Helper to set up Supabase auth cookies/localStorage via `setupAuthState()`
- [x] Helper to generate mock storage state via `getMockStorageState()`

#### Step 8: Create page objects
- [x] Create `e2e/pages/dashboard.page.ts` — selectors for greeting, status card, settings link, wisdom card, connection grid
- [x] Create `e2e/pages/connections.page.ts` — selectors for title, add button, connection grid, invite modal, loading spinner
- [x] Create `e2e/pages/settings.page.ts` — selectors for title, back link, language section

### Phase C: Sample Tests

#### Step 9: Write dashboard tests
- [x] Create `e2e/tests/dashboard.spec.ts`
- [x] Test: dashboard page loads with greeting
- [x] Test: status card is visible
- [x] Test: FlutterBridge ready signal is sent on load
- [x] Test: settings link navigates to settings page
- [x] Test: shows connections when mock data is enabled

#### Step 10: Write navigation tests
- [x] Create `e2e/tests/navigation.spec.ts`
- [x] Test: navigate from dashboard to settings and back
- [x] Test: navigate directly to connections page
- [x] Test: navigate directly to settings page

#### Step 11: Write locale tests
- [x] Create `e2e/tests/locale.spec.ts`
- [x] Test: FlutterBridge locale change event is received by the app
- [x] Test: FlutterBridge mock captures outgoing messages

---

## Unit 2: Patrol Setup (pulse-app)

### Phase D: Installation & Configuration

#### Step 12: Add Patrol dependencies to pubspec.yaml
- [x] Add `patrol: ^4.1.1` to dev_dependencies
- [x] Add `integration_test` SDK dependency
- [x] Run `flutter pub get` — resolved successfully

#### Step 13: Create patrol configuration in pubspec.yaml
- [x] Configure app_name: Pulse
- [x] Set Android package_name: com.pulse.pulse_app
- [x] Set iOS bundle_id: com.pulse.pulseApp

#### Step 14: Configure Android native test runner
- [x] Create `android/app/src/androidTest/java/com/pulse/pulse_app/MainActivityTest.java`
- [x] Set up PatrolJUnitRunner with Parameterized test cases
- [x] Add `testInstrumentationRunner` and `clearPackageData` to build.gradle.kts

#### Step 15: Configure iOS native test runner
- [x] Create `ios/RunnerUITests/RunnerUITests.swift`
- [x] Note: RunnerUITests target needs to be added in Xcode manually

### Phase E: Test Infrastructure & Sample Tests

#### Step 16: Create test entry point and helpers
- [x] Create `integration_test/test_bundle.dart` — imports and runs all test files
- [x] Create `integration_test/helpers/test_helpers.dart` — createTestApp() with ProviderScope

#### Step 17: Write splash screen integration test
- [x] Create `integration_test/tests/splash_test.dart`
- [x] Test: splash screen renders with Pulse branding
- [x] Test: splash screen shows heartbeat animation

#### Step 18: Write auth screen integration test
- [x] Create `integration_test/tests/auth_test.dart`
- [x] Test: auth screen renders with email input and sign-in options
- [x] Test: email input accepts text

---

## Files Summary

| Type | Count | Files |
|------|-------|-------|
| New files (pulse-web) | 8 | playwright.config.ts, e2e/fixtures/{flutter-bridge,base}.ts, e2e/helpers/auth.ts, e2e/pages/{dashboard,connections,settings}.page.ts, e2e/tests/{dashboard,navigation,locale}.spec.ts |
| Modified files (pulse-web) | 2 | package.json, .gitignore |
| New files (pulse-app) | 5 | MainActivityTest.java, RunnerUITests.swift, test_bundle.dart, test_helpers.dart, splash_test.dart, auth_test.dart |
| Modified files (pulse-app) | 2 | pubspec.yaml, build.gradle.kts |

## Verification Results

### pulse-web
- `npx tsc --noEmit` — PASS (no type errors)
- `npx playwright test --list` — PASS (20 tests discovered across 3 files × 2 browser projects)
- Chromium browser installed successfully

### pulse-app
- `flutter pub get` — PASS (patrol 4.1.1 + patrol_finders 3.1.0 resolved)
- `flutter analyze integration_test/` — PASS (no issues found)
- `patrol doctor` — PASS (CLI v4.1.0, Flutter 3.38.9 detected)
- `patrol_cli` globally activated (v4.1.0)
