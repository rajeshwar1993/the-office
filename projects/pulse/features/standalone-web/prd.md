# PRD: Pulse Standalone Web App

## 1. Overview

### What
Transform pulse-web from a WebView-only app into a fully functional standalone website that works in any browser, while keeping the existing `/appview/*` routes unchanged for the Flutter WebView integration.

### Why
- **Broader reach**: Users can access Pulse from any device with a browser — desktop, tablet, or mobile browser — without installing the Flutter app.
- **Faster iteration**: Web features can be developed, tested, and shipped without Flutter build cycles.
- **SEO & discoverability**: A standalone website enables organic discovery, marketing landing pages, and social sharing.
- **Reduced friction**: New users can try Pulse immediately in their browser before committing to an app install.

### Guiding Principle
**Zero regression on `/appview/*`**. Every existing WebView route, component, and behavior must remain untouched. The standalone web is an additive layer that reuses the same shared components and services.

---

## 2. Current State

### Route Structure
```
src/app/
├── layout.tsx              # Root layout (i18n, fonts, metadata)
├── page.tsx                # Landing page (redirects auth users → /appview/dashboard)
├── not-found.tsx           # 404
└── appview/                # WebView-only pages
    ├── layout.tsx          # Mobile layout (FlutterBridge, safe-area, viewport-fit)
    ├── dashboard/page.tsx  # Dashboard (Server Component)
    ├── profile-setup/page.tsx  # Profile setup (Client Component)
    ├── connections/page.tsx    # Connections (Client Component)
    ├── settings/page.tsx      # Settings (Server Component)
    └── auth/
        ├── callback/route.ts  # OAuth callback → /appview/dashboard
        └── error/page.tsx     # Auth error display
```

### Key Limitations for Standalone Use
1. **No browser auth**: Landing page says "Use the mobile app to sign in" — no login/signup forms exist.
2. **No browser pages**: All feature pages live under `/appview/` with mobile-specific layout (safe-area, no-zoom, FlutterBridge).
3. **No browser navigation**: No header, sidebar, or navigation bar — Flutter provides native navigation.
4. **No manual pulse**: Auto-pulse is handled by Flutter's `PulseService` on splash. Browser users have no way to pulse.
5. **No logout**: Logout is handled by Flutter natively. No logout UI exists in the web app.
6. **Redirect to appview**: The root `/` page redirects authenticated users to `/appview/dashboard`, which is mobile-optimized.

### What Already Works for Standalone
1. **Shared components**: All UI components (`src/components/`) are framework-agnostic — they don't depend on FlutterBridge.
2. **Services**: `ConnectionService`, `LocaleService`, `WisdomService` work in any browser context.
3. **Supabase clients**: Both server and browser clients work independently of Flutter.
4. **Middleware/proxy**: Session refresh works for all routes, not just `/appview/*`.
5. **i18n**: `next-intl` is configured at the root layout level — available to all routes.
6. **FlutterBridge is optional**: All bridge calls already check `if (window.FlutterBridge)` before executing.

---

## 3. Target Architecture

### Route Structure
```
src/app/
├── layout.tsx                    # Root layout (i18n, fonts, metadata) — UNCHANGED
├── page.tsx                      # Landing page — MODIFIED (smart redirect)
├── not-found.tsx                 # 404 — UNCHANGED
│
├── (browser)/                    # Route group for browser pages (no URL segment added)
│   ├── layout.tsx                # Browser layout (nav header, toast, responsive)
│   ├── dashboard/
│   │   ├── page.tsx              # Browser dashboard
│   │   └── loading.tsx           # Loading skeleton
│   ├── profile-setup/
│   │   └── page.tsx              # Browser profile setup
│   ├── connections/
│   │   └── page.tsx              # Browser connections
│   ├── settings/
│   │   └── page.tsx              # Browser settings
│   └── auth/
│       ├── login/
│       │   └── page.tsx          # Login page
│       ├── signup/
│       │   └── page.tsx          # Signup page
│       ├── callback/
│       │   └── route.ts          # Browser OAuth callback
│       ├── forgot-password/
│       │   └── page.tsx          # Password reset request
│       ├── reset-password/
│       │   └── page.tsx          # Password reset form
│       └── error/
│           └── page.tsx          # Auth error page
│
├── appview/                      # WebView pages — COMPLETELY UNCHANGED
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── profile-setup/page.tsx
│   ├── connections/page.tsx
│   ├── settings/page.tsx
│   └── auth/
│       ├── callback/route.ts
│       └── error/page.tsx
│
└── ...
```

