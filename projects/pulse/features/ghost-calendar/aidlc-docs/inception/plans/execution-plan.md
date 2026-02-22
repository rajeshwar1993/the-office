# Execution Plan — Ghost Calendar

## Inception Assessment

| Stage | Decision | Rationale |
|-------|----------|-----------|
| Workspace Detection | COMPLETED | Brownfield, multi-repo (pulse-supabase, pulse-web) |
| Reverse Engineering | SKIP | Existing artifacts from prior features; codebase fully understood |
| Requirements Analysis | COMPLETED | FR/NFR documented, all clarifying questions answered |
| User Stories | SKIP | Single user type, clear requirements, low ambiguity |
| Workflow Planning | COMPLETED | This document |
| Application Design | SKIP | No new services/patterns; single component + 1 RPC function |
| Units Generation | COMPLETED | 2 units defined below |

## Units of Work

### U-001: Supabase RPC Migration
- **Repo:** pulse-supabase
- **Scope:** One migration file creating the `get_pulse_calendar()` PostgreSQL function
- **Dependencies:** None (uses existing `get_pulse_day_date()` and `daily_pulses` table)
- **Risk:** Low
- **Construction Stages:**
  - Code Generation: EXECUTE
  - Functional Design / NFR / Infrastructure: SKIP (trivial single function)

### U-002: Ghost Calendar Frontend
- **Repo:** pulse-web
- **Scope:**
  1. `GhostCalendar` component — 7x5 grid with ghost/filled dots
  2. `pulse-calendar-service.ts` — calls the RPC and returns typed data
  3. Dashboard integration — fetch calendar data in server component, pass to `DashboardContent`, render between StreakBadge and Connections
  4. i18n — add calendar-related translation keys (if any labels needed)
- **Dependencies:** U-001 must be deployed/available first
- **Risk:** Low-Medium (visual component, needs to match design language)
- **Construction Stages:**
  - Code Generation: EXECUTE
  - Functional Design / NFR / Infrastructure: SKIP

## Construction Sequence

```
U-001 (Supabase RPC) → U-002 (Frontend Component) → Build & Test
```

## Approval Gates

1. **After this plan** (Inception gate) — approve to proceed to Construction
2. **After Build & Test** (Construction gate) — verify everything works

## Git Strategy

- Feature branch: `feature/ghost-calendar` (from `main`)
- Task branches: `task/ghost-calendar-rpc` (U-001), `task/ghost-calendar-ui` (U-002)
- Commits: `feat(migrations): add get_pulse_calendar RPC`, `feat(dashboard): add ghost calendar component`
