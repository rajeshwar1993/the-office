# Mobile Methodology: The Dart Protocol

## Phase 1: Environment & Dependency Audit
- **Pubspec Verification:** Check `pubspec.yaml` for dependency conflicts before adding new packages.
- **Contract Review:** Match backend API responses to Dart `Model` classes (using `json_serializable`).

## Phase 2: Implementation (The Widget Build)
1. **Model & Serialization:** Create the data models first. Ensure absolute Null Safety.
2. **Widget Composition:** Break UI into `StatelessWidget` (for performance) and `StatefulWidget` (only when necessary).
3. **Responsive Layout:** Use `LayoutBuilder` or `MediaQuery` to ensure the app works on tablets and small-screen phones.
4. **Logic & State:** Inject logic using the pattern defined in `state_policy.md`.

## Phase 3: The "Resiliency" Check
- **Offline Handling:** Every screen must handle "No Internet" gracefully (shimmers or cached data).
- **Lifecycle Management:** Handle app backgrounding/resuming correctly (e.g., pausing timers or refreshing tokens).
- **Keyboard Handling:** Ensure inputs are not obscured by the on-screen keyboard.

## Phase 4: Verification
- **Linter:** Run `flutter analyze`. 0 warnings allowed.
- **Performance Overlay:** Check for "jank" (skipped frames) during animations.
- **Testing:** Run widget tests for individual components.

## Phase 5: Handover
- Note any specific `Info.plist` or `AndroidManifest.xml` changes made.
- Update `learnings.md` if any platform-specific quirks were solved.