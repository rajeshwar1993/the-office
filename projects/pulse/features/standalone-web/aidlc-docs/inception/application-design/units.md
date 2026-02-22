# Implementation Units — Pulse Standalone Web App

## Overview

The standalone web feature is decomposed into **5 implementation units** executed in 3 phases. All units are assigned to **Pixel** (Web Frontend Specialist) since this is a pulse-web-only feature.

---

## Dependency Graph

```
Phase 1 — Foundation
┌────────────┐
│ U-001      │ Browser Layout & Navigation
│ (no deps)  │
└─────┬──────┘
      │ blocks
      ▼
Phase 2 — Core Features (parallel after U-001)
┌────────────┐     ┌────────────┐
│ U-002      │     │ U-003      │
│ Auth Pages │     │ Feature    │
│ (U-001)    │     │ Pages      │
└─────┬──────┘     │ (U-001)    │
      │            └─────┬──────┘
      │                  │
      ▼                  ▼
Phase 3 — Enhancements (after U-002 + U-003)
┌────────────┐     ┌────────────┐
│ U-004      │     │ U-005      │
│ Manual     │     │ Landing +  │
│ Pulse      │     │ Invite     │
│ (U-003)    │     │ (U-002,    │
└────────────┘     │  U-003)    │
                   └────────────┘
```

---

## Execution Plan

| Phase | Units | Can Parallelize | Dependencies |
|-------|-------|-----------------|--------------|
| **Phase 1: Foundation** | U-001 | No | None |
| **Phase 2: Core Features** | U-002, U-003 | Yes (parallel) | Both depend on U-001 |
| **Phase 3: Enhancements** | U-004, U-005 | Yes (parallel) | U-004 depends on U-003; U-005 depends on U-002 + U-003 |

---

## Unit Definitions

---

### U-001: Browser Layout & Navigation

**Assigned**: Pixel
**Dependencies**: None
**Estimated Scope**: ~8 files

#### Scope of Work
Create the `(browser)` route group with a shared browser layout that includes a responsive navigation header, user menu, and mobile hamburger menu. This is the foundation all other browser pages build upon.

#### Files to Create
| File | Type | Purpose |
|------|------|---------|
| `src/app/(browser)/layout.tsx` | Server Component | Browser layout — fetches user/profile, renders NavHeader + ToastProvider |
| `src/components/browser/nav-header.tsx` | Client Component | Navigation bar — logo, nav links, user menu trigger |
| `src/components/browser/user-menu.tsx` | Client Component | Avatar dropdown — settings link, logout button |
| `src/components/browser/mobile-menu.tsx` | Client Component | Slide-in panel — hamburger menu for mobile |

#### Files to Modify
| File | Change |
|------|--------|
| `src/messages/en.json` | Add `nav` i18n keys (dashboard, connections, settings, logout, menu) |

#### Implementation Details

**Browser Layout**:
- Server Component that fetches user + profile from Supabase
- Passes user data to NavHeader as props
- Wraps children with ToastProvider
- Responsive container: `max-w-4xl mx-auto px-4 py-6`
- No viewport meta overrides (inherits root layout defaults)

**NavHeader**:
- Uses `usePathname()` for active link detection
- Conditional rendering: show nav links only if `user` prop is provided
- Desktop: horizontal nav with links + UserMenu
- Mobile (< 768px): hamburger icon triggers MobileMenu
- Sticky top positioning: `sticky top-0 z-50 bg-white border-b`

**UserMenu**:
- Click avatar to open dropdown
- Items: "Settings" (Link to `/settings`), "Log out" (calls logout handler)
- Close on click outside (`useEffect` with event listener)
- Close on Escape key
- Logout handler: `supabase.auth.signOut()` → `router.push('/')`

**MobileMenu**:
- Overlay + slide-in panel from right
- Same nav links as desktop
- User info section at bottom (avatar, name, logout)
- Focus trap and body scroll lock while open
- Animated with CSS transitions or framer-motion

#### Integration Contracts
- **Exposes**: Browser layout wrapping all `(browser)/*` routes
- **Consumed by**: U-002 (auth pages), U-003 (feature pages), U-004, U-005

#### Acceptance Criteria
- [ ] `(browser)/layout.tsx` renders NavHeader with user data
- [ ] NavHeader shows logo + nav links + user menu on desktop
- [ ] NavHeader shows hamburger menu on mobile (< 768px)
- [ ] Active nav link is visually highlighted
- [ ] UserMenu opens/closes correctly with keyboard and mouse
- [ ] MobileMenu opens/closes with animation
- [ ] Logout signs out and redirects to `/`
- [ ] Toast notifications work in browser layout
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes

---

### U-002: Authentication Pages

**Assigned**: Pixel
**Dependencies**: U-001 (browser layout must exist)
**Estimated Scope**: ~12 files

