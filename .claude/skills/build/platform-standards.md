# Platform Standards

Non-obvious, platform-specific rules that go beyond common sense.

## Backend (Supabase/PostgreSQL/Deno)

- **Statelessness:** Design all backend logic to be stateless. No in-memory caches between requests.
- **Fail-Fast:** Validate inputs at the boundary. Return early on invalid data.
- **Explicit over Implicit:** No magic. Every dependency is injected, every config is explicit.
- **RLS on every table:** Row Level Security must be enabled. All policies checked for `auth.uid()`.
- **Migration naming:** `YYYYMMDDHHMMSS_description.sql`. Never edit existing migrations after deployment.
- **Column conventions:** `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`, FK as `{table}_id`.

## Web Frontend (Next.js/React)

- **Server Components by default.** Add `'use client'` only when hooks or interactivity are needed.
- **Server Supabase client:** `import { createClient } from '@/lib/supabase/server'` (async).
- **Browser Supabase client:** `import { supabase } from '@/lib/supabase/client'`.
- **File naming:** kebab-case for components. Next.js conventions for pages.
- **Linting/formatting:** Biome (not ESLint/Prettier).
- **Loading/Error/Empty states** required for every data-fetching component.
- **Accessible queries:** Use `getByRole()` over `getByTestId()` in tests.

## Mobile (Flutter/Dart)

### Offline & Sync Policy
- **Cache-First Strategy:** Show cached data immediately while fetching fresh data in the background.
- **Outbox Pattern:** If the user performs an action while offline, save locally and sync when connectivity returns.
- **Conflict Resolution:** Last Write Wins for simple data. Flag conflicts for complex data.
- **Connectivity Awareness:** Use `connectivity_plus` to monitor status. Show "Offline Mode" indicator. Never block navigation to cached screens.

### Widget & State Rules
- **Const constructors** wherever possible for performance.
- **300-line rule:** Break down widgets exceeding 300 lines.
- **State management:** Riverpod for global state, `StatefulWidget` for local-only state.
- **Unidirectional data flow:** Use `AsyncValue` for loading/error/data patterns.
- **Null Safety:** Absolute. No `!` operator without documented justification.
- **RepaintBoundary** around frequently updating widgets.
