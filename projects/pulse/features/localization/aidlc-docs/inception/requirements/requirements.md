# Requirements Document: Localization (i18n) Infrastructure — v1

**Feature:** Globalization & Persistent Localization
**Version:** 1.0
**Author:** Nexus (Product Manager)
**Date:** 2026-02-21
**Status:** Draft
**Source PRD:** `the-office/projects/pulse/features/localization/prd.md`

---

## 1. Objective

Decouple all user-facing strings from the Pulse codebase (both pulse-web and pulse-app) and establish a complete i18n infrastructure that supports future multi-language expansion. For v1, only English translations are shipped, but the architecture must allow adding new locales by dropping in a single JSON file with zero code changes. A user's language preference must persist across sessions, devices, and app reinstalls via Supabase profile sync.

---

## 2. Scope

### In Scope (v1)

- i18n framework setup in pulse-web (Next.js) and pulse-app (Flutter)
- Extraction of all hardcoded UI strings into structured JSON translation files
- English (`en`) translation file with complete coverage
- Language bootstrapping logic (local storage, device locale, fallback)
- `language_preference` column on Supabase `profiles` table
- New Settings page in pulse-web with language selector
- Cross-layer locale synchronization between Flutter and WebView via FlutterBridge
- Instant UI re-render on language change (no app restart, no full page reload)

### Out of Scope (v1)

See Section 5 for full details.

---

## 3. Functional Requirements

### 3.1 i18n Infrastructure Setup

| ID | Requirement | Layer |
|---|---|---|
| FR-001 | pulse-web must integrate an i18n library (e.g., `next-intl` or equivalent) that supports JSON-based translation files, nested keys, and interpolation placeholders (`{{name}}`, `{{days}}`). | pulse-web |
| FR-002 | pulse-app must integrate Flutter's built-in localization support or an equivalent package (e.g., `easy_localization`) that supports JSON-based translation files with the same key structure as pulse-web. | pulse-app |
| FR-003 | Both layers must use a shared translation key namespace. The JSON key hierarchy must be identical across pulse-web and pulse-app so that a single canonical key (e.g., `dashboard.status_safe`) resolves consistently in both contexts. | Both |
| FR-004 | A `t()` function (or equivalent accessor) must be the sole mechanism for retrieving UI strings. Direct hardcoded strings in UI code are prohibited after this feature ships. | Both |

### 3.2 String Extraction and Key Organization

| ID | Requirement | Layer |
|---|---|---|
| FR-005 | All user-visible strings in pulse-web (~39 strings across dashboard, auth, profile-setup, connections pages) must be extracted into a structured `en.json` file organized by feature namespace: `common`, `auth`, `dashboard`, `connections`, `profile_setup`, `settings`, `errors`. | pulse-web |
| FR-006 | All user-visible strings in pulse-app (~15 strings across splash, auth, profile setup, webview error screens) must be extracted into a structured `en.json` file using the same namespace convention. | pulse-app |
| FR-007 | Dynamic content must use interpolation placeholders. Examples: `"{{name}} is okay"`, `"Reliability Streak: {{days}} Days"`. | Both |
| FR-008 | Wisdom phrases (80+ motivational quotes displayed in the WisdomCard component) are explicitly excluded from translation files for v1. They remain hardcoded in English. | pulse-web |

### 3.3 Bootstrapping Logic

| ID | Requirement | Details |
|---|---|---|
| FR-009 | On app launch (before any UI renders), the system must resolve the active locale using the following priority chain: **(1)** `language_code` value in local storage (localStorage on web, SharedPreferences on Flutter) → **(2)** Device/browser locale → **(3)** Fallback to `'en'` if the detected locale is not in the supported locales list. | Both |
| FR-010 | The supported locales list for v1 is `['en']`. The list must be defined in a single configuration constant so adding a locale requires only updating this list and providing the corresponding JSON file. | Both |
| FR-011 | On first launch (no local storage value, no profile yet), the app must detect the device locale, check it against the supported list, and store the resolved locale in local storage immediately. | Both |

### 3.4 Profile Sync (Supabase)

