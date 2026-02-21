# Dart — Learnings Log

Mobile implementation lessons, OS-specific quirks, and Flutter insights accumulated over time.

## Mistakes

- **`synthetic-package: true` removed in newer Flutter**: `l10n.yaml` with `synthetic-package: true` causes `flutter pub get` to fail with "Cannot enable 'synthetic-package', this feature has been removed." Simply omit the option — generated files go to `lib/l10n/` by default.
- **Import path for generated localizations**: Without `synthetic-package`, the import path is `import 'l10n/app_localizations.dart'` (relative), NOT `import 'package:flutter_gen/gen_l10n/app_localizations.dart'` (synthetic package). The old path will cause unresolved import errors.
- **`flutter_localizations` import not needed when using `AppLocalizations.localizationsDelegates`**: The generated `AppLocalizations.localizationsDelegates` getter already includes `GlobalMaterialLocalizations`, `GlobalWidgetsLocalizations`, and `GlobalCupertinoLocalizations`. Explicitly importing `package:flutter_localizations/flutter_localizations.dart` and listing those delegates manually causes an unused import warning.
- **`const` must be removed from `ProviderScope`** when using `overrides` (e.g., for injecting `SharedPreferences` at startup), since overrides are runtime values.

## Wins

- **`ConsumerStatefulWidget` for WebView bridge**: Converting `PulseWebView` from `StatefulWidget` to `ConsumerStatefulWidget` gave direct `ref` access for updating the `localeProvider` from within `_handleMessage`. Clean pattern for any widget that needs to both manage local state and update Riverpod providers.
- **Locale bootstrapping order**: Reading SharedPreferences first (instant, offline) then overriding with Supabase profile value (server takes priority) in the splash screen ensures fast startup and correct sync. The priority chain: SharedPreferences → Supabase profile → fallback `'en'`.
- **Fire-and-forget Supabase sync**: `localeService.syncToProfile(locale)` is called without `await` so the UI is never blocked by a network call when changing locale. If it fails, the local value (SharedPreferences) is the source of truth.
- **Regex-based message parsing in FlutterBridge**: Using `RegExp(r'"locale"\s*:\s*"([a-z]{2}(-[A-Z]{2})?)"')` to extract locale from JSON messages avoids pulling in `dart:convert` for simple message parsing. Works reliably for the `LOCALE_CHANGED` protocol.

## Tech Debt

- **Pre-existing `avoid_print` warnings**: 8 `print()` calls in `pulse_service.dart` should be converted to `debugPrint()` or a proper logger. These show up in every `flutter analyze` run.
- **Pre-existing `withOpacity` deprecation**: `auth_screen.dart:159` and `profile_setup_screen.dart:101` use deprecated `.withOpacity()`. Should be migrated to `.withValues()` per Flutter deprecation notice.
