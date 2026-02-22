# Task Breakdown — pulse-web Hardening

**Feature:** Systematic quality, security, and architecture improvements for `pulse-web/`
**Author:** Atlas (Technical Architect)
**Date:** 2026-02-21
**Source:** Full codebase audit of `pulse-web/src/`

---

## Phase 1 — Immediate (Bugs & Security)

> Priority: **CRITICAL**
> Goal: Fix production-breaking issues, security gaps, and data integrity risks.

---

### TASK-1.1: Remove mock data endpoint from dashboard

**Agent:** Pixel (Web Frontend Specialist)
**Files:** `src/app/appview/dashboard/page.tsx`
**Branch:** `task/1.1_remove-mock-data-endpoint`

**Problem:**
The dashboard page (line 52-94) accepts a `?mock=true` query parameter that bypasses real data fetching and serves hardcoded mock connections. This is a security risk — anyone can append `?mock=true` to see fake data instead of real connections, and it masks data-fetching bugs in production.

**Current code (lines 52-94):**
```tsx
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>;
}) {
  // ...
  const useMockData = params.mock === 'true';
  const connections: Connection[] = useMockData ? getMockConnections() : [];
```

**Required changes:**
1. Remove the `searchParams` prop entirely from the `Dashboard` component signature
2. Remove the `getMockConnections()` function (lines 25-50)
3. Remove the `useMockData` conditional (line 93-94)
4. Set `connections` to an empty array `[]` (real connection fetching is handled by the connections page; dashboard will get this in a future unit)
5. Simplified signature should be: `export default async function Dashboard()`

**Acceptance criteria:**
- `?mock=true` no longer changes dashboard behavior
- No mock data functions exist in production code
- Dashboard renders correctly with `connections: []`
- Existing tests still pass

---

### TASK-1.2: Fix Connection type inconsistency

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/lib/types/connection.ts`
- `src/components/dashboard/connection-grid.tsx`
- `src/components/dashboard/connection-card.tsx`

**Branch:** `task/1.2_fix-connection-type-inconsistency`

**Problem:**
Two different `Connection` types exist with incompatible `status` fields:

| Location | Type Name | Status Values |
|----------|-----------|---------------|
| `lib/types/connection.ts:33` | `ConnectionWithProfile` | `'active' \| 'inactive'` |
| `components/dashboard/connection-grid.tsx:6-12` | `Connection` | `'active' \| 'waiting'` |

This causes silent type mismatches. The dashboard uses `'waiting'` for users who haven't pulsed today, while the connections page uses `'inactive'` for the same concept.

**Required changes:**
1. In `lib/types/connection.ts`, update `ConnectionWithProfile.status` from `'active' | 'inactive'` to `'active' | 'waiting'` to align with the dashboard's semantics (which better describe the pulse concept)
2. In `components/connections/connection-card.tsx:13-14`, update the status check from `connection.status === 'active'` to also handle `'waiting'` (was checking against `'inactive'`)
3. Update translation keys: `connections.inactive` → `connections.waiting` in `src/messages/en.json`
4. Remove the duplicate `Connection` interface from `components/dashboard/connection-grid.tsx:6-12` and instead import/extend from `lib/types/connection.ts`

**Acceptance criteria:**
- Single source of truth for connection status values
- Status type is `'active' | 'waiting'` everywhere
- `connections/connection-card.tsx` uses correct status label
- `tsc --noEmit` passes with zero errors
- All existing tests pass

---

### TASK-1.3: Make `acceptInviteCode` atomic via Supabase RPC

**Agent:** Forge (Backend Specialist)
**Files:**
- `pulse-supabase/supabase/migrations/` (new migration)
- `src/lib/services/connection-service.ts`

**Branch:** `task/1.3_atomic-accept-invite`

**Problem:**
`ConnectionService.acceptInviteCode()` (lines 166-216) performs 3 separate database operations without a transaction:
1. Insert connection record A (creator → acceptor)
2. Insert connection record B (acceptor → creator)
3. Update invite_codes to mark as accepted

If step 2 or 3 fails, the database is left in an inconsistent state — a one-way orphaned connection exists.

**Required changes:**

**Step A — Create Supabase RPC function (new migration):**
```sql
CREATE OR REPLACE FUNCTION accept_invite(
  p_code TEXT
) RETURNS VOID AS $$
DECLARE
  v_invite invite_codes%ROWTYPE;
  v_user_id UUID := auth.uid();
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Validate invite code
  SELECT * INTO v_invite
  FROM invite_codes
  WHERE code = p_code
    AND accepted_by IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Prevent self-connection
  IF v_invite.creator_id = v_user_id THEN
    RAISE EXCEPTION 'Cannot connect to yourself';
  END IF;

  -- Check existing connection
  IF EXISTS (
    SELECT 1 FROM connections
    WHERE removed_at IS NULL
      AND (
        (from_user_id = v_user_id AND to_user_id = v_invite.creator_id)
        OR (from_user_id = v_invite.creator_id AND to_user_id = v_user_id)
      )
  ) THEN
    RAISE EXCEPTION 'Connection already exists';
  END IF;

  -- Create bidirectional connections
  INSERT INTO connections (from_user_id, to_user_id, created_at)
  VALUES
    (v_invite.creator_id, v_user_id, v_now),
    (v_user_id, v_invite.creator_id, v_now);

  -- Mark invite as accepted
  UPDATE invite_codes
  SET accepted_by = v_user_id, accepted_at = v_now
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step B — Update connection-service.ts:**
Replace the current `acceptInviteCode()` method (lines 166-216) with a single RPC call:
```ts
static async acceptInviteCode(code: string): Promise<void> {
  const { error } = await supabase.rpc('accept_invite', { p_code: code });
  if (error) throw error;
}
```