#### Scope of Work
Build the complete browser authentication flow: login, signup, OAuth, password reset, email verification, and auth callback handler.

#### Files to Create
| File | Type | Purpose |
|------|------|---------|
| `src/components/auth/auth-layout.tsx` | Server Component | Centered card layout for auth pages |
| `src/components/auth/login-form.tsx` | Client Component | Email/password login form |
| `src/components/auth/signup-form.tsx` | Client Component | Registration form |
| `src/components/auth/oauth-buttons.tsx` | Client Component | Google OAuth button |
| `src/components/auth/forgot-password-form.tsx` | Client Component | Password reset request |
| `src/components/auth/reset-password-form.tsx` | Client Component | New password form |
| `src/app/(browser)/auth/login/page.tsx` | Page | Login page |
| `src/app/(browser)/auth/signup/page.tsx` | Page | Signup page |
| `src/app/(browser)/auth/callback/route.ts` | API Route | OAuth callback handler |
| `src/app/(browser)/auth/error/page.tsx` | Page | Auth error display |
| `src/app/(browser)/auth/forgot-password/page.tsx` | Page | Forgot password page |
| `src/app/(browser)/auth/reset-password/page.tsx` | Page | Reset password page |

#### Files to Modify
| File | Change |
|------|--------|
| `src/messages/en.json` | Add `auth.login.*`, `auth.signup.*`, `auth.forgotPassword.*`, `auth.resetPassword.*` i18n keys |

#### Implementation Details

**Auth Layout** (`auth-layout.tsx`):
- Centered card: `min-h-screen flex items-center justify-center bg-[var(--off-white)]`
- Card: `max-w-md w-full bg-white rounded-2xl shadow-sm p-8`
- Pulse logo at top center
- Children rendered inside card

**Login Form**:
- Email input (type="email", required)
- Password input (type="password", required)
- Submit button with loading state (uses `Button` component)
- Error message display (uses `Alert` component)
- `supabase.auth.signInWithPassword({ email, password })`
- On success: check profile → redirect to `/dashboard` or `/profile-setup`

**Signup Form**:
- Email, password, confirm password inputs
- Client-side validation: passwords match, min 8 chars
- `supabase.auth.signUp({ email, password, options: { emailRedirectTo: origin + '/auth/callback' } })`
- On success: show verification sent message
- On error: display inline

