# Unit Test Policy & Strategy

## 1. Mandatory Coverage
- **Core Logic:** 100% coverage for business-critical algorithms and calculations.
- **API Endpoints:** Every endpoint must have at least one "Success" test and two "Failure" tests (e.g., 400 Bad Request, 401 Unauthorized).
- **Edge Cases:** Null inputs, empty strings, and maximum value limits must be tested.

## 2. Test Structure (AAA Pattern)
All tests must follow the **Arrange-Act-Assert** pattern:
1. **Arrange:** Set up the necessary data and mocks.
2. **Act:** Execute the specific function being tested.
3. **Assert:** Verify the output matches the expectation.

## 3. Mocking & Dependencies
- Use **Mocks** (e.g., Mockito for Java, Mockall for Rust) for external services and databases.
- Integration tests (using real databases) are only required if specified in the `tech_spec.md`.

## 4. Documentation of Tests
- Test names must be descriptive: `should_return_401_when_token_is_expired()`.
- If a test is skipped or disabled, there must be a `// TODO` comment explaining why.