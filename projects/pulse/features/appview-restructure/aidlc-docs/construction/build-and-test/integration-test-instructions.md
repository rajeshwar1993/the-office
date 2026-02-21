# Integration Test Instructions — AppView Route Restructure

## Purpose
Verify the Flutter WebView correctly loads the restructured pulse-web routes and that cross-project communication still works.

## Test Scenarios

### Scenario 1: WebView loads /appview/dashboard
- **Description**: Flutter WebView should load the dashboard at the new /appview/dashboard path
- **Setup**: Start pulse-web dev server (`npm run dev`), run pulse-app on simulator/device
- **Test Steps**:
  1. Launch the Flutter app
  2. Complete splash screen / auth flow
  3. Observe WebView loading
- **Expected Results**: Dashboard renders identically to before; `window.isReady` signal fires; Flutter receives the ready callback
- **Verification**: Check debug console for "Ready signal sent successfully" and "Locale sent to WebView"

### Scenario 2: Profile setup flow with redirect
- **Description**: New users should be redirected from `/` to `/appview/profile-setup`, then after setup redirected to `/appview/dashboard`
- **Setup**: Clear Supabase profile for test user
- **Test Steps**:
  1. Sign in with a user that has no profile
  2. Observe redirect to profile setup
  3. Complete profile setup form
  4. Observe redirect to dashboard
- **Expected Results**: All redirects use `/appview/*` paths; profile creation succeeds; dashboard loads after setup

### Scenario 3: Auth callback redirect
- **Description**: OAuth callback should redirect to `/appview/dashboard` (existing user) or `/appview/profile-setup` (new user)
- **Setup**: Configure OAuth provider in Supabase
- **Test Steps**:
  1. Trigger OAuth sign-in from Flutter
  2. Complete OAuth flow
  3. Observe callback redirect
- **Expected Results**: Callback route at `/appview/auth/callback` processes code and redirects to correct `/appview/*` path

### Scenario 4: FlutterBridge locale sync
- **Description**: Locale changes should sync between Flutter and WebView via FlutterBridge
- **Setup**: App running with WebView loaded
- **Test Steps**:
  1. Change locale from Flutter settings
  2. Observe WebView receives `flutter-locale-changed` event
  3. Change locale from WebView settings
  4. Observe Flutter receives `LOCALE_CHANGED` message
- **Expected Results**: Bidirectional locale sync works as before

### Scenario 5: Navigation between appview pages
- **Description**: Internal navigation between appview pages works correctly
- **Setup**: App running with WebView on dashboard
- **Test Steps**:
  1. Click settings gear icon on dashboard → navigates to `/appview/settings`
  2. Click back arrow on settings → navigates to `/appview/dashboard`
- **Expected Results**: All internal links use `/appview/*` paths

### Scenario 6: Root page behavior
- **Description**: Root `/` page should redirect authenticated users to `/appview/dashboard`
- **Setup**: Navigate directly to `/` in browser
- **Test Steps**:
  1. Access `/` as authenticated user with profile → redirects to `/appview/dashboard`
  2. Access `/` as authenticated user without profile → redirects to `/appview/profile-setup`
  3. Access `/` as unauthenticated user → shows landing page
- **Expected Results**: All redirect targets use `/appview/*` paths

## Manual Verification Checklist
- [ ] Dashboard loads at `/appview/dashboard`
- [ ] Settings loads at `/appview/settings`
- [ ] Connections loads at `/appview/connections`
- [ ] Profile setup loads at `/appview/profile-setup`
- [ ] Auth error shows at `/appview/auth/error`
- [ ] Old routes (`/dashboard`, `/connections`, etc.) return 404
- [ ] FlutterBridge ready signal fires from dashboard
- [ ] Locale sync works bidirectionally
- [ ] Navigation between pages works with `/appview/*` paths
