# Pixel — Learnings Log

Frontend implementation lessons, browser quirks, and UI/UX insights accumulated over time.

## Mistakes

- **Server Components need `'use client'` when adding `useTranslations()`**: Several dashboard components (e.g., `status-card.tsx`, `connection-card.tsx`, `connection-grid.tsx`, `empty-connections-view.tsx`) were Server Components that needed to become Client Components when `useTranslations()` was added. Always add `'use client'` directive when converting a Server Component to use hooks.
- **Server Components use `getTranslations()`, not `useTranslations()`**: In `page.tsx` files (Server Components), use `const t = await getTranslations('namespace')` from `next-intl/server`. The `useTranslations()` hook is Client Component only.

## Wins

- **`next-intl` plugin approach works cleanly with Next.js 16**: Wrapping `nextConfig` with `createNextIntlPlugin("./src/i18n/request.ts")` in `next.config.ts` is the simplest setup. No routing middleware needed for v1 (single locale).
- **Cookie-based locale for SSR**: Setting a `pulse-locale` cookie from the client side and reading it via `await cookies()` in `request.ts` allows the server to render the correct locale without a network call. `router.refresh()` triggers server re-render with the new cookie value — no full page reload needed.
- **`FlutterBridgeListener` as a null-render component**: A `'use client'` component that returns `null` but sets up `useEffect` event listeners is a clean pattern for bidirectional Flutter↔WebView communication. Placed in `layout.tsx` inside the provider, it's always active.
- **ICU plural syntax in `next-intl`**: `{count, plural, =1 {# connection} other {# connections}}` works out of the box. Use `=1` (not `one`) for exact numeric matches in `next-intl`'s ICU implementation.

## Tech Debt

- **Wisdom phrases still hardcoded**: 80+ motivational quotes in `wisdom-card.tsx` are explicitly excluded from i18n for v1. Will need professional translation and cultural adaptation in v2.
- **Client-side only translation**: v1 does all translation on the client side. Server Components use `getTranslations()` which reads from the cookie, but there's no true server-side locale routing (no `/en/dashboard` URL prefixes). Consider adding `next-intl` middleware routing in v2 if SEO matters.
- **`router.refresh()` on locale change**: While this avoids a full page reload, it still re-runs all server components. If locale changes become frequent, consider a fully client-side approach with React context for instant switching.
