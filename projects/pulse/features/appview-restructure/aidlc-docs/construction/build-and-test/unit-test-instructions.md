# Unit Test Execution — AppView Route Restructure

## Run Unit Tests

### 1. pulse-web — Execute All Tests
```bash
cd pulse-web
npm test -- --run
```

### 2. Review Test Results
- **Tests affected by this change**: `settings-page.test.tsx` (updated href assertion from `/dashboard` to `/appview/dashboard`)
- **Expected**: Settings page test passes with updated path assertion
- **Pre-existing failures**: 49 tests in dashboard component tests (`empty-connections-view`, `wisdom-card`, `status-card`, `connection-card`) fail due to missing `next-intl` context mocks — these are NOT related to this change

### 3. Test Breakdown

| Test File | Tests | Status | Notes |
|-----------|-------|--------|-------|
| `config.test.ts` | 6 | PASS | i18n config tests |
| `wisdom-service.test.ts` | 10 | PASS | Wisdom service logic |
| `locale-service.test.ts` | 16 | PASS | Locale persistence |
| `settings-page.test.tsx` | 5 | PASS | **Updated assertion for /appview/dashboard** |
| `language-selector.test.tsx` | 6 | PASS | Language selector UI |
| `empty-connections-view.test.tsx` | 10 | FAIL (pre-existing) | Missing next-intl mock |
| `wisdom-card.test.tsx` | 10 | FAIL (pre-existing) | Missing next-intl mock |
| `status-card.test.tsx` | 10 | FAIL (pre-existing) | Missing next-intl mock |
| `connection-card.test.tsx` | 19 | FAIL (pre-existing) | Missing next-intl mock |

### 4. pulse-app — No Unit Tests Affected
The WebView URL change in `pulse_webview.dart` has no associated unit tests that reference the URL string.
