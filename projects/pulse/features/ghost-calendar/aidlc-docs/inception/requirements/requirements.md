# Requirements — Ghost Calendar (PRD 3.1)

## Feature Summary
A 30-day pulse history calendar grid displayed on the user's dashboard, below the streak card. Ghost dots (grey outlines) for missed days, filled dots (colored) for pulsed days. Drives habit formation via the Zeigarnik Effect.

---

## Functional Requirements

### FR-01: Pulse Calendar Data
- The system SHALL provide an RPC function `get_pulse_calendar(p_days INTEGER DEFAULT 30)` that returns an array of dates where the authenticated user has pulsed.
- The function SHALL use `get_pulse_day_date()` to compute logical pulse dates (4 AM local reset).
- The function SHALL use the user's timezone from `profiles.timezone`.
- The function SHALL return dates within the requested day range from today.

### FR-02: Calendar Grid Component
- The dashboard SHALL display a 30-day calendar grid below the streak card.
- The grid SHALL use a 7-column (weekly) layout, resulting in ~5 rows.
- The grid SHALL NOT display day labels (Mon, Tue, etc.).
- Days with a pulse SHALL display as filled dots (vibrant color).
- Days without a pulse SHALL display as ghost dots (faint grey outlines).
- Today SHALL be visually distinguishable if not yet pulsed (e.g., slightly different ghost dot).

### FR-03: Data Scope
- The calendar SHALL show ONLY the current user's own pulse history.
- The calendar SHALL NOT show connection pulse data.

### FR-04: Read-Only Display
- The calendar SHALL be purely visual — no tap/click interactions on individual dots.

### FR-05: Dashboard Integration
- The calendar SHALL be positioned below the streak badge on the dashboard.
- The calendar SHALL be visible on both browser and app (WebView) views.
- The calendar SHALL respect the existing dashboard layout and responsive design.

---

## Non-Functional Requirements

### NFR-01: Performance
- The `get_pulse_calendar` RPC call SHALL complete in < 100ms for a 30-day range.
- The existing index `daily_pulses_user_id_created_at_idx` SHALL be sufficient (no new index).

### NFR-02: Security
- The RPC function SHALL use `auth.uid()` to scope data to the authenticated user.
- The function SHALL be `SECURITY DEFINER` with `search_path = public` to prevent RLS bypass attacks.

### NFR-03: Timezone Correctness
- Pulse day boundaries SHALL respect the user's `profiles.timezone` and the 4 AM reset rule.
- The calendar SHALL display correct dates regardless of the user's timezone.

---

## Out of Scope
- Connection pulse calendars (future enhancement)
- Tap/click interactions on dots
- Day labels or month headers
- Reliability Badge / Perfect Week detection (PRD 3.2 — separate feature)
- Calendar customization or settings
