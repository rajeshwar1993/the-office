# PRD: UI Component Atomization

**Feature ID:** FEAT-20260222-component-atomization
**Author:** Nexus (Product Architect)
**Status:** Draft
**Date:** 2026-02-22
**Approved By:** CEO

## Problem Statement

The pulse-web codebase has 14 repeated UI patterns scattered across 20+ files. Buttons are styled 12 different ways across 7 files, card containers appear 9 times with inconsistent padding/radius, section headings use 4 different font-size/weight combinations, and loading spinners are reimplemented 4 times. This makes it:

- **Error-prone** — changing the primary teal button style requires editing 8 separate locations
- **Inconsistent** — the same "primary button" has `rounded-lg` in some places and `rounded-2xl` in others, `py-3` vs `py-4`, different hover states
- **Slow to build** — every new page requires re-composing Tailwind class strings from scratch instead of using proven atoms
- **Hard to review** — PRs contain 30+ lines of Tailwind classes that obscure the actual logic change

**JTBD:** When building a new screen or modifying an existing one, the developer wants to compose from a library of proven, consistent atomic components so that the UI stays uniform and changes propagate automatically.

## Proposed Solution

Extract repeated UI patterns into a set of atomic reusable components under `src/components/ui/`. Each component:

- Accepts typed props for variants, sizes, and states
- Uses the existing design tokens from `globals.css`
- Has a Storybook story for visual documentation
- Is a drop-in replacement for the raw Tailwind patterns currently used inline

The extraction follows Atomic Design principles: atoms (Button, Heading, Spinner, etc.) compose into molecules (Card, Modal, Avatar) which compose into organisms (the existing dashboard/connections components).

## User Stories

- **As a** developer, **I want to** use `<Button variant="primary">` instead of copy-pasting 8 Tailwind classes, **so that** all primary buttons look and behave identically.
- **As a** developer, **I want to** use `<Card>` with consistent padding and border, **so that** every container in the app has the same visual weight.
- **As a** developer, **I want to** use `<Spinner />` instead of reimplementing the loading animation, **so that** spinners are consistent and I save time.
- **As a** developer, **I want to** browse all available atoms in Storybook, **so that** I know what's available before writing custom markup.

## Acceptance Criteria

- [ ] All atomic components created under `src/components/ui/`
- [ ] Each component has a co-located Storybook story (`.stories.tsx`)
- [ ] Existing components refactored to use the new atoms (no raw Tailwind duplication for covered patterns)
- [ ] All existing tests pass after refactoring
- [ ] Storybook build succeeds with new stories
- [ ] Next.js build succeeds
- [ ] Biome linting passes
- [ ] No visual regressions (components render identically before and after)

## Scope

### In Scope — Atomic Components to Create

#### Tier 1: High Priority (most duplication)

1. **`Button`** — Primary, secondary, danger, icon-only variants; sm/md/lg sizes; loading and disabled states; polymorphic (`<button>` or `<a>`/Next.js `<Link>`)
2. **`Card`** — White container with consistent border, radius, shadow, padding; optional hover elevation
3. **`Heading`** — Section heading with level prop (h1-h3), size/weight presets matching current usage

#### Tier 2: Medium Priority

4. **`Spinner`** — Animated loading spinner; sm/md/lg sizes; color variants (teal, white)
5. **`IconBadge`** — Icon inside a colored circle; size and color props
6. **`Avatar`** — Circular image with ring, optional status dot, active/inactive states
7. **`Modal`** — Overlay backdrop + dialog container; focus trap, escape-to-close, click-outside-to-close
8. **`StatusDot`** — Small colored dot for active/inactive state; optional ping animation

#### Tier 3: Low Priority (fewer instances, still valuable)

9. **`FormInput`** — Text input with label, focus ring, disabled state, character count
10. **`Alert`** — Error/warning/info message box with icon
11. **`Skeleton`** — Skeleton loader shapes (rectangle, circle, text line) with pulse animation
12. **`EmptyState`** — Icon + heading + message + CTA pattern

### In Scope — Refactoring