**OAuth Buttons**:
- Single "Continue with Google" button
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })`
- Google logo SVG icon

**Auth Callback** (`/auth/callback/route.ts`):
- Same pattern as `/appview/auth/callback/route.ts`
- Exchange code for session
- Check profile → redirect to `/dashboard` or `/profile-setup`
- Error → redirect to `/auth/error`

**Login/Signup Pages**:
- Server Components that check auth status
- If already authenticated → redirect to `/dashboard`
- Render AuthLayout + LoginForm/SignupForm + OAuthButtons
- "Or" divider between form and OAuth

**Forgot/Reset Password**:
- Standard Supabase password reset flow
- `resetPasswordForEmail()` with `redirectTo: origin + '/reset-password'`
- Reset page reads session from URL token (Supabase handles automatically)

#### Integration Contracts
- **Exposes**: Complete browser auth flow (login → session → redirect)
- **Consumed by**: U-003 (feature pages need authenticated users), U-005 (invite flow needs auth redirect)

#### Acceptance Criteria
- [ ] User can sign up with email/password and receives verification email
- [ ] User can log in with email/password
- [ ] User can sign in with Google OAuth
- [ ] Auth callback redirects to `/dashboard` (has profile) or `/profile-setup` (no profile)
- [ ] Forgot password sends reset email
- [ ] Reset password form updates password
- [ ] Auth error page displays with retry link
- [ ] Already-authenticated users redirect from `/login` to `/dashboard`
- [ ] Form validation works (empty fields, password mismatch, min length)
- [ ] Error messages display inline
- [ ] All auth pages are server-rendered with proper metadata
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes

---

### U-003: Browser Feature Pages

**Assigned**: Pixel
**Dependencies**: U-001 (browser layout)
**Estimated Scope**: ~6 files

#### Scope of Work
Create browser versions of all feature pages (dashboard, profile-setup, connections, settings) as thin wrappers around existing shared components. Pages redirect unauthenticated users to `/login` instead of `/`.

#### Files to Create
| File | Type | Purpose |
|------|------|---------|
| `src/app/(browser)/dashboard/page.tsx` | Server Component | Browser dashboard |
| `src/app/(browser)/dashboard/loading.tsx` | Component | Dashboard loading skeleton |
| `src/app/(browser)/profile-setup/page.tsx` | Page | Browser profile setup |
| `src/app/(browser)/connections/page.tsx` | Page | Browser connections |
| `src/app/(browser)/settings/page.tsx` | Server Component | Browser settings |

#### Files to Modify
| File | Change |
|------|--------|
| `src/components/dashboard/dashboard-content.tsx` | Add optional `onPulse?: () => Promise<void>` prop |
| `src/app/appview/profile-setup/page.tsx` | Extract redirect target into variable (or use prop) for reusability |

#### Implementation Details

**Browser Dashboard** (`(browser)/dashboard/page.tsx`):
- Near-identical to `appview/dashboard/page.tsx`
- Auth check: `if (!user) redirect('/login')` (not `/`)
- Profile check: `if (!profile) redirect('/profile-setup')` (not `/appview/profile-setup`)
- Same data fetching: profile, pulse status, connections
- Renders `DashboardContent` with same props
- **Does NOT send FlutterBridge ready signal** (no `onPulse` prop yet — added in U-004)

**Browser Profile Setup** (`(browser)/profile-setup/page.tsx`):
- Client Component wrapper
- On form completion: `router.push('/dashboard')` (not `/appview/dashboard`)
- Same avatar picker, display name, timezone detection
- Auth check: redirect to `/login` if unauthenticated

**Browser Connections** (`(browser)/connections/page.tsx`):
- Client Component wrapper
- Renders existing `ConnectionsPage` component directly (it handles its own data fetching)
- Same invite modal, connection grid, remove confirmation

**Browser Settings** (`(browser)/settings/page.tsx`):
- Server Component
- Auth check: redirect to `/login` if unauthenticated
- Renders `SettingsPage` with current locale
- `notifyFlutterBridge()` in LocaleService is already a no-op when FlutterBridge unavailable

**Dashboard Loading** (`(browser)/dashboard/loading.tsx`):
- Same loading skeleton pattern as `appview/dashboard/loading.tsx`
- Reuse existing `Skeleton` component

**DashboardContent Enhancement**:
- Add optional `onPulse` prop to interface
- When `onPulse` provided AND `!isActive`: render PulseButton component
- When `onPulse` not provided (appview): no change in behavior
- This is backward compatible — appview pages don't pass `onPulse`

#### Integration Contracts
- **Exposes**: Full browser feature page suite
- **Consumed by**: U-004 (pulse button on dashboard), U-005 (redirect targets after invite accept)
- **Depends on**: U-001 (browser layout for navigation)

#### Acceptance Criteria
- [ ] `/dashboard` renders same content as `/appview/dashboard`
- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] `/profile-setup` creates profile and redirects to `/dashboard`
- [ ] `/connections` shows connection grid, invite modal, remove flow
- [ ] `/settings` shows language selector
- [ ] Loading skeleton displays while dashboard data loads
- [ ] No FlutterBridge signals sent from browser pages
- [ ] All existing appview pages still work identically
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes

---

### U-004: Manual Pulse

**Assigned**: Pixel
**Dependencies**: U-003 (browser dashboard page)
**Estimated Scope**: ~3 files

#### Scope of Work
Add manual pulse capability for browser users. Create a PulseService for browser-side pulse operations and a PulseButton component displayed on the browser dashboard.

#### Files to Create
| File | Type | Purpose |
|------|------|---------|
| `src/lib/services/pulse-service.ts` | Service | Browser pulse operations (send, check) |
| `src/components/dashboard/pulse-button.tsx` | Client Component | Manual pulse trigger button |

#### Files to Modify
| File | Change |
|------|--------|
| `src/app/(browser)/dashboard/page.tsx` | Wire up PulseButton via `onPulse` prop on DashboardContent |
| `src/messages/en.json` | Add `pulse.*` i18n keys (sendPulse, sending, sent) |

#### Implementation Details

**PulseService** (`pulse-service.ts`):
```typescript
import { supabase } from '@/lib/supabase/client';
import { PULSE_DAY_RESET_HOUR } from '@/lib/constants';

export class PulseService {
  static async sendPulse(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if already pulsed
    if (await this.hasPulsedToday()) return false;

    const { error } = await supabase
      .from('daily_pulses')
      .insert({ user_id: user.id });

    return !error;
  }

  static async hasPulsedToday(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const pulseDayStart = this.getStartOfPulseDay();
    const { data } = await supabase
      .from('daily_pulses')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', pulseDayStart.toISOString())
      .limit(1)
      .maybeSingle();

    return data !== null;
  }

