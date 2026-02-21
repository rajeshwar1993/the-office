# Build Instructions — AppView Route Restructure

## Prerequisites
- **Node.js**: 20+
- **npm**: installed
- **Flutter SDK**: 3.10.8+
- **Environment Variables**: `.env.local` (pulse-web), `.env` (pulse-app) with Supabase credentials

## Build Steps

### 1. pulse-web — Install Dependencies
```bash
cd pulse-web
npm install
```

### 2. pulse-web — Clean Build Cache
```bash
rm -rf .next
```
**Note**: Required after route restructure to clear stale type references to old routes.

### 3. pulse-web — Production Build
```bash
npm run build
```

### 4. Verify pulse-web Build Success
- **Expected Output**: All routes listed under `/appview/*`:
  ```
  Route (app)
  ├ ƒ /
  ├ ƒ /appview/auth/callback
  ├ ƒ /appview/auth/error
  ├ ƒ /appview/connections
  ├ ƒ /appview/dashboard
  ├ ƒ /appview/profile-setup
  └ ƒ /appview/settings
  ```
- **Build Artifacts**: `.next/` directory
- **Verify**: No routes exist at old paths (`/dashboard`, `/connections`, `/settings`, `/profile-setup`)

### 5. pulse-web — TypeScript Check
```bash
npx tsc --noEmit
```
- **Expected**: No errors

### 6. pulse-app — Get Dependencies
```bash
cd pulse-app
flutter pub get
```

### 7. pulse-app — Static Analysis
```bash
flutter analyze
```
- **Expected**: No new issues introduced (pre-existing issues may exist)

## Troubleshooting

### Build Fails with stale `.next` type references
- **Cause**: Old `.next/types/validator.ts` references deleted routes
- **Solution**: `rm -rf .next` then rebuild

### Import errors for moved pages
- **Cause**: Components still reference old route paths
- **Solution**: Verify all `@/` imports use component paths (not page paths)
