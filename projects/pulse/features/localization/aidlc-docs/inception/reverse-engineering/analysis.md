# Reverse Engineering Analysis: Localization Feature

**Agent:** Atlas (Technical Architect)
**Date:** 2026-02-21
**Status:** Complete

---

## 1. Current Architecture Overview

Pulse uses a **hybrid Flutter + Next.js** architecture:

```
┌──────────────────────────────────────────┐
│        Flutter Shell (pulse-app)         │
│  Splash → Auth → Profile Setup → WebView│
│  State: Riverpod | Nav: GoRouter        │
└────────────┬─────────────────────────────┘
             │ FlutterBridge (JS Channel)
┌────────────▼─────────────────────────────┐
│    WebView (Next.js — pulse-web)         │
│  Dashboard, Connections, (future) Settings│
│  Framework: Next.js 16, React 19, TS    │
└────────────┬─────────────────────────────┘
             │ Supabase Client
┌────────────▼─────────────────────────────┐
│    Supabase Backend (pulse-supabase)     │
│  Tables: profiles, daily_pulses,        │
│  connections, invite_codes              │
└──────────────────────────────────────────┘
```

## 2. String Inventory

### pulse-web (Next.js) — 39+ hardcoded UI strings

| Area | String Count | Key Examples |
|------|-------------|--------------|
| Dashboard greetings | 3 | "Good morning/afternoon/evening" |
| Status messages | 5 | "You are active today", "You haven't pulsed yet today" |
| Profile setup | 6 | "Set up your profile", "Display Name", "Continue" |
| Connections page | 8 | "Connections", "Add Connection", "No connections yet" |
| Invite modal | 5 | "Invite Connection", "Share Invite", "Copy code" |
| Auth/error pages | 4 | "Authentication Error", "Back to Home" |
| Empty states | 4 | "No connections yet", "Coming soon in Unit 3" |
| Metadata | 2 | Page titles and descriptions |
| Wisdom library | 80+ | Motivational phrases (OUT OF SCOPE for v1) |

### pulse-app (Flutter) — 15 hardcoded UI strings

| Screen | String Count | Key Examples |
|--------|-------------|--------------|
| Splash | 1 | "Pulse" |
| Auth | 6 | "Sign in with Google", "Send Magic Link" |
| Profile setup | 6 | "Set up your profile", "Display Name" |
| WebView error | 2 | "Failed to load Dashboard", "Retry" |

## 3. Communication Layer

**FlutterBridge** (`pulse_webview.dart`):
- JavaScript channel: `FlutterBridge`
- Current messages: `'ready'` signal and `{"type":"ready"}` JSON
- Session injection: Auth tokens pushed to WebView localStorage + cookies
- **Gap:** No locale message type exists — must be added

## 4. Database Schema

**`profiles` table** (current columns):
- `id`, `email`, `display_name`, `avatar_url`, `timezone`, `created_at`, `updated_at`
- **Gap:** No `language_preference` column

## 5. Key Files Requiring Modification

### pulse-web
| File | Modification |
|------|-------------|
| `package.json` | Add `next-intl` dependency |
| `next.config.ts` | Add i18n plugin configuration |
| `src/app/layout.tsx` | Add `NextIntlClientProvider`, change `lang` attr |
| All `.tsx` with strings | Replace hardcoded strings with `t()` calls |
| New: `src/messages/en.json` | English translation file |
| New: `src/i18n/` | i18n configuration (request.ts, routing.ts) |

### pulse-app
| File | Modification |
|------|-------------|
| `pubspec.yaml` | Add `flutter_localizations`, `intl`, `shared_preferences` |
| `lib/main.dart` | Add `localizationsDelegates`, `supportedLocales` |
| `l10n.yaml` | New: ARB file configuration |
| `lib/l10n/app_en.arb` | New: English ARB translations |
| All screens with strings | Replace hardcoded strings with `AppLocalizations` |
| `lib/features/webview/pulse_webview.dart` | Add locale message to FlutterBridge |

### pulse-supabase
| File | Modification |
|------|-------------|
| New migration | Add `language_preference` column to profiles |

## 6. Technology Recommendations

| Layer | Library | Rationale |
|-------|---------|-----------|
| pulse-web | `next-intl` | Native App Router support, Server Component compatible, `t()` API |
| pulse-app | `flutter_localizations` + `intl` | Flutter official, ARB format, codegen support |
| pulse-app | `shared_preferences` | Local storage for offline language preference |

## 7. Risks & Considerations

1. **Server Components:** `next-intl` requires specific setup for Next.js Server Components — must use `getTranslations()` in server context
2. **WebView reload:** Changing locale in WebView may require page reload unless `next-intl` client-side switching is configured
3. **FlutterBridge timing:** Locale must be injected before WebView loads dashboard, similar to session injection
4. **Bundle size:** With English-only, minimal impact. Future languages will need lazy loading strategy
