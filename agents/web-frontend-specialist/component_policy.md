# Component & Testing Manifesto

## 1. Atomic Design Principles
- **Atoms:** Buttons, Inputs, Labels (No business logic).
- **Molecules:** SearchBar, FormField (Groups of atoms).
- **Organisms:** Header, UserProfileCard (Complex UI sections).
- **Templates/Pages:** Layouts and Next.js Pages.

## 2. Component Requirements
- Every component must be in its own folder with an `index.tsx`, `types.ts`, and `[component].test.tsx`.
- Use **TypeScript Interfaces** for all Props. No `any` types allowed.

## 3. Testing Strategy
- **Unit Tests:** Test all utility functions and pure logic.
- **Component Tests:** Use React Testing Library to verify that components render and respond to events correctly.
- **Snapshot Testing:** Use sparingly for complex UI components to catch regression.