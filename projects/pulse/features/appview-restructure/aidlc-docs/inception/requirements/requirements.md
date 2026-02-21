# Requirements — AppView Route Restructure

## Intent Analysis

- **User Request**: Restructure pulse-web to segregate pages rendered inside Flutter's WebView shell (`/appview/*`) from pages intended for browser access (root level). Update pulse-app to point to the new `/appview` URLs.
- **Request Type**: Refactoring / Architectural Restructure
- **Scope**: Multiple Components — pulse-web (route structure, layouts) + pulse-app (WebView URL configuration)
- **Complexity**: Moderate — route moves, layout restructuring, cross-project URL updates
- **Depth**: Standard

---

## 1. Objective

Create a clear architectural boundary in pulse-web between pages rendered inside the Flutter WebView shell and pages intended for standalone browser access. All in-app pages move under the `/appview/*` route group with a dedicated mobile-optimized layout, while the root layout becomes browser-optimized for future web-only pages.

---

## 2. Scope

### In Scope

- Move all current app pages to `/appview/*` route group
- Create dedicated `/appview` layout with mobile-specific configuration
- Restructure root layout for browser optimization
- Update pulse-app WebView URL from `/dashboard` to `/appview/dashboard`
- Update all internal navigation references (redirects, links)
- Move FlutterBridgeListener to `/appview` layout exclusively
- Maintain shared component architecture

### Out of Scope

- Creating new browser-accessible pages at root level (future work)
- Changing Supabase session handling or auth flow logic
- Modifying Flutter-WebView communication protocol
- Adding new navigation patterns (bottom nav, mobile header)
- UI/UX redesign of existing pages

---

## 3. Functional Requirements

### FR-1: Route Restructure (pulse-web)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-1.1 | Move dashboard route | `/dashboard` → `/appview/dashboard` |
| FR-1.2 | Move profile-setup route | `/profile-setup` → `/appview/profile-setup` |
| FR-1.3 | Move connections route | `/connections` → `/appview/connections` |
| FR-1.4 | Move settings route | `/settings` → `/appview/settings` |
| FR-1.5 | Move auth routes | `/auth/callback` → `/appview/auth/callback`, `/auth/error` → `/appview/auth/error` |
| FR-1.6 | Keep root landing page | `/` stays as auth landing page |
| FR-1.7 | Update root page redirect | `/` redirect for authenticated users changes from `/dashboard` to `/appview/dashboard` and from `/profile-setup` to `/appview/profile-setup` |

### FR-2: Layout Segregation (pulse-web)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-2.1 | Create `/appview` layout | New `src/app/appview/layout.tsx` with mobile-specific configuration |
| FR-2.2 | Move mobile styles to appview layout | `viewportFit: "cover"`, `safe-area-inset` class, mobile viewport meta from current root layout |
| FR-2.3 | Move FlutterBridgeListener | `FlutterBridgeListener` component moves from root layout to `/appview` layout exclusively |
| FR-2.4 | Simplify root layout | Root layout becomes browser-optimized: standard viewport, no safe-area insets, no FlutterBridge |
| FR-2.5 | Maintain i18n in both layouts | `NextIntlClientProvider` remains in root layout (shared by all routes), fonts remain in root layout |
| FR-2.6 | Maintain global CSS | `globals.css` stays imported in root layout (shared by all routes) |

### FR-3: Internal Navigation Updates (pulse-web)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-3.1 | Update page redirects | All `redirect('/dashboard')` → `redirect('/appview/dashboard')`, etc. |
| FR-3.2 | Update auth callback redirect | OAuth callback route redirect targets updated to `/appview/*` paths |
| FR-3.3 | Update FlutterBridge navigation | Any `FlutterBridge.postMessage` with navigation payloads updated |
| FR-3.4 | Update component internal links | Any `Link` or `router.push` references to moved pages updated |

### FR-4: WebView URL Update (pulse-app)

| ID | Requirement | Details |
|----|-------------|---------|
| FR-4.1 | Update WebView dashboard URL | `http://localhost:3000/dashboard` → `http://localhost:3000/appview/dashboard` in `pulse_webview.dart` |
| FR-4.2 | Update any other WebView URLs | Any hardcoded web URLs in Flutter code updated to `/appview/*` paths |
| FR-4.3 | Update deep link handling | If any deep links reference web paths, update to `/appview/*` |

