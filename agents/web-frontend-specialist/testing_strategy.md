# Pixel Testing Strategy — Next.js / React

Testing approach for the Pulse web frontend aligned with the Pixel Protocol (Phase 4: Verification).

## Test Framework

- **Runner:** Vitest
- **Component Testing:** React Testing Library
- **Test Location:** Co-located `__tests__/` directories next to the components they test

## Test Layers

### Unit Tests
- Pure functions, utilities, and hooks
- Type validation and data transformations
- Run with `npm test`

### Component Tests
- Render components with React Testing Library
- Test user interactions (clicks, form submissions, keyboard events)
- Verify accessible markup (roles, labels, ARIA attributes)
- Mock Supabase client for data-dependent components

### Integration Tests
- Test full page renders with mocked API responses
- Verify Server Component → Client Component data flow
- Test loading states, error boundaries, and empty states

## Conventions

- Test file naming: `[component-name].test.tsx` inside `__tests__/`
- Use `screen.getByRole()` over `getByTestId()` — prefer accessible queries
- Mock external dependencies (Supabase client, fetch) at the module level
- Every data-fetching component must have tests for: success, loading, error, and empty states

## Commands

```bash
npm test              # Watch mode
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage report
npx tsc --noEmit      # Type checking (run alongside tests)
```

## Coverage Expectations

- Business logic utilities: 80%+
- Interactive components (forms, modals): test all user paths
- Layout/presentational components: test only if they contain conditional logic
