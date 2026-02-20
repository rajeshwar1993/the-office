# Backend Coding Standards: The Gold Standard

## 1. Universal Principles
- **Statelessness:** Backend logic must be stateless whenever possible to allow for horizontal scaling.
- **Fail Fast:** Validate inputs immediately. If an error occurs, return a meaningful error code and stop execution.
- **Explicit over Implicit:** No "magic" numbers or hidden logic. Use named constants and clear variable names.

## 2. Language-Specific Rules
### Java (Spring Boot)
- Use **Records** for DTOs.
- Avoid `@Autowired` on fields; use **Constructor Injection**.
- Follow the **Controller-Service-Repository** pattern strictly.

### Rust
- Use `Result` and `Option` for error handling; **NEVER** use `unwrap()` or `expect()` in production code.
- Minimize use of `unsafe` blocks.
- Leverage the **Newtype pattern** for type safety.

### Go
- Use **Interfaces** for decoupling, but only where multiple implementations are likely.
- Handle every error immediately (`if err != nil`).
- Keep function signatures small and focused.

## 3. Review Checklist (Self-Audit)
Before submitting code, check:
- [ ] Is there any dead code?
- [ ] Are all external dependencies necessary?
- [ ] Is the logging descriptive enough for debugging without being "noisy"?