The validation methods (`validateInviteCode`, `connectionExists`) can remain for other uses but the accept flow must go through the RPC.

**Acceptance criteria:**
- All 3 operations (2 inserts + 1 update) run in a single transaction
- If any step fails, all are rolled back
- Error messages from the RPC are descriptive
- Existing connection-service methods still work for other use cases
- Migration applies cleanly: `supabase db reset` succeeds

---

### TASK-1.4: Add `loading.tsx` and `error.tsx` to appview routes

**Agent:** Pixel (Web Frontend Specialist)
**Files (all new):**
- `src/app/appview/loading.tsx`
- `src/app/appview/error.tsx`
- `src/app/appview/dashboard/loading.tsx`
- `src/app/appview/not-found.tsx`

**Branch:** `task/1.4_add-loading-error-boundaries`

**Problem:**
No loading or error boundaries exist. During server-side data fetching (dashboard profile + pulse queries), users see a blank white screen. If FlutterBridgeListener or any child component throws, the entire app crashes with React's default error screen.

**Required changes:**

**1. `src/app/appview/loading.tsx`** — Shared loading state for all appview routes:
```tsx
export default function AppViewLoading() {
  return (
    <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--teal)]" />
    </div>
  );
}
```

**2. `src/app/appview/error.tsx`** — Error boundary for appview (must be client component):
```tsx
'use client';

export default function AppViewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[var(--slate-900)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--slate-600)] mb-4">
          Please try again or restart the app.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--teal)] text-white rounded-lg font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**3. `src/app/appview/dashboard/loading.tsx`** — Dashboard-specific skeleton:
- Show a skeleton layout matching the dashboard structure (greeting placeholder, status card placeholder, connection grid placeholders)
- Use CSS `animate-pulse` for shimmer effect

**4. `src/app/appview/not-found.tsx`** — Branded 404:
- Pulse-branded message instead of Next.js default
- Link back to `/appview/dashboard`

**Acceptance criteria:**
- Navigating to `/appview/dashboard` shows skeleton loader during data fetch
- Throwing an error in any appview component shows the error boundary (not a crash)
- `/appview/nonexistent` shows branded 404 page
- All use CSS variables consistent with the existing design system

---

## Phase 2 — High Value (Architecture)

> Priority: **HIGH**
> Goal: Eliminate structural debt, improve type safety, and establish proper error UX.

---

### TASK-2.1: Consolidate duplicated dashboard/connections components

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/components/dashboard/empty-connections-view.tsx` (modify to be shared)
- `src/components/connections/empty-connections-view.tsx` (delete)
- `src/components/dashboard/connection-card.tsx` (keep as display variant)
- `src/components/connections/connection-card.tsx` (refactor to use shared base)
- `src/components/dashboard/connection-grid.tsx` (keep, import unified type)
- `src/components/connections/connection-grid.tsx` (refactor imports)

