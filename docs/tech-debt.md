# Tech Debt & Known Issues

## 1. Tailwind v4 Styling & Semantic Colors
- **Issue**: Attempts to implement semantic color abstraction (e.g., `primary`, `secondary`) using Tailwind v4's `@theme` or `tailwind.config.mjs` consistently failed in this environment. Styles such as `bg-primary` were generally not applied or required strict `!important` overrides to take precedence over default or component-level styles.
- **Current State**: We have reverted to using direct color utility classes (e.g., `bg-blue-600`) often with `!important` (e.g., `!bg-blue-600`) to ensure styles are applied correctly, especially for state changes like tabs and smoke effects.
- **Future Action**: Investigate the build chain (postcss, turbopack, next.js atomic CSS generation) to understand why variable consumption is failing. Re-attempt semantic refactor once the environment is stabilized.
- **Resolution Status**: **WONTFIX** / **POSTPONED** (as of 2026-01-17, reverted to working implementation).