### Key Architecture Decisions

**Route group `(browser)/`**: Uses Next.js parenthesized route groups so browser pages are accessible at `/dashboard`, `/connections`, etc. without a URL prefix. This keeps URLs clean while providing a shared browser layout.

**Separate layouts**: The `(browser)/layout.tsx` includes a navigation header, toast provider, and responsive container — optimized for desktop/tablet/mobile browser. The `appview/layout.tsx` remains unchanged with FlutterBridge, safe-area insets, and fixed viewport.

**Shared components**: Both `(browser)/*` and `appview/*` pages import the same components from `src/components/`. The page files are thin wrappers — they fetch data, check auth, and render the shared component.

**Separate auth flows**: Browser auth (email/password + OAuth) is independent from Flutter auth. Each has its own callback handler redirecting to the appropriate route prefix.

---

## 4. Feature Requirements

### FR-1: Browser Authentication

#### FR-1.1: Login Page (`/login`)
- Email/password login form with validation
- "Sign in with Google" OAuth button (Supabase Auth)
- "Forgot password?" link to `/forgot-password`
- "Don't have an account? Sign up" link to `/signup`
- Redirect to `/dashboard` on success (or `/profile-setup` if no profile)
- Show error messages for invalid credentials
- Already-authenticated users visiting `/login` redirect to `/dashboard`

#### FR-1.2: Signup Page (`/signup`)
- Email/password registration form
- Password strength requirements (min 8 chars)
- "Sign up with Google" OAuth button
- "Already have an account? Log in" link to `/login`
- Email confirmation flow (Supabase sends verification email)
- Redirect to `/profile-setup` after email verification
- Already-authenticated users visiting `/signup` redirect to `/dashboard`

#### FR-1.3: Browser Auth Callback (`/auth/callback`)
- Handles OAuth redirect from Supabase
- Exchanges auth code for session
- Checks profile existence:
  - Has profile → redirect to `/dashboard`
  - No profile → redirect to `/profile-setup`
- Error → redirect to `/auth/error`
- **Note**: This is separate from `/appview/auth/callback` which redirects to `/appview/*` paths

#### FR-1.4: Forgot Password (`/forgot-password`)
- Email input to request password reset
- Calls `supabase.auth.resetPasswordForEmail()`
- Success message: "Check your email for a reset link"
- Link back to login

#### FR-1.5: Reset Password (`/reset-password`)
- New password form (password + confirm password)
- Handles the reset token from email link
- Calls `supabase.auth.updateUser({ password })`
- Redirect to `/login` on success

#### FR-1.6: Logout
- Logout button in navigation header (user menu dropdown)
- Calls `supabase.auth.signOut()`
- Redirect to `/` after sign out
- Clear any local state (localStorage, sessionStorage)

#### FR-1.7: Auth Error Page (`/auth/error`)
- Displays authentication error with clear message
- Link to retry login (`/login`)
- Link to go home (`/`)

### FR-2: Browser Layout & Navigation