**Branch:** `task/2.1_consolidate-connection-components`

**Problem:**
Three component pairs are near-duplicates:

| Pair | Dashboard Version | Connections Version | Divergence |
|------|-------------------|---------------------|------------|
| EmptyConnectionsView | 82 lines, disabled button, "coming soon" | 48 lines, active button, onAddConnection callback | **High** — different behavior |
| ConnectionCard | 156 lines, avatar+ring+pulse animation | 50 lines, avatar+remove button | **High** — different use cases |
| ConnectionGrid | 57 lines, exports `Connection` type | 25 lines, uses `ConnectionWithProfile` | **Medium** — different types |

**Required changes:**

**EmptyConnectionsView:**
- Create a single `src/components/shared/empty-connections-view.tsx` with a `variant` prop:
  - `variant="dashboard"` — shows disabled button with "coming soon" note
  - `variant="connections"` — shows active "Add Connection" button with `onAddConnection` callback
- Delete `src/components/connections/empty-connections-view.tsx`
- Update imports in both `dashboard-content.tsx` and `connections/page.tsx`

**ConnectionCard:**
These are genuinely different enough to remain separate components, but they should:
- Share a common `BaseConnectionCard` with avatar, name, status dot, and status text
- `dashboard/connection-card.tsx` extends with pulse ring animation and time display
- `connections/connection-card.tsx` extends with remove button
- Both should use the unified `Connection` type from `lib/types/connection.ts`

**ConnectionGrid:**
- Remove the `Connection` interface from `dashboard/connection-grid.tsx:6-12` (already addressed in TASK-1.2)
- Both grids should import types from `lib/types/connection.ts`
- Consider creating a shared grid wrapper if layouts match

**Acceptance criteria:**
- No duplicate component files for empty-connections-view
- Both connection card variants share a base component or at minimum the same type definitions
- All imports updated — no broken references
- `tsc --noEmit` passes
- Existing tests updated to reflect new import paths

---

### TASK-2.2: Add FlutterBridge global type declaration

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/types/global.d.ts` (new)
- `src/components/dashboard/dashboard-content.tsx`
- `src/components/connections/invite-modal.tsx`

**Branch:** `task/2.2_flutter-bridge-types`

**Problem:**
`(window as any).FlutterBridge` appears in `dashboard-content.tsx:44,48` — this bypasses TypeScript entirely. Any change to the bridge contract would not be caught at compile time.

**Required changes:**

**1. Create `src/types/global.d.ts`:**
```ts
interface FlutterBridge {
  postMessage(message: string): void;
}

