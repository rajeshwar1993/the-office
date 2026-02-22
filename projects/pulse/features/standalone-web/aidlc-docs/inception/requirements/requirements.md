# Requirements — Pulse Standalone Web App

## Intent Analysis

- **User Request**: Transform pulse-web into a fully functional standalone website that works in any browser, with browser auth, navigation, feature pages, and manual pulse — while keeping `/appview/*` routes completely unchanged for Flutter WebView integration.
- **Request Type**: Feature Addition (additive layer on existing architecture)
- **Scope**: Single Component — pulse-web (Next.js app)
- **Complexity**: High — new auth flow, layout system, 10+ new pages, new service
- **Depth**: Deep — requires new route group, auth infrastructure, navigation system

---

## 1. Objective

Create a standalone browser experience for Pulse that operates independently of the Flutter app. Browser users can sign up, log in, view their dashboard, manually send pulses, manage connections, and adjust settings — all through standard web pages with proper navigation. The existing `/appview/*` routes remain untouched for Flutter WebView integration.

---

## 2. Scope

### In Scope

- Browser authentication (email/password + Google OAuth)
- Browser layout with navigation header
- Browser versions of all feature pages (dashboard, profile-setup, connections, settings)
- Manual pulse functionality for browser users
- Landing page enhancement with auth CTAs
- Browser-compatible invite flow
- Password reset flow
- Logout functionality
- i18n support for all new strings
- Responsive design (desktop, tablet, mobile browser)

### Out of Scope

- Push notifications (browser) — requires service worker, separate feature
- PWA manifest — separate feature
- Ghost Calendar, reliability badges — not implemented in appview either
- Profile editing — not implemented in appview either
- Dark mode — separate feature
- Social login beyond Google — can be added later
- Flutter app changes — `/appview/*` remains unchanged
- Email template customization — Supabase defaults sufficient
- Analytics/tracking — separate concern

---

## 3. Functional Requirements

### FR-1: Route Structure

| ID | Requirement | Details |
|----|-------------|---------|
| FR-1.1 | Create `(browser)` route group | `src/app/(browser)/` — Next.js parenthesized route group, no URL prefix |
| FR-1.2 | Browser layout | `src/app/(browser)/layout.tsx` — nav header, toast, responsive container |
| FR-1.3 | Browser dashboard route | `/dashboard` via `(browser)/dashboard/page.tsx` |
| FR-1.4 | Browser profile-setup route | `/profile-setup` via `(browser)/profile-setup/page.tsx` |
| FR-1.5 | Browser connections route | `/connections` via `(browser)/connections/page.tsx` |
| FR-1.6 | Browser settings route | `/settings` via `(browser)/settings/page.tsx` |
| FR-1.7 | Login route | `/login` via `(browser)/auth/login/page.tsx` |
| FR-1.8 | Signup route | `/signup` via `(browser)/auth/signup/page.tsx` |
| FR-1.9 | Browser auth callback | `/auth/callback` via `(browser)/auth/callback/route.ts` |
| FR-1.10 | Browser auth error | `/auth/error` via `(browser)/auth/error/page.tsx` |
| FR-1.11 | Forgot password route | `/forgot-password` via `(browser)/auth/forgot-password/page.tsx` |
| FR-1.12 | Reset password route | `/reset-password` via `(browser)/auth/reset-password/page.tsx` |
| FR-1.13 | Invite acceptance route | `/invite` via `(browser)/invite/page.tsx` |
| FR-1.14 | No changes to appview routes | All `/appview/*` routes remain exactly as-is |

### FR-2: Browser Authentication

| ID | Requirement | Details |
|----|-------------|---------|
| FR-2.1 | Email/password login | Login form with email + password fields, validation, error display |
| FR-2.2 | Email/password signup | Registration form with email + password + confirm password |
| FR-2.3 | Google OAuth login | "Continue with Google" button using Supabase OAuth |
| FR-2.4 | Google OAuth signup | Same Google button on signup page |
| FR-2.5 | Password validation | Minimum 8 characters |
| FR-2.6 | Email verification | Supabase sends verification email after signup |
| FR-2.7 | Auth callback handling | `/auth/callback` exchanges code for session, checks profile, redirects to `/dashboard` or `/profile-setup` |
| FR-2.8 | Auth error handling | `/auth/error` displays error with retry link to `/login` |
| FR-2.9 | Forgot password | Email input → `supabase.auth.resetPasswordForEmail()` → success message |
| FR-2.10 | Reset password | New password form → `supabase.auth.updateUser({ password })` → redirect to `/login` |
| FR-2.11 | Logout | `supabase.auth.signOut()` → clear local state → redirect to `/` |
| FR-2.12 | Auth redirect (already authenticated) | Visiting `/login` or `/signup` when authenticated → redirect to `/dashboard` |
| FR-2.13 | Auth redirect (unauthenticated) | Visiting `/dashboard`, `/connections`, `/settings` when unauthenticated → redirect to `/login` |