| ID | Requirement | Details |
|---|---|---|
| FR-012 | A new column `language_preference` of type `TEXT NOT NULL DEFAULT 'en'` must be added to the `profiles` table via a new Supabase migration. The column stores ISO 639-1 language codes. | pulse-supabase |
| FR-013 | Existing RLS policies on `profiles` already permit owner SELECT/UPDATE, so no new policies are needed. The migration must only add the column. | pulse-supabase |
| FR-014 | After successful authentication, the app must fetch the user's `language_preference` from Supabase. If the server value differs from local storage, the server value takes precedence and the UI must update to match. Local storage must also be updated to reflect the server value. | Both |
| FR-015 | When the user changes language via the Settings UI, the new locale must be written to local storage immediately (for instant offline access) and then patched to the Supabase `profiles` table asynchronously. A failed server write must not block the UI update or revert the local selection. | Both |

### 3.5 Settings Page and Language Switcher UI

| ID | Requirement | Details |
|---|---|---|
| FR-016 | A new `/settings` route must be created in pulse-web. This is the first Settings page for the app; it does not exist yet. | pulse-web |
| FR-017 | The Settings page must include a "Language" section displaying the current language and a selector to change it. | pulse-web |
| FR-018 | The language selector must display each language option using its native name (e.g., "English", "हिन्दी"). For v1, only "English" is listed, but the UI must be designed to accommodate a growing list. | pulse-web |
| FR-019 | Selecting a language must trigger an immediate UI re-render of the entire app (all visible translated strings update) without a full page reload and without requiring an app restart. | pulse-web |
| FR-020 | The Settings page must be accessible from the dashboard via a navigation element (e.g., gear icon or menu item). The exact placement is a design decision to be finalized during application design. | pulse-web |

### 3.6 Cross-Layer Locale Sync (Flutter ↔ WebView)

| ID | Requirement | Details |
|---|---|---|
| FR-021 | When Flutter resolves a locale during bootstrapping (before loading the WebView), it must pass the locale to the WebView via the FlutterBridge JavaScript channel using the message format: `{ type: "locale_changed", payload: { locale: "en" } }`. | pulse-app |
| FR-022 | pulse-web must listen for `locale_changed` messages from the FlutterBridge. Upon receiving one, it must update its active locale, persist to local storage, and re-render the UI. | pulse-web |
| FR-023 | When the user changes language inside the WebView (via the Settings page), pulse-web must send a `locale_changed` message back to Flutter via `window.FlutterBridge.postMessage(...)` so Flutter can update its own locale and local storage. | pulse-web |
| FR-024 | pulse-app must listen for `locale_changed` messages from the WebView (in the existing `_handleMessage` method of `PulseWebView`) and update Flutter's active locale and SharedPreferences accordingly. | pulse-app |
| FR-025 | At no point should Flutter and the WebView display UI in different locales. The sync must be bidirectional and immediate. | Both |

### 3.7 Instant UI Re-render