interface Window {
  FlutterBridge?: FlutterBridge;
  isReady?: boolean;
}
```

**2. Update `dashboard-content.tsx`:**
Replace all `(window as any).FlutterBridge` with `window.FlutterBridge` (now typed).

**3. Update `tsconfig.json`:**
Ensure `src/types/**/*.d.ts` is included in the `include` array (it should be by the `**/*.ts` glob already, but verify).

**Acceptance criteria:**
- Zero `as any` casts for FlutterBridge anywhere in the codebase
- `tsc --noEmit` passes
- Bridge message format is typed (type + payload structure)

---

### TASK-2.3: Replace `alert()` with toast notification system

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/components/ui/toast.tsx` (new)
- `src/components/providers/toast-provider.tsx` (new)
- `src/app/appview/layout.tsx` (add provider)
- `src/app/appview/connections/page.tsx` (replace alert/confirm)
- `src/components/connections/invite-modal.tsx` (replace alert)

**Branch:** `task/2.3_toast-notification-system`

**Problem:**
`alert()` is used in `connections/page.tsx:43` and `invite-modal.tsx:30`. `confirm()` is used in `connections/page.tsx:34`. These:
- Break accessibility (no screen reader support)
- Block the JavaScript thread
- Can't be styled or dismissed programmatically
- Won't work well in WebView context

**Required changes:**

**1. Create a lightweight toast component** (`src/components/ui/toast.tsx`):
- Support variants: `success`, `error`, `info`
- Auto-dismiss after configurable duration (default 3s)
- Accessible: `role="alert"`, `aria-live="assertive"`
- Position: bottom-center (safe for mobile WebView with notch)

**2. Create a toast provider** (`src/components/providers/toast-provider.tsx`):
- React Context with `showToast(message, variant)` function
- Max 1 toast visible at a time (replace, don't stack)
- Export `useToast()` hook

**3. Add provider to appview layout:**
Wrap children in `<ToastProvider>` in `src/app/appview/layout.tsx`

**4. Replace all `alert()` and `confirm()` calls:**
- `connections/page.tsx:43` (`alert(t('removeError'))`) → `showToast(t('removeError'), 'error')`
- `connections/page.tsx:34` (`confirm(t('removeConfirm'))`) → Create a confirmation modal component or use a promise-based confirm toast
- `invite-modal.tsx:30` (`alert(t('generateError'))`) → `showToast(t('generateError'), 'error')`

**Acceptance criteria:**
- Zero `alert()` or `confirm()` calls in the codebase
- Toast auto-dismisses and is accessible
- Works correctly in Flutter WebView context
- Unit tests for toast provider

---

### TASK-2.4: Add tests for critical untested components and services

**Agent:** Echo (QA Specialist)
**Files (all new):**
- `src/components/dashboard/__tests__/dashboard-content.test.tsx`
- `src/components/providers/__tests__/flutter-bridge-listener.test.tsx`
- `src/components/connections/__tests__/invite-modal.test.tsx`
- `src/lib/services/__tests__/connection-service.test.ts`

**Branch:** `task/2.4_critical-missing-tests`

**Problem:**
6 critical files have zero test coverage. These contain the most complex logic in the app: Flutter bridge communication, invite code flows, and all Supabase CRUD operations.

**Required test coverage:**

**1. `dashboard-content.test.tsx`:**
- Renders greeting based on time of day (morning/afternoon/evening)
- Sends `ready` signal to FlutterBridge when available
- Does NOT send signal when FlutterBridge is absent (browser mode)
- Renders StatusCard with correct active/inactive state
- Shows WisdomCard when `showWisdom=true`, hides when false
- Shows EmptyConnectionsView when connections array is empty
- Shows ConnectionGrid when connections exist
- Settings link points to `/appview/settings`

**2. `flutter-bridge-listener.test.tsx`:**
- Registers `flutter-locale-changed` event listener on mount
- Removes event listener on unmount
- Calls `LocaleService.setStoredLocale()` when valid locale received
- Ignores unsupported locale values
- Calls `router.refresh()` after locale change

**3. `invite-modal.test.tsx`:**
- Generates invite code on mount
- Displays QR code with correct deep link URL
- Copy to clipboard works (mock `navigator.clipboard`)
- Shows loading spinner during code generation
- Calls `onClose` when close button clicked
- Shows error state when code generation fails
- Share button calls `navigator.share` when available

**4. `connection-service.test.ts`:**
- `getActiveConnections()` — returns normalized connections with "other" profile
- `getActiveConnections()` — throws when not authenticated
- `getConnectionCount()` — returns correct count
- `removeConnection()` — soft-deletes with correct user_id
- `generateInviteCode()` — calls RPC and inserts record
- `validateInviteCode()` — returns null for expired/accepted codes
- `acceptInviteCode()` — calls RPC (after TASK-1.3)
- `acceptInviteCode()` — throws on self-connection attempt

**Acceptance criteria:**
- All new tests pass
- Supabase calls are properly mocked (no real network requests)
- `next-intl` translations mocked consistently with existing test patterns
- Test coverage for these files > 80%

---

## Phase 3 — Quality (DX & UX)

> Priority: **MEDIUM**
> Goal: Fix lint violations, improve i18n correctness, and address accessibility gaps.

---

### TASK-3.1: Auto-fix Biome lint violations

**Agent:** Pixel (Web Frontend Specialist)
**Files:** All `src/**/*.{ts,tsx}` files
**Branch:** `task/3.1_biome-lint-autofix`

**Problem:**
Biome reports 102 errors and 35 warnings. ~80% are auto-fixable (import organization, formatting).

**Required changes:**
1. Run `npx biome check --write ./src` to auto-fix import sorting and formatting
2. Manually fix remaining issues:
   - `src/app/appview/auth/callback/route.ts:7` — remove unused `next` variable
   - `src/app/page.tsx:4` — remove unused `Link` import
   - `src/components/connections/connection-card.tsx:21` — replace `<img>` with `next/image` `<Image>` component
   - `src/proxy.ts:10-11` — replace non-null assertions with runtime validation
   - `src/proxy.ts:18,24` — fix `forEach` implicit return (add explicit block body)
   - `src/components/connections/connection-card.tsx:41` — add `type="button"` to `<button>`
   - `src/app/appview/auth/error/page.tsx:13` — add `<title>` or `aria-label` to SVG

**Acceptance criteria:**
- `npx biome check ./src` reports 0 errors
- `tsc --noEmit` still passes
- All existing tests still pass

---

### TASK-3.2: Add locale-aware date formatting utility

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/lib/utils/format-date.ts` (new)
- `src/components/dashboard/connection-card.tsx`
- `src/components/dashboard/status-card.tsx`