### FR-3: Browser Layout & Navigation

| ID | Requirement | Details |
|----|-------------|---------|
| FR-3.1 | Navigation header | Fixed top navigation bar with logo, nav links, user menu |
| FR-3.2 | Logo link | Pulse logo links to `/dashboard` (authenticated) or `/` (unauthenticated) |
| FR-3.3 | Nav links | Dashboard, Connections, Settings — shown only when authenticated |
| FR-3.4 | Active state | Current page nav link visually highlighted |
| FR-3.5 | User menu | Avatar + display name dropdown with Settings and Logout options |
| FR-3.6 | Mobile hamburger | Responsive hamburger menu on screens < 768px |
| FR-3.7 | Toast provider | `ToastProvider` included in browser layout (same component as appview) |
| FR-3.8 | Standard viewport | No `viewportFit: cover`, `userScalable` allowed, no safe-area insets |
| FR-3.9 | No FlutterBridge | Browser layout does NOT include `FlutterBridgeListener` |
| FR-3.10 | Content container | Responsive max-width container for page content |

### FR-4: Browser Feature Pages

| ID | Requirement | Details |
|----|-------------|---------|
| FR-4.1 | Dashboard — data fetching | Server Component fetches profile, pulse status, connections (same as appview) |
| FR-4.2 | Dashboard — auth check | Unauthenticated → redirect to `/login` |
| FR-4.3 | Dashboard — profile check | No profile → redirect to `/profile-setup` |
| FR-4.4 | Dashboard — component reuse | Renders same `DashboardContent` component |
| FR-4.5 | Dashboard — no bridge signal | Does NOT send FlutterBridge ready signal |
| FR-4.6 | Dashboard — manual pulse | Shows `PulseButton` when user hasn't pulsed today |
| FR-4.7 | Dashboard — loading state | Loading skeleton while data fetches |
| FR-4.8 | Profile setup — component reuse | Same profile setup form (avatar picker, display name, timezone) |
| FR-4.9 | Profile setup — redirect | On completion → redirect to `/dashboard` (not `/appview/dashboard`) |
| FR-4.10 | Connections — component reuse | Same `ConnectionsPage` component (grid, invite modal, remove) |
| FR-4.11 | Settings — component reuse | Same `SettingsPage` component (language selector) |
| FR-4.12 | Settings — no bridge notify | Does NOT call `notifyFlutterBridge()` |

### FR-5: Manual Pulse

| ID | Requirement | Details |
|----|-------------|---------|
| FR-5.1 | Pulse button | Prominent "Send Pulse" button on browser dashboard |
| FR-5.2 | Pulse button visibility | Shown only when user has NOT pulsed today |
| FR-5.3 | Pulse action | Insert record into `daily_pulses` table via Supabase |
| FR-5.4 | Duplicate prevention | Check if already pulsed before inserting |
| FR-5.5 | Loading state | Button disabled with spinner while sending |
| FR-5.6 | Success feedback | Toast notification "Pulse sent!" |
| FR-5.7 | Dashboard refresh | After pulsing, dashboard refreshes to show active status + wisdom card |

### FR-6: Landing Page

| ID | Requirement | Details |
|----|-------------|---------|
| FR-6.1 | Unauthenticated view | Show Pulse logo, tagline, feature highlights, Login + Sign Up buttons |
| FR-6.2 | Login button | Links to `/login` |
| FR-6.3 | Sign Up button | Links to `/signup` |
| FR-6.4 | Authenticated redirect (with profile) | Redirect to `/dashboard` (changed from `/appview/dashboard`) |
| FR-6.5 | Authenticated redirect (no profile) | Redirect to `/profile-setup` (changed from `/appview/profile-setup`) |

