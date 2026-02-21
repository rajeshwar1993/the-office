# Code Generation Plan — AppView Route Restructure

## Unit Context
- **Unit**: Single unit spanning pulse-web and pulse-app repositories
- **Dependencies**: pulse-web routes must be created before pulse-app URL update
- **Approach**: Move existing route files to `/appview/*`, update internal references, split layout

---

## Step-by-Step Plan

### Phase A: pulse-web Route Structure

#### Step 1: Create `/appview` layout
- [x] Create `pulse-web/src/app/appview/layout.tsx`
- Mobile-optimized layout with:
  - `viewportFit: "cover"` viewport export
  - `safe-area-inset` body class
  - `FlutterBridgeListener` component
  - **Not** a root layout — inherits from root `<html>` and `<body>` via `src/app/layout.tsx`
  - Only wraps children with FlutterBridgeListener + mobile-specific wrapper div

#### Step 2: Simplify root layout
- [x] Modify `pulse-web/src/app/layout.tsx`
- Remove `FlutterBridgeListener` import and usage
- Remove `safe-area-inset` class from body
- Remove `viewportFit: "cover"` from viewport export
- Keep: fonts, `NextIntlClientProvider`, `globals.css`, metadata

#### Step 3: Move dashboard route
- [x] Create `pulse-web/src/app/appview/dashboard/page.tsx` (copy from `src/app/dashboard/page.tsx`)
- Update internal redirect from `/profile-setup` → `/appview/profile-setup`
- [x] Delete `pulse-web/src/app/dashboard/page.tsx`

#### Step 4: Move profile-setup route
- [x] Create `pulse-web/src/app/appview/profile-setup/page.tsx` (copy from `src/app/profile-setup/page.tsx`)
- Update `router.push('/dashboard')` → `router.push('/appview/dashboard')`
- [x] Delete `pulse-web/src/app/profile-setup/page.tsx`

#### Step 5: Move connections route
- [x] Create `pulse-web/src/app/appview/connections/page.tsx` (copy from `src/app/connections/page.tsx`)
- No internal route references to update
- [x] Delete `pulse-web/src/app/connections/page.tsx`

#### Step 6: Move settings route
- [x] Create `pulse-web/src/app/appview/settings/page.tsx` (copy from `src/app/settings/page.tsx`)
- Update redirect from `/` — keep as-is (root landing page still at `/`)
- [x] Delete `pulse-web/src/app/settings/page.tsx`

#### Step 7: Move auth routes
- [x] Create `pulse-web/src/app/appview/auth/callback/route.ts` (copy from `src/app/auth/callback/route.ts`)
- Update redirects: `/dashboard` → `/appview/dashboard`, `/profile-setup` → `/appview/profile-setup`, `/auth/error` → `/appview/auth/error`
- [x] Create `pulse-web/src/app/appview/auth/error/page.tsx` (copy from `src/app/auth/error/page.tsx`)
- No internal changes needed (link to `/` stays)
- [x] Delete `pulse-web/src/app/auth/` directory

### Phase B: pulse-web Internal Reference Updates

#### Step 8: Update root page redirects
- [x] Modify `pulse-web/src/app/page.tsx`
- Update `redirect('/dashboard')` → `redirect('/appview/dashboard')`
- Update `redirect('/profile-setup')` → `redirect('/appview/profile-setup')`

#### Step 9: Update component internal links
- [x] Modify `pulse-web/src/components/dashboard/dashboard-content.tsx`
- Update `href="/settings"` → `href="/appview/settings"` (line 94)
- [x] Modify `pulse-web/src/components/settings/settings-page.tsx`
- Update `href="/dashboard"` → `href="/appview/dashboard"` (line 41)

#### Step 10: Update test file references
- [x] Modify `pulse-web/src/components/settings/__tests__/settings-page.test.tsx`
- Update `expect(backLink).toHaveAttribute('href', '/dashboard')` → `expect(backLink).toHaveAttribute('href', '/appview/dashboard')` (line 62)

### Phase C: pulse-app Updates

#### Step 11: Update WebView URL in Flutter
- [x] Modify `pulse-app/lib/features/webview/pulse_webview.dart`
- Update default `dashboardUrl` from `'http://localhost:3000/dashboard'` to `'http://localhost:3000/appview/dashboard'` (line 24)

### Phase D: Verification

#### Step 12: Build verification
- [x] Run `npm run build` in pulse-web — PASS (all routes under /appview/*)
- [x] Run `npx tsc --noEmit` in pulse-web — PASS (no errors)
- [x] Run `npm run lint` in pulse-web — PRE-EXISTING issues only (formatting, SVG a11y)
- [x] Run `npm test` in pulse-web — 43/92 pass; 49 failures are PRE-EXISTING (missing next-intl mocks in dashboard tests)
- [x] Run `flutter analyze` in pulse-app — PRE-EXISTING issues only (mock generation, deprecated APIs)

---

## Files Summary

### New Files (2)
1. `pulse-web/src/app/appview/layout.tsx` — Mobile-optimized layout with FlutterBridge
2. (Route files are moves, not net-new)

### Modified Files (6)
1. `pulse-web/src/app/layout.tsx` — Remove mobile-specific config
2. `pulse-web/src/app/page.tsx` — Update redirect targets
3. `pulse-web/src/components/dashboard/dashboard-content.tsx` — Update settings link
4. `pulse-web/src/components/settings/settings-page.tsx` — Update dashboard link
5. `pulse-web/src/components/settings/__tests__/settings-page.test.tsx` — Update test assertion
6. `pulse-app/lib/features/webview/pulse_webview.dart` — Update WebView URL

### Moved Files (7)
1. `dashboard/page.tsx` → `appview/dashboard/page.tsx`
2. `profile-setup/page.tsx` → `appview/profile-setup/page.tsx`
3. `connections/page.tsx` → `appview/connections/page.tsx`
4. `settings/page.tsx` → `appview/settings/page.tsx`
5. `auth/callback/route.ts` → `appview/auth/callback/route.ts`
6. `auth/error/page.tsx` → `appview/auth/error/page.tsx`

### Deleted Files (7 — originals of moved files)
1. `pulse-web/src/app/dashboard/page.tsx`
2. `pulse-web/src/app/profile-setup/page.tsx`
3. `pulse-web/src/app/connections/page.tsx`
4. `pulse-web/src/app/settings/page.tsx`
5. `pulse-web/src/app/auth/callback/route.ts`
6. `pulse-web/src/app/auth/error/page.tsx`