**Branch:** `task/3.2_locale-aware-date-formatting`

**Problem:**
`formatDistanceToNow()` from date-fns (used in `connection-card.tsx:44` and `status-card.tsx`) defaults to English regardless of the user's selected locale. A user who selected Hindi will still see "2 hours ago" instead of the Hindi equivalent.

**Required changes:**

**1. Create `src/lib/utils/format-date.ts`:**
```ts
import { formatDistanceToNow } from 'date-fns';
import { enUS, hi, ja } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  en: enUS,
  hi: hi,
  ja: ja,
};

export function formatRelativeTime(date: Date, locale: string): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: localeMap[locale] || enUS,
  });
}
```

**2. Update components** to use `formatRelativeTime()` with the current locale from `useLocale()` (from `next-intl`).

**Acceptance criteria:**
- Date formatting respects user's selected locale
- Fallback to English for unsupported locales
- Unit tests verify output for at least 2 locales

---

### TASK-3.3: Fix accessibility gaps

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/components/settings/language-selector.tsx`
- `src/components/dashboard/wisdom-card.tsx`
- `src/components/dashboard/connection-card.tsx`
- `src/components/dashboard/dashboard-content.tsx`
- `src/components/connections/invite-modal.tsx`

**Branch:** `task/3.3_accessibility-fixes`

**Problem:**
Multiple components have accessibility gaps that will fail WCAG 2.1 AA compliance.

**Required changes:**

| Component | Issue | Fix |
|-----------|-------|-----|
| `language-selector.tsx` | Missing ARIA roles | Add `role="radiogroup"` to parent, `role="radio"` to each button |
| `wisdom-card.tsx:93` | Uses `<div role="button">` | Replace with `<button>` element; add Escape key handler |
| `connection-card.tsx:90,98` | Truncated text without full title | Add `title={name}` to truncated text elements |
| `dashboard-content.tsx:96` | `aria-label="Settings"` not translated | Use `t('settingsAriaLabel')` from i18n |
| `invite-modal.tsx:76-93` | Close button SVG has no aria-label | Add `aria-label={t('close')}` to close button |
| `invite-modal.tsx:69` | Modal backdrop has no escape key handler | Add `onKeyDown` for Escape to close modal |
| `invite-modal.tsx:69` | No focus trap in modal | Trap focus inside modal while open |

**Acceptance criteria:**
- `role="radiogroup"` and `role="radio"` on language selector
- All interactive elements are keyboard-navigable
- Modal traps focus and closes on Escape
- All aria-labels go through i18n
- Screen reader testing confirms correct announcements

---

### TASK-3.4: Extract magic values to constants

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/lib/constants.ts` (new)
- Multiple files (update references)

**Branch:** `task/3.4_extract-constants`

**Problem:**
Magic strings and numbers are scattered across the codebase without documentation.

**Required constants:**