### FR-7: Web Invite Flow

| ID | Requirement | Details |
|----|-------------|---------|
| FR-7.1 | Invite page | `/invite?code=ABC123` — accepts code query param |
| FR-7.2 | Authenticated invite accept | Show invite details, accept button → redirect to `/connections` |
| FR-7.3 | Unauthenticated invite | Redirect to `/login?next=/invite?code=ABC123` → return after auth |
| FR-7.4 | Web invite URL in modal | `InviteModal` shows web URL alongside `pulse://` deep link |

### FR-8: Component Sharing

| ID | Requirement | Details |
|----|-------------|---------|
| FR-8.1 | No component duplication | All feature components in `src/components/` shared between appview and browser |
| FR-8.2 | No service changes | Services in `src/lib/services/` unchanged |
| FR-8.3 | No Supabase client changes | Supabase clients in `src/lib/supabase/` unchanged |
| FR-8.4 | DashboardContent enhancement | Add optional `onPulse` callback prop for manual pulse |
| FR-8.5 | ProfileSetup enhancement | Accept optional `redirectTo` prop (default: `/appview/dashboard`) |

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | Zero regression on `/appview/*` | All WebView routes work identically — no files under `appview/` modified |
| NFR-2 | Build success | `npm run build` completes without errors |
| NFR-3 | Type safety | `npx tsc --noEmit` passes without errors |
| NFR-4 | Lint compliance | `npm run lint` passes without new warnings |
| NFR-5 | Existing tests pass | No regressions in existing test suite |
| NFR-6 | Responsive design | Browser pages functional on desktop (1280px+), tablet (768px+), mobile (320px+) |
| NFR-7 | Accessibility | Auth forms meet WCAG 2.1 AA — proper labels, focus management, error announcements |
| NFR-8 | Performance | Browser pages load within 2s on 3G — no heavy new dependencies |
| NFR-9 | SEO | Landing, login, signup are server-rendered with proper `<title>` and `<meta>` |
| NFR-10 | Security | No new OWASP Top 10 vulnerabilities — proper CSRF, XSS protection, input validation |

---

## 5. NFR Baseline

- **Performance**: Current appview pages load within expected baselines; browser pages should match
- **Security**: Supabase Auth handles token management, PKCE flow for OAuth, RLS on all tables
- **Maintainability**: Components shared between appview and browser; thin page wrappers only
- **Testability**: New components testable with existing Vitest + Testing Library setup

---

## 6. Acceptance Criteria

### Auth
| AC | Criteria |
|----|---------|
| AC-1 | User can sign up with email/password at `/signup` and receives verification email |
| AC-2 | User can log in with email/password at `/login` |
| AC-3 | User can sign in with Google OAuth at `/login` |
| AC-4 | User can request password reset at `/forgot-password` |
| AC-5 | User can set new password at `/reset-password` |
| AC-6 | OAuth callback at `/auth/callback` redirects to `/dashboard` or `/profile-setup` |
| AC-7 | Logout clears session and redirects to `/` |
| AC-8 | Already-authenticated users visiting `/login` or `/signup` redirect to `/dashboard` |

### Browser Pages
| AC | Criteria |
|----|---------|
| AC-9 | `/dashboard` renders dashboard content identically to `/appview/dashboard` |
| AC-10 | `/profile-setup` creates profile and redirects to `/dashboard` |
| AC-11 | `/connections` shows connections, invite modal, remove functionality |
| AC-12 | `/settings` shows language selector and functions correctly |
| AC-13 | Navigation header visible on all authenticated browser pages with correct active states |
| AC-14 | Mobile browser (< 768px) shows hamburger menu instead of horizontal nav |

### Manual Pulse
| AC | Criteria |
|----|---------|
| AC-15 | "Send Pulse" button visible on browser dashboard when not pulsed today |
| AC-16 | Clicking "Send Pulse" creates a `daily_pulses` record in Supabase |
| AC-17 | Dashboard updates to show active status + wisdom card after pulsing |
| AC-18 | Button hidden when user has already pulsed today |

