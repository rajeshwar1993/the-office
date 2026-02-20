# Web UI Standards: The Pixel Protocol

## 1. Browser Compatibility & NFRs
- **Core Web Vitals:** Focus on LCP (Largest Contentful Paint) and CLS. Use Next/Image for all images.
- **Compatibility:** Support the last 2 versions of major browsers. Use Polyfills only where necessary.
- **Mobile First:** All UI must be responsive. Test breakpoints: 320px, 768px, 1024px, 1440px.

## 2. Accessibility (a11y)
- Must meet WCAG 2.1 Level AA standards.
- Use semantic HTML (`<main>`, `<nav>`, `<section>`).
- Every interactive element must have a focus state and ARIA labels where necessary.