```ts
// src/lib/constants.ts

/** Cookie name for persisting user's locale preference */
export const LOCALE_COOKIE_NAME = 'pulse-locale';

/** Deep link scheme for Pulse app */
export const PULSE_DEEP_LINK_SCHEME = 'pulse://';

/** Deep link URL for invite codes */
export const INVITE_DEEP_LINK_PREFIX = `${PULSE_DEEP_LINK_SCHEME}invite?code=`;

/** Delay (ms) before sending Flutter ready signal — allows DOM to settle */
export const FLUTTER_READY_SIGNAL_DELAY_MS = 500;

/** Max attempts to find a unique wisdom phrase */
export const WISDOM_MAX_UNIQUE_ATTEMPTS = 10;

/** Hour when Pulse Day resets (4 AM local) */
export const PULSE_DAY_RESET_HOUR = 4;

/** Key for storing wisdom in sessionStorage */
export const WISDOM_SESSION_KEY = 'pulse-wisdom';
```

**Files to update:**
- `src/lib/services/locale-service.ts` — replace `'pulse-locale'`
- `src/components/connections/invite-modal.tsx` — replace `'pulse://invite?code='`
- `src/components/dashboard/dashboard-content.tsx` — replace `500` delay
- `src/lib/services/wisdom-service.ts` — replace `10` and session key strings
- `src/app/appview/dashboard/page.tsx` — replace `4` (pulse day hour)

**Acceptance criteria:**
- All magic values extracted to named constants
- Each constant has a JSDoc comment explaining its purpose
- No hardcoded strings/numbers remain for these values
- All tests pass

---

## Phase 4 — Polish

> Priority: **LOW**
> Goal: Performance optimizations, structured logging, and remaining improvements.

---

### TASK-4.1: Add branded `not-found.tsx` pages

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/app/not-found.tsx` (new)
- `src/app/appview/not-found.tsx` (new, if not created in TASK-1.4)

**Branch:** `task/4.1_branded-404-pages`

**Required changes:**
- Create Pulse-branded 404 pages at both the root and appview level
- Match the design system (off-white background, teal accents, Pulse logo)
- Include navigation back to dashboard
- Translate text via `next-intl`

---

### TASK-4.2: Replace `<img>` with `next/image` `<Image>`

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/components/dashboard/connection-card.tsx:65`
- `src/components/connections/connection-card.tsx:21`
- `src/app/appview/profile-setup/page.tsx` (avatar images)

**Branch:** `task/4.2_next-image-optimization`

**Problem:**
Raw `<img>` tags miss Next.js image optimization (automatic WebP, lazy loading, responsive srcsets). This hurts LCP on slower connections.

**Required changes:**
- Replace all `<img>` with `<Image>` from `next/image`
- Add `width` and `height` props (avatars are 48x48 or 64x64)
- Add `dicebear.com` to `images.remotePatterns` in `next.config.ts`
- For Supabase-hosted avatars, add Supabase storage domain to `images.remotePatterns`

**Acceptance criteria:**
- Zero `<img>` tags in the codebase
- Biome `noImgElement` rule passes
- Images load correctly in both browser and WebView

---

### TASK-4.3: Add structured logging (replace console.log/error)

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/lib/utils/logger.ts` (new)
- All files using `console.log` / `console.error`

**Branch:** `task/4.3_structured-logging`

**Problem:**
`console.log` is scattered across production code (`dashboard-content.tsx:45,55,57`, `invite-modal.tsx:60`, etc.). These:
- Clutter browser console in production
- Don't distinguish log levels
- Don't provide structured context for debugging

**Required changes:**

**1. Create `src/lib/utils/logger.ts`:**
```ts
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => {
    if (isDev) console.log(`[DEBUG] ${msg}`, ctx ?? '');
  },
  info: (msg: string, ctx?: Record<string, unknown>) => {
    console.info(`[INFO] ${msg}`, ctx ?? '');
  },
  warn: (msg: string, ctx?: Record<string, unknown>) => {
    console.warn(`[WARN] ${msg}`, ctx ?? '');
  },
  error: (msg: string, error?: unknown, ctx?: Record<string, unknown>) => {
    console.error(`[ERROR] ${msg}`, error, ctx ?? '');
  },
};
```

**2. Replace all console calls** with appropriate logger levels:
- `console.log('Sending ready signal...')` → `logger.debug('Sending ready signal to Flutter')`
- `console.error('Failed to generate invite code:', error)` → `logger.error('Failed to generate invite code', error)`

**Acceptance criteria:**
- Zero bare `console.log` calls in production code
- Debug logs suppressed in production builds
- Error logs include structured context

---

### TASK-4.4: Internationalize wisdom library

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/lib/data/wisdom-library.ts`
- `src/messages/en.json` (add wisdom phrases section)

