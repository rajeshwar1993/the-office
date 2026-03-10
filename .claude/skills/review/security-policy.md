# Security Policy: Zero Trust

## 1. Secrets Management
- **Rule:** No secrets in code. Ever.
- **Check:** Verify all configuration is pulled from environment variables (`process.env` or similar).

## 2. Database Security (Supabase/Postgres)
- **Rule:** Row Level Security (RLS) must be enabled on every table.
- **Check:** Verify that any `select`, `insert`, or `update` includes a policy check for `auth.uid()`.

## 3. Frontend Security
- **Rule:** No sensitive data in local storage unless encrypted.
- **Check:** Verify `dangerouslySetInnerHTML` is never used in React/Next.js without explicit CEO approval.

## 4. Dependency Security
- **Rule:** No "blind" updates of packages.
- **Check:** Ensure no deprecated or high-vulnerability packages are introduced in `package.json` or `pubspec.yaml`.
