# Requirement Verification Questions — AppView Route Restructure

## Intent Analysis
- **Request Type**: Refactoring / Architectural Restructure
- **Scope**: Multiple Components (pulse-web routes + layouts, pulse-app WebView URLs)
- **Complexity**: Moderate
- **Clarity**: Clear intent, some edge cases need clarification

---

## Q1: Which pages should move under `/appview/*`?

Based on the current structure, these pages are loaded inside the Flutter WebView shell:
- `/dashboard`
- `/profile-setup`
- `/connections`
- `/settings`

Should ALL of these move under `/appview/*`?

A) **Yes, all four** — `/appview/dashboard`, `/appview/profile-setup`, `/appview/connections`, `/appview/settings`
B) **Only some** — Specify which ones stay at root level
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Q2: Auth routes placement

The `/auth/callback` and `/auth/error` routes handle OAuth callbacks and error display. Where should these live?

A) **Stay at root level** (`/auth/*`) — Auth is a shared concern, used by both browser and app flows
B) **Move to `/appview/auth/*`** — Auth is only triggered from the Flutter app
C) **Both** — Keep at root AND add appview versions
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Q3: Root landing page (`/`) behavior

Currently `/` is the auth/landing page that redirects authenticated users to `/dashboard`. After restructure:

A) **Keep `/` as auth landing** — Redirect authenticated users to `/appview/dashboard` (when accessed from app) or a new browser dashboard (future)
B) **`/` becomes a marketing/public page** — Separate from auth, with links to sign in
C) **No change to `/`** — It stays as-is, just update the redirect target from `/dashboard` to `/appview/dashboard`
X) Other (please describe after [Answer]: tag below)

[Answer]: C (redirect target updated to /appview/dashboard)

---

## Q4: Browser-accessible versions of app pages

Should dashboard, connections, and settings also be accessible via browser (at root level without `/appview` prefix) now or in the future?

A) **Not now** — Only `/appview/*` versions exist for now; browser pages will be added later as separate implementations
B) **Yes, create browser versions now** — Same components rendered with responsive browser-friendly layouts at root level
C) **Just redirect** — Root-level `/dashboard` etc. redirect to `/appview/dashboard`
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Q5: `/appview` layout characteristics

What specific mobile-specific styles/navigation should the `/appview` layout include?

A) **Minimal shell** — Safe area insets, no browser chrome assumptions, viewport-fit cover, suppressed scroll bounce. Essentially what the current root layout already does for mobile WebView.
B) **Dedicated mobile nav** — Bottom navigation bar, mobile header, back button handling within the WebView
C) **Same as current** — Move the current layout behavior (safe areas, iOS viewport) into `/appview` layout; root layout becomes browser-optimized
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Q6: `window.isReady` and FlutterBridge in `/appview` layout

The current root layout includes `FlutterBridgeListener` for Flutter communication. After restructure:

A) **Move FlutterBridge to `/appview` layout only** — Browser pages don't need Flutter communication
B) **Keep in root layout** — FlutterBridge is harmless in browser and simpler to maintain
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
