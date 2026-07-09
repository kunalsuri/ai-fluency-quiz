# AGENT.md

Guidelines for AI Coding Agents working on the **AI Fluency Quiz** project.

## Core Directives
1. **Dependency Management**: Use `pnpm` for installing and updating dependencies. Do not use `npm` or `yarn` commands unless `pnpm` is unavailable.
2. **Deterministic Shuffling in Tests**: Do not use standard random shuffling in unit or integration tests. Mock `Math.random` to return a stable value (e.g. `0.999`) or mock `shuffle` from `src/lib/engine.ts` directly to prevent flaky tests.
3. **No Global Event Pollutions**: Always wrap and keep references to global `window` or `document` event listeners in tests (e.g. `keydown`), and clean them up during teardown (`afterEach`) to prevent cross-test interference.
4. **Data Validation**: The project requires strict structure for data banks. If you update questions, glossary, or manifest files, always run `pnpm validate-data` (or `npm run validate-data`) to ensure validation scripts pass.
5. **No Style Placeholders**: Do not use generic style rules. Apply premium UI assets, modern typography (such as Inter or Fraunces), custom gradients, and CSS transitions.

## Verification Commands
Verify code correctness and testing suites using:
```bash
node node_modules/vitest/vitest.mjs run
```
