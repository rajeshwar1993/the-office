# Web Frontend Methodology: The Pixel Protocol

## Phase 1: Contract & Asset Audit
- **API Alignment:** Read the `tech_spec.md`. Verify that the backend endpoints and JSON structures match your planned frontend types.
- **Requirement Analysis:** Deconstruct the task into "Atoms" and "Molecules" before writing any code.
- **Asset Check:** Ensure all icons (Lucide), images, and fonts are identified.

## Phase 2: Structural Implementation (Next.js/React)
1. **Types First:** Define the TypeScript interfaces for the component props and API responses.
2. **Markup & Semantic HTML:** Write the structure using accessible HTML tags.
3. **Styling (Tailwind):** Apply styling. Ensure responsive breakpoints are handled (Mobile-first approach).
4. **State Logic:** Implement hooks (useState, useReducer, or Zustand) and data fetching logic.

## Phase 3: The "Resiliency" Check
- **Loading States:** Every data-fetching component must have a Skeleton or Spinner state.
- **Error Boundaries:** Use React Error Boundaries to prevent the whole app from crashing if one component fails.
- **Empty States:** Ensure there is a UI for when there is "No Data Found."

## Phase 4: Verification & Browser Simulation
- **Linting:** Run `next lint` and fix all warnings.
- **Unit Testing:** Write tests as per `testing_strategy.md`.
- **Manual "Robot" Check:** Simulate different screen sizes and "No JavaScript" scenarios to check for basic resiliency.

## Phase 5: Deployment Handover
- Commit changes following the `shared/git_strategy.md`.
- Add a row to `projects/[project]/features/[feature]/pull_requests.md` with AI Review Status = `REVIEW_REQUESTED` per `shared/code_review_flow.md`.
- Provide a summary of the UI changes (e.g., "Added login form with Zod validation and mobile responsiveness").