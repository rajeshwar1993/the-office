# State Management Policy: The Flow Protocol

## 1. Single Source of Truth
- **Global State:** Use [Riverpod / Bloc / Provider] for data that persists across screens (e.g., Auth, User Profile, Theme).
- **Local State:** Use `StatefulWidget` or `useState` (if using hooks) for UI-only state like form validation or animation controllers.

## 2. Separation of Concerns
- **Logic-Less Widgets:** Widgets should only handle UI. All business logic must reside in `Providers`, `ViewModels`, or `Blocs`.
- **Immutability:** Always use immutable state. Use the `copyWith` pattern to update state to ensure Flutter detects changes correctly.

## 3. Data Flow
- **Unidirectional Flow:** Data flows down (via Providers); Events flow up (via function calls).
- **Asynchronous Data:** Use `AsyncValue` (Riverpod) or similar patterns to handle Loading, Error, and Data states explicitly.