#### FR-2.1: Browser Layout (`(browser)/layout.tsx`)
- Navigation header at the top
- Toast notification provider (same `ToastProvider` used in appview)
- Responsive container with max-width for content
- Standard browser viewport (no `viewportFit: cover`, user-scalable allowed)
- **No FlutterBridge listener** (browser doesn't need it)

#### FR-2.2: Navigation Header Component
- **Logo**: Pulse logo (links to `/dashboard` when authenticated, `/` when not)
- **Nav links** (authenticated only):
  - Dashboard (`/dashboard`)
  - Connections (`/connections`)
  - Settings (`/settings`)
- **User menu** (authenticated only):
  - User avatar + display name
  - Dropdown with: Settings, Logout
- **Mobile responsive**: Hamburger menu on small screens
- **Active state**: Current page link highlighted

#### FR-2.3: Footer Component (Optional — Phase 2)
- Minimal footer with copyright, links to terms/privacy
- Not required for initial launch

### FR-3: Browser Feature Pages

#### FR-3.1: Browser Dashboard (`/dashboard`)
- **Server Component** (same pattern as `/appview/dashboard`)
- Auth check: unauthenticated → redirect to `/login`
- Profile check: no profile → redirect to `/profile-setup`
- Fetch pulse status and connections from Supabase
- Render `DashboardContent` component (same as appview)
- **Difference from appview**: No FlutterBridge ready signal sent
- **Addition**: Manual pulse button (see FR-4)

#### FR-3.2: Browser Profile Setup (`/profile-setup`)
- Same `ProfileSetup` component (avatar picker, display name, timezone)
- Auth check: unauthenticated → redirect to `/login`
- On completion: redirect to `/dashboard` (not `/appview/dashboard`)
- **Same form, same Supabase insert, different redirect target**

#### FR-3.3: Browser Connections (`/connections`)
- Same `ConnectionsPage` component (connection grid, invite modal, remove)
- Auth check: handled by service layer (Supabase `getUser()`)
- **Invite sharing**: QR code + deep link still work. Browser users can also share a web URL for invites (not just `pulse://` deep link)

#### FR-3.4: Browser Settings (`/settings`)
- Same `SettingsPage` component (language selector)
- Auth check: unauthenticated → redirect to `/login`
- **Difference from appview**: No `notifyFlutterBridge()` call needed
- **Addition**: Logout button (in nav header, not settings page itself)

### FR-4: Manual Pulse (Browser)

#### FR-4.1: Pulse Button on Dashboard
- When user has NOT pulsed today: show a prominent "Send Pulse" button
- On click: insert record into `daily_pulses` table via Supabase
- After pulsing: refresh dashboard to show active status + wisdom card
- Button disabled while sending (loading state)
- Success toast: "Pulse sent!"

#### FR-4.2: Pulse Service (Browser)
- New browser-compatible pulse function (or extend existing service)
- Checks if user has already pulsed today (prevent duplicates)
- Inserts `daily_pulses` record with current timestamp
- Returns success/failure

### FR-5: Landing Page Updates

#### FR-5.1: Smart Landing Page (`/`)
- **Unauthenticated**: Show enhanced landing page with:
  - Pulse logo and tagline
  - Brief feature highlights (1-3 bullet points)
  - "Get Started" / "Log In" buttons → `/login`
  - "Sign Up" button → `/signup`
- **Authenticated (with profile)**: Redirect to `/dashboard`
- **Authenticated (no profile)**: Redirect to `/profile-setup`
- **Note**: No longer redirects to `/appview/*` — browser users stay in browser routes

#### FR-5.2: Landing Page i18n
- Add new i18n strings for landing page CTA buttons
- Reuse existing `common.appName`, `common.tagline` strings

### FR-6: Middleware Updates

#### FR-6.1: Session Refresh
- Existing `proxy.ts` middleware already refreshes sessions for ALL routes
- **No changes needed** — it uses a matcher that covers all non-static routes

#### FR-6.2: Auth Protection (per-page)
- Each browser page handles its own auth check (same pattern as appview pages)
- Unauthenticated users on browser pages → redirect to `/login` (not `/`)
- Unauthenticated users on appview pages → redirect to `/` (unchanged)

### FR-7: Invite Link Handling (Browser)

#### FR-7.1: Web Invite URL
- Currently invites use `pulse://invite?code=ABC123` (deep link)
- Add a web-compatible invite URL: `/invite?code=ABC123`
- If authenticated: accept invite and redirect to `/connections`
- If not authenticated: redirect to `/login?next=/invite?code=ABC123` (preserve intent)
- After login, redirect back to accept the invite

#### FR-7.2: Invite Page (`/invite`)
- Accepts `code` query parameter
- Shows invite details (who invited, etc.)
- Accept/decline buttons
- Redirect to `/connections` after accepting

---

## 5. Component Reuse Strategy

The key to this feature is maximum reuse. Here's what's shared vs. new:

### Shared (No Changes)
| Component/Service | Location | Used By |
|---|---|---|
| `DashboardContent` | `components/dashboard/dashboard-content.tsx` | Both `/appview/dashboard` and `/dashboard` |
| `StatusCard` | `components/dashboard/status-card.tsx` | Both dashboards |
| `ConnectionGrid` (dashboard) | `components/dashboard/connection-grid.tsx` | Both dashboards |
| `ConnectionCard` (dashboard) | `components/dashboard/connection-card.tsx` | Both dashboards |
| `WisdomCard` | `components/dashboard/wisdom-card.tsx` | Both dashboards |
| `ConnectionGrid` (connections) | `components/connections/connection-grid.tsx` | Both connections pages |
| `ConnectionCard` (connections) | `components/connections/connection-card.tsx` | Both connections pages |
| `InviteModal` | `components/connections/invite-modal.tsx` | Both connections pages |
| `EmptyConnectionsView` | `components/shared/empty-connections-view.tsx` | Both |
| `SettingsPage` | `components/settings/settings-page.tsx` | Both settings pages |
| `LanguageSelector` | `components/settings/language-selector.tsx` | Both settings pages |
| All UI components | `components/ui/*` | Both |
| `ToastProvider` | `components/providers/toast-provider.tsx` | Both layouts |
| `ConnectionService` | `lib/services/connection-service.ts` | Both |
| `LocaleService` | `lib/services/locale-service.ts` | Both |
| `WisdomService` | `lib/services/wisdom-service.ts` | Both |
| Supabase clients | `lib/supabase/*` | Both |
| Constants | `lib/constants.ts` | Both |
| Logger | `lib/utils/logger.ts` | Both |
| `formatRelativeTime` | `lib/utils/format-date.ts` | Both |

### New Components
| Component | Location | Purpose |
|---|---|---|
| `NavHeader` | `components/browser/nav-header.tsx` | Browser navigation bar |
| `UserMenu` | `components/browser/user-menu.tsx` | Avatar dropdown (settings, logout) |
| `MobileMenu` | `components/browser/mobile-menu.tsx` | Hamburger menu for mobile browser |
| `LoginForm` | `components/auth/login-form.tsx` | Email/password login form |
| `SignupForm` | `components/auth/signup-form.tsx` | Registration form |
| `OAuthButtons` | `components/auth/oauth-buttons.tsx` | Google/Apple sign-in buttons |
| `ForgotPasswordForm` | `components/auth/forgot-password-form.tsx` | Password reset request |
| `ResetPasswordForm` | `components/auth/reset-password-form.tsx` | New password form |
| `PulseButton` | `components/dashboard/pulse-button.tsx` | Manual pulse trigger for browser |
| `AuthLayout` | `components/auth/auth-layout.tsx` | Shared layout for auth pages (centered card) |

### New Pages (Thin Wrappers)
| Page | Location | Imports |
|---|---|---|
| Browser layout | `app/(browser)/layout.tsx` | `NavHeader`, `ToastProvider` |
| Browser dashboard | `app/(browser)/dashboard/page.tsx` | `DashboardContent`, `PulseButton` |
| Browser profile setup | `app/(browser)/profile-setup/page.tsx` | Same profile setup component |
| Browser connections | `app/(browser)/connections/page.tsx` | Same connections page component |
| Browser settings | `app/(browser)/settings/page.tsx` | `SettingsPage` |
| Login | `app/(browser)/auth/login/page.tsx` | `LoginForm`, `OAuthButtons` |
| Signup | `app/(browser)/auth/signup/page.tsx` | `SignupForm`, `OAuthButtons` |
| Auth callback | `app/(browser)/auth/callback/route.ts` | Supabase server client |
| Auth error | `app/(browser)/auth/error/page.tsx` | UI components |
| Forgot password | `app/(browser)/auth/forgot-password/page.tsx` | `ForgotPasswordForm` |
| Reset password | `app/(browser)/auth/reset-password/page.tsx` | `ResetPasswordForm` |

### Modified Files
| File | Change |
|---|---|
| `app/page.tsx` | Redirect to `/dashboard` instead of `/appview/dashboard` |
| `messages/en.json` | Add new i18n keys for auth pages, nav, pulse button, landing CTA |
| `components/dashboard/dashboard-content.tsx` | Accept optional `onPulse` callback prop for manual pulse |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Zero regression on `/appview/*` | All WebView routes work identically |
| NFR-2 | Build success | `npm run build` passes |
| NFR-3 | Type safety | `npx tsc --noEmit` passes |
| NFR-4 | Lint compliance | `npm run lint` passes |
| NFR-5 | Existing tests pass | No regressions in existing test suite |
| NFR-6 | Responsive design | Browser pages work on desktop (1280px+), tablet (768px+), and mobile browser (320px+) |
| NFR-7 | Accessibility | Auth forms meet WCAG 2.1 AA (labels, focus management, error announcements) |
| NFR-8 | Performance | Browser pages load within 2s on 3G (no new heavy dependencies) |
| NFR-9 | SEO | Landing page, login, signup are server-rendered with proper metadata |

---

## 7. Implementation Strategy

### Phase 1: Foundation (Browser Layout + Auth)
1. Create `(browser)/layout.tsx` with `NavHeader` component
2. Build auth pages: login, signup, callback, error, forgot/reset password
3. Update landing page (`/`) with CTA buttons and smart redirect
4. Add new i18n strings

### Phase 2: Feature Pages
1. Create browser dashboard page (`/dashboard`) reusing `DashboardContent`
2. Create browser profile setup page (`/profile-setup`)
3. Create browser connections page (`/connections`)
4. Create browser settings page (`/settings`)
5. Build `PulseButton` component for manual pulsing

### Phase 3: Invite Flow + Polish
1. Create `/invite` page for web-based invite acceptance
2. Update `InviteModal` to show web URL alongside deep link
3. Add loading skeletons for browser pages
4. Add proper 404 handling for browser routes

### Migration Safety
- **No files in `appview/` are modified** (except zero edits needed there)
- **Only one existing file changes**: `app/page.tsx` (redirect target)
- **One shared component gets a minor addition**: `DashboardContent` gets an optional `onPulse` prop
- All other changes are **new files only**

---

## 8. Out of Scope

| Item | Reason |
|---|---|
| Push notifications (browser) | Requires service worker setup — separate feature |
| PWA manifest | Progressive Web App capabilities — separate feature |
| Ghost Calendar | Not yet implemented in appview either |
| Reliability badges/streaks | Not yet implemented in appview either |
| Profile editing | Not yet implemented in appview either |
| Group circles | Premium feature — future |
| Dark mode | Separate feature request |
| Social login beyond Google | Can be added later — Supabase supports many providers |
| Email templates customization | Supabase default templates are sufficient initially |
| Analytics/tracking | Separate concern |
| Flutter app changes | `/appview/*` routes remain unchanged; no Flutter code modifications |

---

## 9. Acceptance Criteria

### Auth
| AC | Criteria |
|---|---|
| AC-1 | User can sign up with email/password at `/signup` and receive verification email |
| AC-2 | User can log in with email/password at `/login` |
| AC-3 | User can sign in with Google OAuth at `/login` |
| AC-4 | User can request password reset at `/forgot-password` |
| AC-5 | User can set new password at `/reset-password` |
| AC-6 | OAuth callback at `/auth/callback` correctly redirects to `/dashboard` or `/profile-setup` |
| AC-7 | Logout clears session and redirects to `/` |
| AC-8 | Already-authenticated users visiting `/login` or `/signup` are redirected to `/dashboard` |

### Browser Pages
| AC | Criteria |
|---|---|
| AC-9 | `/dashboard` renders identically to `/appview/dashboard` (minus FlutterBridge signal) |
| AC-10 | `/profile-setup` creates profile and redirects to `/dashboard` |
| AC-11 | `/connections` shows connections, invite modal, and remove functionality |
| AC-12 | `/settings` shows language selector and functions correctly |
| AC-13 | Navigation header shows on all browser pages with correct active states |
| AC-14 | Mobile browser shows hamburger menu |

### Manual Pulse
| AC | Criteria |
|---|---|
| AC-15 | "Send Pulse" button appears on browser dashboard when user hasn't pulsed today |
| AC-16 | Clicking "Send Pulse" creates a `daily_pulses` record |
| AC-17 | Dashboard updates to show active status after pulsing |
| AC-18 | Button is hidden when user has already pulsed today |

### Zero Regression
| AC | Criteria |
|---|---|
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
|---|---|
| AC-28 | Unauthenticated user sees landing page with Login/Sign Up buttons |
| AC-29 | Authenticated user with profile is redirected to `/dashboard` |
| AC-30 | Authenticated user without profile is redirected to `/profile-setup` |

---

## 10. Open Questions

| # | Question | Impact | Recommendation |
|---|---|---|---|
| Q1 | Should browser auth support email/password only, or also OAuth (Google)? | Scope of auth implementation | Support both — Supabase makes OAuth easy |
| Q2 | Should the invite deep link (`pulse://`) be supplemented with a web URL, or replaced? | Invite sharing UX | Supplement — show both options in InviteModal |
| Q3 | Should the browser dashboard auto-pulse on load (like Flutter) or require manual action? | UX consistency | Manual only — auto-pulse is a mobile pattern; browser users should consciously choose to pulse |
| Q4 | Do we need email verification for signup, or allow immediate access? | Security vs friction | Require verification — standard practice for email auth |

---

## Appendix A: i18n Keys to Add

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "connections": "Connections",
    "settings": "Settings",
    "logout": "Log out",
    "menu": "Menu"
  },
  "auth": {
    "login": {
      "title": "Welcome back",
      "subtitle": "Sign in to your Pulse account",
      "emailLabel": "Email",
      "emailPlaceholder": "you@example.com",
      "passwordLabel": "Password",
      "submitButton": "Sign in",
      "forgotPassword": "Forgot your password?",
      "noAccount": "Don't have an account?",
      "signUpLink": "Sign up",
      "orContinueWith": "Or continue with",
      "googleButton": "Continue with Google"
    },
    "signup": {
      "title": "Create your account",
      "subtitle": "Start staying connected with your circle",
      "emailLabel": "Email",
      "passwordLabel": "Password",
      "confirmPasswordLabel": "Confirm password",
      "submitButton": "Create account",
      "hasAccount": "Already have an account?",
      "logInLink": "Log in",
      "passwordHint": "Must be at least 8 characters",
      "verificationSent": "Check your email to verify your account"
    },
    "forgotPassword": {
      "title": "Reset your password",
      "subtitle": "Enter your email and we'll send you a reset link",
      "submitButton": "Send reset link",
      "successMessage": "Check your email for a password reset link",
      "backToLogin": "Back to login"
    },
    "resetPassword": {
      "title": "Set new password",
      "submitButton": "Update password",
      "successMessage": "Password updated successfully"
    }
  },
  "landing": {
    "getStarted": "Get Started",
    "logIn": "Log In",
    "heroSubtitle": "A simple daily check-in that keeps your closest connections at ease."
  },
  "pulse": {
    "sendPulse": "Send Pulse",
    "sending": "Sending...",
    "sent": "Pulse sent!",
    "alreadySent": "You've already pulsed today"
  }
}
```

---

## Appendix B: Visual Reference — Browser Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard   Connections   Settings    [Avatar] │  ← NavHeader
├─────────────────────────────────────────────────────────┤
│                                                         │
│              ┌─────────────────────────┐                │
│              │    DashboardContent     │                │  ← Same component
│              │    (or other page)      │                │     as appview
│              │                         │                │
│              │   [Send Pulse Button]   │                │  ← New for browser
│              │                         │                │
│              └─────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```
AppView Layout (unchanged):
┌─────────────────────────────────┐
│ ┌─ safe-area-inset ──────────┐ │
│ │                             │ │
│ │    DashboardContent         │ │  ← Same component
│ │    (FlutterBridge active)   │ │
│ │                             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```
