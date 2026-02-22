# PRD: Storybook Integration for pulse-web

**Feature ID:** FEAT-20260222-storybook-creation
**Author:** Nexus (Product Architect)
**Status:** Draft
**Date:** 2026-02-22
**Approved By:** CEO

## Problem Statement

The pulse-web project has 7 core UI components (StatusCard, ConnectionCard, ConnectionGrid, WisdomCard, InviteModal, Toast, PulseLogo) plus providers and shared components — all hand-built with Tailwind CSS v4 and custom design tokens. Currently, the only way to visually inspect and iterate on these components is by running the full Next.js app and navigating to the relevant screen. This makes it slow and cumbersome to:

- Develop new components in isolation without wiring up backend data
- Visually verify all component states (active/inactive, loading, error, empty)
- Document component APIs and usage patterns for future development
- Catch visual regressions when modifying shared styles or design tokens

**JTBD:** When building or modifying a UI component, the developer wants to see it rendered in all its states instantly, without spinning up the full app and manually navigating to the right screen with the right data.

## Proposed Solution

Add **Storybook 10** to pulse-web using the `@storybook/nextjs-vite` framework adapter. This provides:

- A dedicated component development environment at `localhost:6006`
- Interactive controls (knobs) for toggling component props
- Automatic documentation of component APIs
- Full compatibility with Next.js 16, React 19, and Tailwind CSS v4

Storybook 10 is the first version with day-one Next.js 16 support and ships with the Vite-based `@storybook/nextjs-vite` adapter as the recommended framework.

## User Stories

- **As a** developer, **I want to** view any component in isolation with different props, **so that** I can iterate on its design without running the full app.
- **As a** developer, **I want to** see all possible states of a component side-by-side (active, inactive, loading, empty, error), **so that** I can verify edge cases visually.
- **As a** developer, **I want to** auto-generate documentation from component props, **so that** I have a living style guide that stays in sync with the code.
- **As a** developer, **I want to** use Storybook's controls to tweak props interactively, **so that** I can rapidly experiment with different configurations.

## Acceptance Criteria

- [ ] Storybook 10 is installed with `@storybook/nextjs-vite` framework adapter
- [ ] `npm run storybook` launches the Storybook dev server on `localhost:6006`
- [ ] `npm run build-storybook` produces a static build in `storybook-static/`
- [ ] Tailwind CSS v4 styles (including custom CSS variables/design tokens) render correctly in stories
- [ ] Stories exist for all core UI components:
  - [ ] StatusCard (active, inactive states)
  - [ ] ConnectionCard (active, waiting states)
  - [ ] ConnectionGrid (populated, empty states)
  - [ ] WisdomCard (visible, dismissed states)
  - [ ] InviteModal (open state with QR code)
  - [ ] Toast (success, error, info variants)
  - [ ] PulseLogo (default)
- [ ] Stories use CSF3 (Component Story Format 3) with `satisfies Meta` typing
- [ ] `next-intl` translations are mocked/provided so i18n-dependent components render
- [ ] Biome linting passes on all story files
- [ ] `.storybook/` config and `storybook-static/` output are properly gitignored (output only)
- [ ] Existing tests (`npm test`) and build (`npm run build`) continue to pass

## Scope

### In Scope
- Storybook 10 installation and configuration with `@storybook/nextjs-vite`
- Tailwind CSS v4 integration (globals.css import, design tokens)
- Stories for all 7 existing core components
- Mocking of `next-intl` for i18n-dependent components
- npm scripts: `storybook` (dev) and `build-storybook` (static)
- `.storybook/main.ts` and `.storybook/preview.ts` configuration

### Out of Scope
- Storybook addons beyond what ships by default (a11y, interactions, etc. — can be added later)
- Visual regression testing integration (Chromatic, Percy, etc.)
- Server Component stories (RSC support is experimental — defer to a future iteration)
- Stories for page-level layouts (`app/` routes)
- CI/CD pipeline for Storybook (deploy, automated screenshot tests)
- Storybook for pulse-app (Flutter)

## Technical Approach

### Framework & Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| Storybook | 10.x (latest) | Component dev environment |
| `@storybook/nextjs-vite` | 10.x | Next.js + Vite framework adapter |
| `@storybook/react` | 10.x | React renderer |

### Configuration

**`.storybook/main.ts`** — Framework config, story file globs, Tailwind setup:
```typescript
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: "@storybook/nextjs-vite",
  addons: ["@storybook/addon-essentials"],
};

export default config;
```

**`.storybook/preview.ts`** — Global decorators for Tailwind and i18n:
```typescript
import type { Preview } from "@storybook/react";
import "../src/app/globals.css"; // Tailwind + design tokens

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true, // App Router support
    },
  },
};

export default preview;
```

### Story File Convention

Stories co-located with components following the existing test pattern:
```
components/dashboard/
├── status-card.tsx
├── status-card.stories.tsx    # NEW
├── index.ts
└── __tests__/
    └── status-card.test.tsx
```

### i18n Mocking Strategy

Provide a `next-intl` mock decorator in `.storybook/preview.ts` using `NextIntlClientProvider` with static messages, similar to the existing test mocks in `__tests__/` files.

## Non-Functional Requirements

- **Performance:** Storybook dev server should start in < 10s (Vite-based, fast HMR)
- **DX:** No additional config burden — Tailwind, path aliases (`@/`), and TypeScript work automatically via the framework adapter
- **Compatibility:** Must not interfere with existing `npm run dev`, `npm test`, or `npm run build` commands
- **Code Quality:** Story files must pass Biome linting with existing config

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Core components with stories | 7/7 (100%) | Count of `.stories.tsx` files |
| Storybook build succeeds | Zero errors | `npm run build-storybook` exit code |
| Existing tests unaffected | All pass | `npm test` exit code |
| Next.js build unaffected | Succeeds | `npm run build` exit code |

## Dependencies

- Node.js and npm (already installed)
- Existing pulse-web project with Next.js 16, React 19, Tailwind CSS v4 (all in place)
- No backend or Flutter dependencies

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Storybook 10 + Next.js 16 edge-case incompatibilities | Medium | Use `@storybook/nextjs-vite` (officially supported); pin to stable 10.x release |
| Tailwind v4 styles not rendering in Storybook | Medium | Import `globals.css` in preview.ts; configure Vite plugin if needed |
| `next-intl` breaks in Storybook context | Low | Provide mock decorator with `NextIntlClientProvider` (pattern proven in tests) |
| Story files increase bundle/lint surface | Low | Stories excluded from Next.js build by default; Biome handles linting |

## Open Questions

- [ ] Should we enable the experimental RSC feature flag now or defer? (Recommendation: defer)
- [ ] Should we add `@storybook/addon-a11y` in this iteration or in a follow-up? (Recommendation: follow-up)
