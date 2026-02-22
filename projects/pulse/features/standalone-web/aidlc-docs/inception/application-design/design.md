# Application Design — Pulse Standalone Web App

## 1. Architecture Overview

The standalone web feature follows an **additive architecture** — new browser routes and components are layered on top of the existing `/appview/*` structure without modifying it. Both route groups share the same component library, services, and Supabase clients.

```
┌─────────────────────────────────────────────────────────────┐
│                     Root Layout (layout.tsx)                 │
│              (i18n, fonts, metadata — UNCHANGED)            │
├──────────────────────────┬──────────────────────────────────┤
│   (browser) Route Group  │     appview/ Route Group         │
│                          │                                  │
│  ┌────────────────────┐  │  ┌────────────────────────────┐  │
│  │ Browser Layout     │  │  │ AppView Layout             │  │
│  │ - NavHeader        │  │  │ - FlutterBridgeListener    │  │
│  │ - ToastProvider    │  │  │ - ToastProvider             │  │
│  │ - Standard viewport│  │  │ - Safe-area insets         │  │
│  │ - Responsive       │  │  │ - Fixed viewport           │  │
│  └────────────────────┘  │  └────────────────────────────┘  │
│           │               │           │                      │
│  ┌────────┴────────┐     │  ┌────────┴────────┐            │
│  │ /dashboard      │     │  │ /appview/dash.. │            │
│  │ /connections    │     │  │ /appview/conn.. │            │
│  │ /settings       │     │  │ /appview/sett.. │            │
│  │ /profile-setup  │     │  │ /appview/prof.. │            │
│  │ /login          │     │  │ /appview/auth.. │            │
│  │ /signup         │     │  └─────────────────┘            │
│  │ /auth/callback  │     │                                  │
│  │ /invite         │     │                                  │
│  └─────────────────┘     │                                  │
│           │               │           │                      │
└───────────┼───────────────┼───────────┼──────────────────────┘
            └───────────────┴───────────┘
                        │
              ┌─────────┴─────────┐
              │  Shared Layer     │
              │  - Components     │
              │  - Services       │
              │  - Supabase       │
              │  - Utils          │
              │  - i18n           │
              └───────────────────┘
```

---

## 2. New Components

### 2.1 Browser Navigation Components (`src/components/browser/`)

#### `nav-header.tsx` — Navigation Bar
**Type**: Client Component (`'use client'`)
**Props**:
```typescript
interface NavHeaderProps {
  user?: {
    id: string;
    display_name: string;
    avatar_url: string;
  } | null;
}
```
**Behavior**:
- Renders Pulse logo (links to `/dashboard` if authenticated, `/` if not)
- Nav links: Dashboard, Connections, Settings (authenticated only)
- Active link detection via `usePathname()`
- User avatar + name (triggers UserMenu on click)
- Responsive: full nav on desktop, hamburger on mobile (< 768px)
- Sticky positioning at top of viewport

**Styling**: Matches Pulse design language — white background, subtle bottom border, teal active states.

#### `user-menu.tsx` — User Dropdown
**Type**: Client Component
**Props**:
```typescript
interface UserMenuProps {
  displayName: string;
  avatarUrl: string;
  onLogout: () => void;
}
```
**Behavior**:
- Click avatar/name to toggle dropdown
- Menu items: Settings (link), Logout (action)
- Closes on click outside, Escape key
- Accessible: `aria-expanded`, `role="menu"`, keyboard navigation

#### `mobile-menu.tsx` — Hamburger Menu
**Type**: Client Component
**Props**:
```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    display_name: string;
    avatar_url: string;
  } | null;
  onLogout: () => void;
}
```
**Behavior**:
- Full-height slide-in panel from right
- Same nav links as desktop
- User info + logout at bottom
- Closes on link click, backdrop click, Escape
- Focus trap while open

### 2.2 Auth Components (`src/components/auth/`)

#### `auth-layout.tsx` — Shared Auth Page Layout
**Type**: Server Component
**Props**:
```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
}
```
**Behavior**:
- Centered card on off-white background
- Pulse logo at top
- Max-width container (448px)
- Used by login, signup, forgot-password, reset-password pages

#### `login-form.tsx` — Email/Password Login
**Type**: Client Component
**Props**: None (self-contained)
**State**: email, password, error, loading
**Behavior**:
- Email + password inputs with validation
- Submit calls `supabase.auth.signInWithPassword()`
- On success: `router.push('/dashboard')` or `router.push('/profile-setup')`
- On error: display error message inline
- "Forgot your password?" link → `/forgot-password`

#### `signup-form.tsx` — Registration
**Type**: Client Component
**Props**: None
**State**: email, password, confirmPassword, error, loading, verificationSent
**Behavior**:
- Email + password + confirm password inputs
- Password validation: min 8 chars, passwords match
- Submit calls `supabase.auth.signUp()` with `emailRedirectTo` pointing to `/auth/callback`
- On success: show "check your email" message
- On error: display error message