### FR-5: Shared Components

| ID | Requirement | Details |
|----|-------------|---------|
| FR-5.1 | No component duplication | Components in `src/components/` remain shared between appview and future browser pages |
| FR-5.2 | No service layer changes | Services in `src/lib/services/` remain unchanged |
| FR-5.3 | No Supabase client changes | Supabase clients in `src/lib/supabase/` remain unchanged |

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Zero functional regression | All existing functionality works identically after route moves |
| NFR-2 | Build success | `npm run build` completes without errors in pulse-web |
| NFR-3 | Type safety | `npx tsc --noEmit` passes without errors |
| NFR-4 | Lint compliance | `npm run lint` passes without new warnings |
| NFR-5 | Test pass | All existing tests pass (may need path updates in test mocks) |
| NFR-6 | Flutter build | `flutter analyze` and `flutter build` succeed in pulse-app |
| NFR-7 | No performance impact | Page load times remain unchanged |

---

## 5. NFR Baseline

- **Performance**: Page loads within current baselines (no new network requests introduced)
- **Security**: Supabase session handling unchanged; middleware continues to protect all routes including `/appview/*`
- **Maintainability**: Clear separation of concerns between app-shell pages and browser pages; each has its own layout
- **Testability**: Existing tests updated for new paths; no reduction in coverage

---

## 6. Acceptance Criteria

| AC | Criteria |
|----|----------|
| AC-1 | Navigating to `/appview/dashboard` renders the dashboard page identically to current `/dashboard` |
| AC-2 | Navigating to `/appview/profile-setup` renders profile setup identically to current `/profile-setup` |
| AC-3 | Navigating to `/appview/connections` renders connections page identically to current `/connections` |
| AC-4 | Navigating to `/appview/settings` renders settings page identically to current `/settings` |
| AC-5 | `/appview/auth/callback` handles OAuth callbacks correctly |
| AC-6 | `/appview/auth/error` displays auth errors correctly |
| AC-7 | Root `/` page redirects authenticated users to `/appview/dashboard` |
| AC-8 | Flutter WebView loads `/appview/dashboard` successfully |
| AC-9 | `window.isReady` signal still fires correctly from dashboard to Flutter |
| AC-10 | FlutterBridgeListener only renders on `/appview/*` pages, not on root-level pages |
| AC-11 | Root layout has standard browser viewport (no `viewportFit: "cover"`) |
| AC-12 | `/appview` layout has mobile viewport (`viewportFit: "cover"`, safe-area insets) |
| AC-13 | `npm run build` succeeds |
| AC-14 | `npx tsc --noEmit` passes |
| AC-15 | All existing tests pass |
| AC-16 | Old routes (`/dashboard`, `/connections`, etc.) no longer exist (404) |

---

## 7. Target File Structure (pulse-web)

```
src/app/
├── layout.tsx                    # Root layout (browser-optimized, i18n, fonts, globals.css)
├── globals.css                   # Shared styles
├── page.tsx                      # Landing/auth page (redirect to /appview/dashboard)
├── favicon.ico
│
└── appview/                      # Flutter WebView shell pages
    ├── layout.tsx                # Mobile layout (safe areas, FlutterBridge, viewport-fit)
    ├── dashboard/
    │   └── page.tsx              # Dashboard (moved from /dashboard)
    ├── profile-setup/
    │   └── page.tsx              # Profile setup (moved from /profile-setup)
    ├── connections/
    │   └── page.tsx              # Connections (moved from /connections)
    ├── settings/
    │   └── page.tsx              # Settings (moved from /settings)
    └── auth/
        ├── callback/
        │   └── route.ts          # OAuth callback (moved from /auth/callback)
        └── error/
            └── page.tsx          # Auth error (moved from /auth/error)
```

---

## 8. Impact on pulse-app

| File | Change |
|------|--------|
| `lib/features/webview/pulse_webview.dart` | Update `dashboardUrl` default from `http://localhost:3000/dashboard` to `http://localhost:3000/appview/dashboard` |
| Any other files with hardcoded web URLs | Update to `/appview/*` paths |
