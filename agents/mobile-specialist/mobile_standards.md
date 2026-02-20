# Mobile UI & Coding Standards

## 1. Coding Standards
- **Null Safety:** Strict adherence to Dart null-safety. Use `required` and `?` judiciously.
- **Async/Await:** Avoid "Callback Hell." Use `Future` and `Stream` with proper error handling.
- **Const Constructors:** Use `const` everywhere possible to improve rendering performance.

## 2. UI Consistency
- **Theming:** Use `ThemeData` globally. No hardcoded colors or font sizes in widgets.
- **Safe Area:** Wrap all top-level screens in `SafeArea` to avoid notches and home indicators.
- **Touch Targets:** Minimum touch target size of 48x48 logical pixels for accessibility.

## 3. Storage & Cache
- Use **Isar** or **Hive** for fast local storage.
- Sensitive data (tokens) must be stored in **Flutter Secure Storage**.