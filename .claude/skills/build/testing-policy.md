# Testing Policy

## 1. Universal Principles

### AAA Pattern (Arrange-Act-Assert)
All tests must follow:
1. **Arrange:** Set up the necessary data and mocks.
2. **Act:** Execute the specific function being tested.
3. **Assert:** Verify the output matches the expectation.

### Mocking Strategy
- Use mocks for external services and databases.
- Integration tests (using real databases) only when specified in the tech spec.

### Test Naming
- Descriptive names: `should_return_401_when_token_is_expired()`.
- If a test is skipped or disabled, include a `// TODO` comment explaining why.

## 2. Backend Testing (Supabase/PostgreSQL/Deno)

- **Core Logic:** 100% coverage for business-critical algorithms and calculations.
- **API Endpoints:** Every endpoint must have at least one "Success" test and two "Failure" tests (e.g., 400 Bad Request, 401 Unauthorized).
- **Edge Cases:** Null inputs, empty strings, and maximum value limits must be tested.

## 3. Web Frontend Testing (Next.js/React)

### Framework
- **Runner:** Vitest
- **Component Testing:** React Testing Library
- **Test Location:** Co-located `__tests__/` directories next to components

### Test Layers
- **Unit Tests:** Pure functions, utilities, and hooks.
- **Component Tests:** Render with React Testing Library. Test user interactions, verify accessible markup. Mock Supabase client.
- **Integration Tests:** Full page renders with mocked API responses. Verify Server Component → Client Component data flow. Test loading/error/empty states.

### Conventions
- Use `screen.getByRole()` over `getByTestId()` — prefer accessible queries.
- Mock external dependencies at the module level.
- Every data-fetching component must test: success, loading, error, and empty states.

### Commands
```bash
npm test              # Watch mode
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage report
npx tsc --noEmit      # Type checking
```

## 4. Mobile Testing (Flutter)

- Widget tests for individual components.
- Integration tests using Flutter Integration Test suite.
- Run `flutter analyze` — 0 warnings allowed.
- Run `flutter test` for all widget tests.

## 5. Coverage Expectations

- **Backend:** 80%+ for business logic; 100% for core algorithms.
- **Web:** 80%+ for utilities; all user paths for interactive components.
- **Mobile:** Widget tests for all screens; integration tests for critical flows.
