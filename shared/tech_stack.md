# Shared Tech Stack — Pulse

Agent-facing reference for the Pulse project's technology stack.

## Architecture

**Hybrid Flutter + Next.js** — Flutter acts as a thin native shell (splash, auth, WebView container). All UI screens are rendered by the Next.js app inside a WebView.

**Communication:** Flutter <-> WebView via `FlutterBridge` JavaScript channel. Messages use `{ type: string, payload: any }` JSON format. The `window.isReady` signal tells Flutter the dashboard has loaded so it can cross-fade from splash.

**Auth:** Supabase Auth. Sessions are shared via cookies injected by Flutter into the WebView.

**Pulse Day:** Resets at 4 AM local time. Auto-pulse fires during splash screen on app launch.

## Frontend (Web)

| Aspect | Technology |
|--------|------------|
| Framework | Next.js 16 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Linting/Formatting | Biome (not ESLint/Prettier) |
| Testing | Vitest |
| Components | Server Components by default; `'use client'` only for interactivity |
| File naming | kebab-case for components, Next.js conventions for pages |
| Tests location | Co-located in `__tests__/` directories next to components |

**Supabase clients:**
- Server: `import { createClient } from '@/lib/supabase/server'` (async)
- Browser: `import { supabase } from '@/lib/supabase/client'`

## Mobile (Flutter)

| Aspect | Technology |
|--------|------------|
| Framework | Flutter 3.10.8+ |
| Language | Dart |
| State Management | Riverpod |
| Routing | GoRouter (`context.go()`, `context.push()`) |
| Widgets | `ConsumerWidget` / `ConsumerStatefulWidget` for provider access |

**Service conventions:**
- Located in `lib/core/services/`
- Use Riverpod providers, accept `SupabaseClient` in constructor
- Return `Future<bool>` for success/failure, `Future<Model?>` for data (null = not found)

## Backend / Database

| Aspect | Technology |
|--------|------------|
| Platform | Supabase |
| Database | PostgreSQL 17 |
| Edge Functions | Deno 2 |
| Auth | Supabase Auth |

**Database tables:** `profiles`, `daily_pulses`, `connections`, `invite_codes` — all with RLS enforced via `auth.uid()`.

**Migration conventions:**
- Filenames: `YYYYMMDDHHMMSS_description.sql`
- Never edit existing migrations after deployment; create new ones
- RLS on all tables; policies named `{table}_{action}_{description}`
- SQL style: UPPERCASE keywords, lowercase snake_case identifiers
- Column conventions: `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`, FK as `{table}_id`

## Environment Variables

**pulse-app** (`.env`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`

**pulse-web** (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local Development Ports

| Service | Port |
|---------|------|
| API | 54321 |
| Database | 54322 |
| Studio | 54323 |
| Inbucket | 54324 |