**Branch:** `task/4.4_i18n-wisdom-library`

**Problem:**
All 60+ wisdom phrases in `wisdom-library.ts` are hardcoded in English. Users who select Hindi or Japanese still see English wisdom.

**Required changes:**
1. Move wisdom phrases to `messages/{locale}.json` under a `wisdom.phrases` key
2. Update `wisdom-service.ts` to accept a locale parameter and load the correct phrases
3. Update `WisdomCard` to pass current locale to the service

**Acceptance criteria:**
- Wisdom phrases come from i18n message files
- Adding a new locale automatically includes wisdom translations
- Fallback to English if locale has no wisdom translations

---

### TASK-4.5: Add error handling to clipboard and auth callback

**Agent:** Pixel (Web Frontend Specialist)
**Files:**
- `src/components/connections/invite-modal.tsx`
- `src/app/appview/auth/callback/route.ts`

**Branch:** `task/4.5_error-handling-gaps`

**Problem:**

**invite-modal.tsx:41** — `navigator.clipboard.writeText()` is called without error handling. This will throw in:
- Insecure contexts (HTTP, not HTTPS)
- Some WebView configurations that don't support clipboard API
- When the user denies clipboard permission

**auth/callback/route.ts** — Multiple gaps:
- Line 7: `next` variable is unused (Biome error)
- Line 11: `exchangeCodeForSession` error is not logged
- Line 19-23: `.single()` should be `.maybeSingle()` for safer handling

**Required changes:**

1. **invite-modal.tsx** — wrap clipboard in try-catch:
```ts
try {
  await navigator.clipboard.writeText(inviteUrl);
  setCopied(true);
} catch {
  // Fallback: select text in input for manual copy
  const input = document.querySelector('input[readonly]') as HTMLInputElement;
  input?.select();
}
```

2. **auth/callback/route.ts:**
- Remove unused `next` variable
- Log `exchangeCodeForSession` errors
- Change `.single()` to `.maybeSingle()`

**Acceptance criteria:**
- Clipboard failures are handled gracefully (no unhandled promise rejection)
- Auth callback errors are logged for debugging
- Biome `noUnusedVariables` passes on callback route

---

## Dependency Graph

```
Phase 1 (all independent — can run in parallel):
  TASK-1.1 ──┐
  TASK-1.2 ──┤
  TASK-1.3 ──┤── All Phase 1 complete
  TASK-1.4 ──┘

Phase 2 (some dependencies):
  TASK-2.1 ← depends on TASK-1.2 (unified types)
  TASK-2.2 ← independent
  TASK-2.3 ← independent
  TASK-2.4 ← depends on TASK-1.3 (acceptInviteCode RPC)

Phase 3 (depends on Phase 2):
  TASK-3.1 ← depends on TASK-2.1, 2.2 (files will have changed)
  TASK-3.2 ← independent
  TASK-3.3 ← depends on TASK-2.3 (toast for modal)
  TASK-3.4 ← independent

Phase 4 (depends on Phase 3):
  TASK-4.1 ← depends on TASK-1.4 (may already be done)
  TASK-4.2 ← depends on TASK-3.1 (lint clean)
  TASK-4.3 ← independent
  TASK-4.4 ← independent
  TASK-4.5 ← depends on TASK-2.3 (toast for clipboard fallback)
```

---

## Agent Assignment Summary

| Agent | Tasks |
|-------|-------|
| **Forge** (Backend) | TASK-1.3 |
| **Pixel** (Web Frontend) | TASK-1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5 |
| **Echo** (QA) | TASK-2.4 |
| **Sentinel** (Code Review) | Reviews all PRs before merge |

---

*"Measure twice, cut once." — Atlas*