### Zero Regression
| AC | Criteria |
|----|---------|
| AC-19 | `/appview/dashboard` works identically to current behavior |
| AC-20 | `/appview/profile-setup` works identically |
| AC-21 | `/appview/connections` works identically |
| AC-22 | `/appview/settings` works identically |
| AC-23 | `/appview/auth/callback` redirects to `/appview/*` paths (unchanged) |
| AC-24 | FlutterBridge ready signal still fires on `/appview/dashboard` |
| AC-25 | `npm run build` succeeds |
| AC-26 | `npx tsc --noEmit` passes |
| AC-27 | All existing tests pass |

### Landing Page
| AC | Criteria |
|----|---------|
| AC-28 | Unauthenticated user sees landing page with Login + Sign Up buttons |
| AC-29 | Authenticated user with profile redirected to `/dashboard` |
| AC-30 | Authenticated user without profile redirected to `/profile-setup` |

---

## 7. Target File Structure

```
src/app/
├── layout.tsx                              # Root layout — UNCHANGED
├── page.tsx                                # Landing page — MODIFIED (redirect to /dashboard)
├── not-found.tsx                           # 404 — UNCHANGED
│
├── (browser)/                              # Route group (no URL segment)
│   ├── layout.tsx                          # Browser layout (nav header, toast, responsive)
│   ├── dashboard/
│   │   ├── page.tsx                        # Browser dashboard
│   │   └── loading.tsx                     # Loading skeleton
│   ├── profile-setup/
│   │   └── page.tsx                        # Browser profile setup
│   ├── connections/
│   │   └── page.tsx                        # Browser connections
│   ├── settings/
│   │   └── page.tsx                        # Browser settings
│   ├── invite/
│   │   └── page.tsx                        # Invite acceptance
│   └── auth/
│       ├── login/
│       │   └── page.tsx                    # Login page
│       ├── signup/
│       │   └── page.tsx                    # Signup page
│       ├── callback/
│       │   └── route.ts                    # Browser OAuth callback
│       ├── forgot-password/
│       │   └── page.tsx                    # Password reset request
│       ├── reset-password/
│       │   └── page.tsx                    # New password form
│       └── error/
│           └── page.tsx                    # Auth error
│
├── appview/                                # Flutter WebView — COMPLETELY UNCHANGED
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── profile-setup/
│   │   └── page.tsx
│   ├── connections/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── auth/
│       ├── callback/
│       │   └── route.ts
│       └── error/
│           └── page.tsx
│
src/components/
├── browser/                                # NEW — Browser-specific components
│   ├── nav-header.tsx                      # Navigation bar
│   ├── user-menu.tsx                       # Avatar dropdown
│   └── mobile-menu.tsx                     # Hamburger menu
├── auth/                                   # NEW — Auth form components
│   ├── login-form.tsx
│   ├── signup-form.tsx
│   ├── oauth-buttons.tsx
│   ├── forgot-password-form.tsx
│   ├── reset-password-form.tsx
│   └── auth-layout.tsx                     # Centered card layout for auth pages
├── dashboard/
│   ├── ... (existing, unchanged)
│   └── pulse-button.tsx                    # NEW — Manual pulse trigger
├── connections/                            # UNCHANGED
├── settings/                               # UNCHANGED
├── providers/                              # UNCHANGED
├── shared/                                 # UNCHANGED
└── ui/                                     # UNCHANGED
│
src/lib/
├── services/
│   ├── connection-service.ts               # UNCHANGED
│   ├── locale-service.ts                   # UNCHANGED
│   ├── wisdom-service.ts                   # UNCHANGED
│   └── pulse-service.ts                    # NEW — Browser pulse service
├── supabase/                               # UNCHANGED
├── constants.ts                            # UNCHANGED
├── types/                                  # UNCHANGED
└── utils/                                  # UNCHANGED
│
src/messages/
└── en.json                                 # MODIFIED — Add new i18n keys
```

---

## 8. Modified Existing Files

| File | Change | Risk |
|------|--------|------|
| `src/app/page.tsx` | Redirect authenticated users to `/dashboard` instead of `/appview/dashboard`, add Login/Sign Up buttons | Low — landing page only |
| `src/messages/en.json` | Add new i18n keys for auth, nav, pulse, landing | Low — additive only |
| `src/components/dashboard/dashboard-content.tsx` | Add optional `onPulse` callback prop | Low — optional prop, backward compatible |

**No files under `src/app/appview/` are modified.**