#### `oauth-buttons.tsx` — Social Login
**Type**: Client Component
**Props**:
```typescript
interface OAuthButtonsProps {
  redirectTo?: string; // default: '/auth/callback'
}
```
**Behavior**:
- "Continue with Google" button
- Calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`
- Full-width button with Google icon
- Loading state while redirecting

#### `forgot-password-form.tsx` — Password Reset Request
**Type**: Client Component
**Props**: None
**State**: email, loading, sent
**Behavior**:
- Email input
- Submit calls `supabase.auth.resetPasswordForEmail()` with redirect to `/reset-password`
- On success: show "check your email" message
- "Back to login" link

#### `reset-password-form.tsx` — New Password
**Type**: Client Component
**Props**: None
**State**: password, confirmPassword, error, loading
**Behavior**:
- New password + confirm password inputs
- Submit calls `supabase.auth.updateUser({ password })`
- On success: redirect to `/login` with success message
- Handles token from URL (Supabase manages this automatically via session)

### 2.3 Dashboard Components (`src/components/dashboard/`)

#### `pulse-button.tsx` — Manual Pulse Trigger (NEW)
**Type**: Client Component
**Props**:
```typescript
interface PulseButtonProps {
  onPulse: () => Promise<void>;
}
```
**Behavior**:
- Prominent teal button: "Send Pulse"
- Loading state with spinner: "Sending..."
- Disabled while sending
- Calls `onPulse()` callback on click
- Success triggers parent refresh

**Styling**: Full-width on mobile, centered on desktop, matches Pulse design (teal bg, white text, rounded, shadow).

### 2.4 Services (`src/lib/services/`)

#### `pulse-service.ts` — Browser Pulse Service (NEW)
```typescript
export class PulseService {
  /**
   * Send a manual pulse for the current user.
   * Checks for duplicates before inserting.
   * Returns true if pulse was sent, false if already pulsed today.
   */
  static async sendPulse(): Promise<boolean>;

  /**
   * Check if the current user has pulsed today (since 4 AM reset).
   */
  static async hasPulsedToday(): Promise<boolean>;
}
```
**Implementation**:
- Uses browser Supabase client (`@/lib/supabase/client`)
- `sendPulse()`: Checks `hasPulsedToday()` first, then inserts into `daily_pulses`
- `hasPulsedToday()`: Queries `daily_pulses` where `created_at >= pulseDayStart`
- Uses `PULSE_DAY_RESET_HOUR` constant (4 AM)

---

## 3. Page Architecture

### 3.1 Browser Layout (`src/app/(browser)/layout.tsx`)

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server';
import { NavHeader } from '@/components/browser/nav-header';
import { ToastProvider } from '@/components/providers/toast-provider';

export default async function BrowserLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <>
      <NavHeader user={profile ? { id: user.id, ...profile } : null} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </>
  );
}
```

**Key differences from appview layout**:
- Includes `NavHeader` (appview has none)
- Standard viewport (appview has `viewportFit: cover`, no zoom)
- No `FlutterBridgeListener` (appview has it)
- No `safe-area-inset` class (appview has it)
- Responsive container with padding (appview has full-bleed)

### 3.2 Browser Page Patterns

Each browser page follows the same thin-wrapper pattern:

```typescript
// (browser)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { createClient } from '@/lib/supabase/server';

export default async function BrowserDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');        // ← /login, not /
  // ... same data fetching as appview/dashboard/page.tsx ...
  if (!profile) redirect('/profile-setup');  // ← /profile-setup, not /appview/...

  return (
    <DashboardContent
      displayName={profile.display_name}
      isActive={isActive}
      pulseTime={pulseTime}
      connections={connections}
      showWisdom={isActive}
      onPulse={...}  // ← Additional prop for manual pulse
    />
  );
}
```

**Pattern**: Same Server Component data fetching, same shared component rendering, different redirects and no FlutterBridge signals.

---

## 4. Auth Flow Diagrams

### 4.1 Email/Password Login
```
User → /login page
  ↓
Enter email + password → Submit
  ↓
supabase.auth.signInWithPassword()
  ↓ (success)
Check profile exists?
  ↓ Yes → router.push('/dashboard')
  ↓ No  → router.push('/profile-setup')
  ↓ (error)
Show error message inline
```

### 4.2 Email/Password Signup
```
User → /signup page
  ↓
Enter email + password + confirm → Submit
  ↓
supabase.auth.signUp({ emailRedirectTo: '/auth/callback' })
  ↓ (success)
Show "Check your email" message
  ↓
User clicks email link → /auth/callback?code=...
  ↓
Exchange code for session → Check profile
  ↓
No profile → redirect to /profile-setup
```