| ID | Requirement | Details |
|---|---|---|
| FR-026 | In pulse-web, changing the locale must trigger a React re-render of all components consuming translated strings. This must be achieved via reactive state (e.g., React context or the i18n library's built-in reactivity) — not via `window.location.reload()`. | pulse-web |
| FR-027 | In pulse-app, changing the locale must rebuild all widgets consuming translated strings. Given that Flutter native screens are limited to splash, auth, profile setup, and the webview error view, a `setState` or Riverpod state update is sufficient. | pulse-app |

---

## 4. Non-Functional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR-001 | Language switch in the WebView must not cause a full page reload. The user must see strings update in-place without navigation disruption or scroll position loss. | Performance |
| NFR-002 | Translation JSON files must be lazy-loaded per locale (only the active locale's file is loaded into memory). This prevents bundle bloat as more languages are added in future versions. | Bundle Size |
| NFR-003 | The app must load in the user's last-used language without any network call. Local storage is the first check, ensuring full offline support for language display. | Offline |
| NFR-004 | The language selector must display language names in their native script (e.g., "English", "हिन्दी", "日本語") to ensure non-English speakers can identify their language regardless of the current app locale. | Accessibility |
| NFR-005 | Adding a new language in a future version must require only: (a) adding the locale code to the supported list, (b) providing the translated JSON file, and (c) adding the entry to the language selector list. No structural code changes should be needed. | Extensibility |
| NFR-006 | The Supabase migration adding `language_preference` must be backward-compatible. The `DEFAULT 'en'` ensures existing rows are unaffected. The column must be non-null with a default. | Data Integrity |
| NFR-007 | The FlutterBridge locale sync round-trip (Flutter sends locale to WebView, or WebView sends locale to Flutter) must complete within 500ms under normal conditions. | Performance |
| NFR-008 | Translation key misses (a key exists in code but not in the JSON file) must fall back to the English value and log a warning in development mode, rather than displaying a raw key string or crashing. | Resilience |

---

## 5. Out of Scope for v1

| Item | Rationale |
|---|---|
| **Wisdom phrase translation** | 80+ motivational quotes require professional translation and cultural adaptation. Deferred to v2. |
| **RTL (right-to-left) language support** | Arabic, Hebrew, and other RTL languages require layout mirroring across both Flutter and Next.js. Significant UI effort deferred. |
| **Locale-specific date/number formatting** | Pulse Day timestamps, streak counters, and relative dates will remain in default/English formatting for v1. |
| **Multiple language translations** | Only the English JSON file is shipped. The infrastructure supports adding more, but no additional translations are produced for v1. |
| **Server-side locale rendering** | Next.js Server Components will not perform locale-aware rendering in v1. All translation happens on the client side. |
| **In-app language auto-detection prompt** | No prompt asking "Would you like to switch to [detected language]?" on first launch. The app silently falls back to English. |

---

## 6. Acceptance Criteria

### Infrastructure

| # | Criterion |
|---|---|
| AC-01 | Zero hardcoded user-facing strings remain in pulse-web UI components (excluding wisdom phrases). All strings are accessed via the `t()` function or equivalent. |
| AC-02 | Zero hardcoded user-facing strings remain in pulse-app UI widgets. All strings are accessed via the localization accessor. |
| AC-03 | An `en.json` file exists in both pulse-web and pulse-app with complete coverage of all extracted strings, organized by feature namespace. |
| AC-04 | The supported locales list is defined in a single configuration constant in each layer. |

### Bootstrapping and Persistence

| # | Criterion |
|---|---|
| AC-05 | On first launch with no local storage value, the app resolves to `'en'` (since `'en'` is the only supported locale in v1) and stores it in local storage. |
| AC-06 | On subsequent launches, the app loads the locale from local storage without any network call and renders UI in that locale immediately. |
| AC-07 | After authentication, if the Supabase `language_preference` differs from local storage, the app updates to match the server value. |
| AC-08 | The `profiles` table contains a `language_preference TEXT NOT NULL DEFAULT 'en'` column after running the new migration. |

### Settings and Language Switching

| # | Criterion |
|---|---|
| AC-09 | A `/settings` route exists in pulse-web and is reachable from the dashboard. |
| AC-10 | The Settings page displays a language selector showing "English" (and is designed to accommodate future entries). |
| AC-11 | Selecting a language updates all visible translated strings instantly, without a page reload or app restart. |
| AC-12 | After changing the language, the new value is persisted in both local storage and the Supabase `profiles` table. |

### Cross-Layer Sync

| # | Criterion |
|---|---|
| AC-13 | When Flutter sets a locale during bootstrapping, the WebView receives and applies it via the FlutterBridge `locale_changed` message. |
| AC-14 | When the user changes language in the WebView Settings page, Flutter receives and applies the new locale via the FlutterBridge `locale_changed` message. |
| AC-15 | At no point during normal operation do Flutter native screens and the WebView display strings in different locales. |

### Resilience

| # | Criterion |
|---|---|
| AC-16 | If a translation key is missing from the JSON file, the app displays the English fallback string (not a raw key like `dashboard.status_safe`). |
| AC-17 | If the Supabase profile update fails after a language change, the UI remains in the newly selected language (local storage is the source of truth for display). |
| AC-18 | The app loads and displays correctly in English even when fully offline (airplane mode) with no cached Supabase data. |
