# Execution Plan — Pulse Standalone Web App

## 1. Analysis Summary

| Dimension | Assessment |
|-----------|-----------|
| **Scope** | High — 24 new files, 9 modified files, new auth flow, new layout system |
| **Impact** | Low risk — additive only, no appview changes, 2 existing files modified |
| **Complexity** | Moderate — auth flow is well-defined (Supabase), components are reusable |
| **Risk** | Low — zero regression risk due to additive architecture |

---

## 2. Workflow Visualization

```
INCEPTION
═════════
  ✓ Workspace Detection         ── COMPLETED (brownfield, pulse-web only)
  ✓ Reverse Engineering          ── SKIPPED (done during PRD)
  ✓ Requirements Analysis        ── COMPLETED (8 FR groups, 10 NFRs, 30 ACs)
  ✗ User Stories                 ── SKIP (documented in PRD, flows clear)
  ✓ Workflow Planning            ── COMPLETED (this document)
  ✓ Application Design           ── COMPLETED (design.md + units.md)
  ✓ Units Generation             ── COMPLETED (5 units, 3 phases)

CONSTRUCTION
════════════
  Phase 1: Foundation
  ┌──────────────────────────────────────┐
  │ U-001: Browser Layout & Navigation  │
  │ → Code Generation Plan              │
  │ → Code Generation Execute           │
  │ → Build Verification                │
  └──────────────────┬───────────────────┘
                     │
  Phase 2: Core Features (parallel)
  ┌──────────────────┴───────────────────┐
  │                                      │
  ▼                                      ▼
  ┌──────────────────┐  ┌───────────────────┐
  │ U-002: Auth      │  │ U-003: Feature    │
  │ Pages            │  │ Pages             │
  │ → Plan           │  │ → Plan            │
  │ → Execute        │  │ → Execute         │
  │ → Verify         │  │ → Verify          │
  └────────┬─────────┘  └────────┬──────────┘
           │                     │
  Phase 3: Enhancements (parallel)
  ┌────────┴─────────────────────┤
  │                              │
  ▼                              ▼
  ┌──────────────────┐  ┌───────────────────┐
  │ U-005: Landing   │  │ U-004: Manual     │
  │ + Invite         │  │ Pulse             │
  │ → Plan           │  │ → Plan            │
  │ → Execute        │  │ → Execute         │
  │ → Verify         │  │ → Verify          │
  └──────────────────┘  └───────────────────┘
           │                     │
           └──────────┬──────────┘
                      ▼
        ┌─────────────────────────┐
        │ Final Build & Test      │
        │ → Full integration test │
        │ → Responsive testing    │
        │ → Regression check      │
        └─────────────────────────┘
```

---

## 3. Inception Stages

| # | Stage | Decision | Rationale |
|---|-------|----------|-----------|
| 1 | Workspace Detection | **COMPLETED** | Brownfield, single repo (pulse-web) |
| 2 | Reverse Engineering | **SKIPPED** | Full codebase analysis done during PRD creation with 4 parallel agents |
| 3 | Requirements Analysis | **COMPLETED** | 8 FR groups (46 individual FRs), 10 NFRs, 30 ACs formalized from PRD |
| 4 | User Stories | **SKIP** | User flows are clearly documented in PRD and design doc. Auth flow, dashboard flow, pulse flow diagrams cover all scenarios. No ambiguity. |
| 5 | Workflow Planning | **COMPLETED** | This document |
| 6 | Application Design | **COMPLETED** | Component architecture, data flows, integration contracts documented in design.md |
| 7 | Units Generation | **COMPLETED** | 5 units across 3 phases with dependency graph documented in units.md |

---

## 4. Construction Stages Per Unit

For each unit, the following stages are assessed:

| Stage | U-001 | U-002 | U-003 | U-004 | U-005 |
|-------|-------|-------|-------|-------|-------|
| Functional Design | SKIP | SKIP | SKIP | SKIP | SKIP |
| NFR Requirements | SKIP | SKIP | SKIP | SKIP | SKIP |
| NFR Design | SKIP | SKIP | SKIP | SKIP | SKIP |
| Infrastructure Design | SKIP | SKIP | SKIP | SKIP | SKIP |
| Code Generation Plan | **EXECUTE** | **EXECUTE** | **EXECUTE** | **EXECUTE** | **EXECUTE** |
| Code Generation Execute | **EXECUTE** | **EXECUTE** | **EXECUTE** | **EXECUTE** | **EXECUTE** |
| Build and Test | **EXECUTE** | **EXECUTE** | **EXECUTE** | **EXECUTE** | **EXECUTE** |

**Rationale for SKIPs**: All functional design, NFR requirements/design, and infrastructure design are adequately covered by the PRD, requirements.md, and design.md. No new database migrations, no infrastructure changes, no complex NFR patterns needed. The feature uses existing Supabase infrastructure and Next.js patterns.

---

## 5. Construction Prerequisites Checklist

Before starting Construction:
- [x] PRD approved by CEO
- [x] Requirements document complete (requirements.md)
- [x] Application design complete (design.md)
- [x] Implementation units defined (units.md)
- [x] Execution plan complete (this document)
- [ ] CEO approves Inception artifacts → proceed to Construction

---

## 6. Success Criteria

| Criteria | Measurement |
|----------|-------------|
| **Primary Goal** | Pulse accessible as standalone website in any browser |
| **Auth Working** | Users can sign up, log in, reset password via browser |
| **Feature Parity** | Browser dashboard, connections, settings match appview functionality |
| **Manual Pulse** | Browser users can send daily pulse |
| **Zero Regression** | All `/appview/*` routes unchanged and functional |
| **Quality Gates** | `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm test` all pass |
| **Responsive** | Works on desktop, tablet, and mobile browser |