### 4.3 Google OAuth
```
User → /login page → "Continue with Google"
  ↓
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: origin + '/auth/callback' }
})
  ↓
Google OAuth consent → redirect back
  ↓
/auth/callback → exchange code → check profile
  ↓
Has profile → /dashboard
No profile → /profile-setup
```

### 4.4 Password Reset
```
User → /forgot-password → Enter email → Submit
  ↓
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: origin + '/reset-password'
})
  ↓
Show "Check your email" message
  ↓
User clicks email link → /reset-password (session restored by Supabase)
  ↓
Enter new password → Submit
  ↓
supabase.auth.updateUser({ password })
  ↓ (success)
Redirect to /login with success toast
```

---

## 5. Data Flow

### 5.1 Manual Pulse Flow
```
Browser Dashboard (Server Component)
  ↓ checks hasPulsedToday
  ↓ isActive = false
  ↓
DashboardContent (Client Component)
  ├── StatusCard: "Not pulsed yet"
  ├── PulseButton: visible
  │    ↓ user clicks
  │    PulseService.sendPulse()
  │      ↓ insert into daily_pulses
  │      ↓ return true
  │    ↓ success
  │    router.refresh() ← triggers Server Component re-render
  │    showToast("Pulse sent!")
  ↓
Dashboard re-renders with isActive = true
  ├── StatusCard: "You are active today"
  ├── WisdomCard: shows random phrase
  └── PulseButton: hidden
```

### 5.2 Navigation Data Flow
```
Browser Layout (Server Component)
  ↓ fetch user + profile
  ↓ pass to NavHeader
  ↓
NavHeader (Client Component)
  ├── Logo → Link to /dashboard or /
  ├── Nav links → usePathname() for active state
  ├── UserMenu → avatar, name, logout handler
  └── MobileMenu → same links, hamburger trigger
```

---

## 6. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Route group `(browser)/` instead of explicit `/web/` prefix | Clean URLs (`/dashboard` not `/web/dashboard`); standard Next.js pattern |
| Separate auth callback routes | `/auth/callback` → `/dashboard`; `/appview/auth/callback` → `/appview/dashboard`. Prevents cross-contamination |
| Manual pulse (not auto) for browser | Auto-pulse is a mobile pattern tied to app launch. Browser users should consciously choose to pulse |
| NavHeader in layout, not per-page | Consistent navigation across all browser pages; avoids duplication |
| Server Component layout fetches user | One query per request (cached by Next.js); no redundant auth checks in child components |
| `PulseService` as separate service | Keeps pulse logic decoupled from dashboard component; testable independently |
| ProfileSetup accepts `redirectTo` prop | Same component used by both browser (`/dashboard`) and appview (`/appview/dashboard`) without duplication |

---

## 7. Integration Contracts

### 7.1 DashboardContent Enhancement
**Current**:
```typescript
interface DashboardContentProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  connections: Connection[];
  showWisdom?: boolean;
}
```
**Enhanced** (backward compatible):
```typescript
interface DashboardContentProps {
  displayName: string;
  isActive: boolean;
  pulseTime?: Date | null;
  connections: Connection[];
  showWisdom?: boolean;
  onPulse?: () => Promise<void>;  // NEW — optional, for browser manual pulse
}
```
When `onPulse` is provided and `isActive` is false, render `PulseButton`. When omitted (appview), no pulse button shown.

### 7.2 ProfileSetup Enhancement
**Current**: Hardcoded redirect to `/appview/dashboard`
**Enhanced**: Accept `redirectTo` prop with default `/appview/dashboard`

Browser page passes `redirectTo="/dashboard"`, appview page passes nothing (uses default).

### 7.3 SettingsPage — No Changes Needed
The `notifyFlutterBridge()` call in `LocaleService` already checks `if (window.FlutterBridge)` — it's a no-op in browser. No changes needed.

---

## 8. Responsive Breakpoints

| Breakpoint | NavHeader | Content Container | Grid Layout |
|------------|-----------|-------------------|-------------|
| < 768px (mobile) | Hamburger menu | Full width, 16px padding | 1 column |
| 768px–1024px (tablet) | Full horizontal nav | Max 768px, centered | 2 columns |
| > 1024px (desktop) | Full horizontal nav | Max 1024px, centered | 3 columns |

---

## 9. Metadata & SEO

| Page | Title | Description |
|------|-------|-------------|
| `/` | "Pulse - Effortless Peace of Mind" | "Mutual reassurance through simple check-ins" |
| `/login` | "Log In - Pulse" | "Sign in to your Pulse account" |
| `/signup` | "Sign Up - Pulse" | "Create your Pulse account and start staying connected" |
| `/dashboard` | "Dashboard - Pulse" | "Your daily pulse status and connections" |
| `/connections` | "Connections - Pulse" | "Manage your Pulse connections" |
| `/settings` | "Settings - Pulse" | "Customize your Pulse preferences" |
| `/forgot-password` | "Reset Password - Pulse" | "Request a password reset link" |