- Refactor all existing components and pages to use the new atoms
- Update existing Storybook stories to reflect the refactored components

### Out of Scope

- New components that don't exist yet (e.g., dropdown, tooltip, tabs)
- Design token changes (colors, fonts, spacing values stay as-is)
- Accessibility improvements beyond what's already present
- Animation library changes (framer-motion usage stays as-is)
- Dark mode / theming system

## Technical Approach

### Component API Design

**Button:**
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean; // for rendering as Link
}
```

**Card:**
```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}
```

**Heading:**
```tsx
interface HeadingProps {
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md";
  children: React.ReactNode;
}
```

### File Structure

```
src/components/ui/
├── button.tsx              # NEW
├── button.stories.tsx      # NEW
├── card.tsx                # NEW
├── card.stories.tsx        # NEW
├── heading.tsx             # NEW
├── heading.stories.tsx     # NEW
├── spinner.tsx             # NEW
├── spinner.stories.tsx     # NEW
├── icon-badge.tsx          # NEW
├── icon-badge.stories.tsx  # NEW
├── avatar.tsx              # NEW
├── avatar.stories.tsx      # NEW
├── modal.tsx               # NEW
├── modal.stories.tsx       # NEW
├── status-dot.tsx          # NEW
├── status-dot.stories.tsx  # NEW
├── form-input.tsx          # NEW
├── form-input.stories.tsx  # NEW
├── alert.tsx               # NEW
├── alert.stories.tsx       # NEW
├── skeleton.tsx            # NEW
├── skeleton.stories.tsx    # NEW
├── empty-state.tsx         # NEW
├── empty-state.stories.tsx # NEW
├── pulse-logo.tsx          # EXISTING
├── pulse-logo.stories.tsx  # EXISTING
├── toast.tsx               # EXISTING
└── toast.stories.tsx       # EXISTING
```

### Refactoring Strategy

1. Create the atomic component with all variants
2. Add Storybook story verifying all variants render correctly
3. Replace inline Tailwind patterns in consuming components one at a time
4. Run tests after each replacement to catch regressions
5. Verify visual parity in Storybook

### className Forwarding

All components accept an optional `className` prop merged with internal styles for escape-hatch customization, using simple string concatenation (no external utility needed since Tailwind v4 handles specificity).

## Non-Functional Requirements

- **Performance:** No runtime overhead — components are thin wrappers around native elements with static class strings
- **Bundle size:** Zero additional dependencies; atoms use only Tailwind classes and React
- **DX:** Full TypeScript autocompletion for variant/size props
- **Compatibility:** Must not break existing functionality; pure refactor with no behavior changes

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Atomic components created | 12/12 | Count of new `ui/*.tsx` files |
| Storybook stories | 12+ new stories | Count of new `.stories.tsx` files |
| Components refactored | All consuming files updated | Grep for raw patterns eliminated |
| Existing tests | All pass | `npm test` exit code |
| Build | Passes | `npm run build` and `npm run build-storybook` |

## Dependencies

- Storybook 10 integration (FEAT-20260222-storybook-creation) — COMPLETE
- Existing design tokens in `globals.css` — in place
- No backend or Flutter dependencies

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regressions during refactor | Medium | Compare Storybook renders before/after; run existing tests |
| Over-abstraction making components inflexible | Medium | Keep APIs minimal; accept `className` escape hatch on all components |
| Large PR size due to many file changes | Low | Tier the work (Tier 1 first, then 2 and 3); could split into multiple PRs if needed |
| Breaking existing test mocks | Low | Tests mock `next-intl`, not UI atoms; atoms are pure presentational |

## Open Questions

- [ ] Should we use a `cn()` utility (e.g., `clsx` + `tailwind-merge`) for className merging, or keep it as simple string concatenation? (Recommendation: simple concatenation for now, add utility if conflicts arise)
- [ ] Should Tier 3 components (FormInput, Alert, Skeleton, EmptyState) be included in the initial PR or deferred to a follow-up? (Recommendation: include all in one PR since they're straightforward)
