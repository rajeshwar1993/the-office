# Widget Composition & Component Policy

## 1. Atomic Widgets
- **Atoms:** `AppButton`, `AppInput`, `AppAvatar`. These must be generic and theme-aware.
- **Molecules:** `UserCard`, `PhotoThumbnail`. Small combinations of atoms.
- **Organisms:** `PhotoGrid`, `NavigationSidebar`. Self-contained sections of a page.

## 2. The "300-Line Rule"
- If a single widget file exceeds 300 lines, it **must** be broken down into smaller, private `_SubWidget` classes or moved to separate files.

## 3. Performance Guards
- **Const Constructors:** Every widget that can be `const` MUST be `const`.
- **Repaint Boundaries:** Use `RepaintBoundary` around heavy animations or complex drawings to prevent unnecessary widget tree repaints.
- **Expensive Operations:** Never perform heavy computation inside a `build()` method. Move it to a background isolate or the business logic layer.