  private static getStartOfPulseDay(): Date {
    // Same logic as appview/dashboard/page.tsx getStartOfPulseDay()
  }
}
```

**PulseButton** (`pulse-button.tsx`):
- Uses `Button` component with `loading` prop
- i18n: `useTranslations('pulse')`
- Calls `onPulse()` on click
- Disabled while loading
- Teal variant, prominent size

**Dashboard Integration**:
- Browser dashboard page creates a callback that calls `PulseService.sendPulse()`
- On success: `router.refresh()` + `showToast(t('pulse.sent'))`
- Passes callback as `onPulse` prop to `DashboardContent`
- `DashboardContent` renders `PulseButton` when `onPulse` is provided and `!isActive`

#### Integration Contracts
- **Exposes**: Manual pulse capability on browser dashboard
- **Consumed by**: None (terminal feature)
- **Depends on**: U-003 (browser dashboard page + DashboardContent `onPulse` prop)

#### Acceptance Criteria
- [ ] PulseButton visible on browser dashboard when user hasn't pulsed today
- [ ] Clicking "Send Pulse" creates `daily_pulses` record
- [ ] Dashboard refreshes to show active status + wisdom card after pulsing
- [ ] Button hidden when user has already pulsed today
- [ ] Loading state shown while pulse is being sent
- [ ] Success toast "Pulse sent!" displayed
- [ ] Duplicate pulse prevention works
- [ ] PulseButton does NOT appear on `/appview/dashboard`
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes

---

### U-005: Landing Page & Invite Flow

**Assigned**: Pixel
**Dependencies**: U-002 (auth pages for login links), U-003 (feature pages for redirect targets)
**Estimated Scope**: ~4 files

#### Scope of Work
Enhance the landing page with auth CTAs (replacing "use the mobile app" message). Create a web-based invite acceptance page. Update InviteModal to show web URL alongside deep link.

#### Files to Create
| File | Type | Purpose |
|------|------|---------|
| `src/app/(browser)/invite/page.tsx` | Page | Web invite acceptance |

#### Files to Modify
| File | Change |
|------|--------|
| `src/app/page.tsx` | Update redirect targets (`/dashboard`, `/profile-setup`), add Login/Sign Up buttons |
| `src/components/connections/invite-modal.tsx` | Add web invite URL option alongside deep link |
| `src/messages/en.json` | Add `landing.*` i18n keys |

#### Implementation Details

**Landing Page Update** (`app/page.tsx`):
- Keep existing logo + tagline
- Replace "Use the mobile app to sign in" with:
  - "Get Started" button → `/signup`
  - "Log In" button → `/login`
- Update redirects: `/dashboard` instead of `/appview/dashboard`, `/profile-setup` instead of `/appview/profile-setup`

**Invite Page** (`(browser)/invite/page.tsx`):
- Reads `code` from query params
- If authenticated:
  - Validate invite code via `ConnectionService.validateInviteCode(code)`
  - Show invite details (inviter name if available)
  - Accept button → `ConnectionService.acceptInviteCode(code)` → redirect to `/connections`
  - Error handling for invalid/expired codes
- If unauthenticated:
  - Redirect to `/login?next=/invite?code=${code}`
  - After login, middleware or login form handles redirect back

**InviteModal Update**:
- Currently shows `pulse://invite?code=ABC123` deep link + QR code
- Add web invite URL: `{origin}/invite?code=ABC123`
- Show both options: "Share link" (web URL) and "Open in app" (deep link)
- Copy button copies web URL by default

#### Integration Contracts
- **Exposes**: Enhanced landing page, web invite flow
- **Consumed by**: None (terminal features)
- **Depends on**: U-002 (auth pages for `/login` link), U-003 (feature pages for `/connections` redirect)

#### Acceptance Criteria
- [ ] Landing page shows Login + Sign Up buttons (not "use the mobile app")
- [ ] Authenticated users redirect from `/` to `/dashboard`
- [ ] Authenticated users without profile redirect from `/` to `/profile-setup`
- [ ] `/invite?code=ABC` shows invite details when authenticated
- [ ] Accepting invite creates connection and redirects to `/connections`
- [ ] Unauthenticated invite visitors redirect to `/login` with return URL
- [ ] InviteModal shows web URL alongside deep link
- [ ] Invalid/expired invite codes show error message
- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes

---

## Summary Matrix

| Unit | Scope | Files (New) | Files (Modify) | Dependencies | Phase |
|------|-------|-------------|-----------------|--------------|-------|
| U-001 | Browser Layout & Nav | 4 | 1 | None | 1 |
| U-002 | Auth Pages | 12 | 1 | U-001 | 2 |
| U-003 | Feature Pages | 5 | 2 | U-001 | 2 |
| U-004 | Manual Pulse | 2 | 2 | U-003 | 3 |
| U-005 | Landing + Invite | 1 | 3 | U-002, U-003 | 3 |
| **Total** | | **24** | **9** | | |

---

## Build Verification Plan

After each unit:
1. `npm run build` — must pass
2. `npx tsc --noEmit` — must pass
3. `npm run lint` — must pass
4. `npm test` — existing tests must pass
5. Manual verification of appview routes (no regression)

After all units:
1. Full integration test of browser auth flow
2. Full integration test of browser feature pages
3. Responsive testing at 320px, 768px, 1280px
4. Verify `/appview/*` routes unchanged
