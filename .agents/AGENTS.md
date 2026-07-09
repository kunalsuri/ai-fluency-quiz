# AGENTS.md

Workspace-scoped rules for AI agents in **AI Fluency Quiz**.

- **Package Manager**: Always use `pnpm` rather than `npm` when running or modifying packages.
- **Flaky Tests / Randomness**: Spying on `Math.random` to return a stable value (e.g. `0.999`) makes arrays shuffled with `src/lib/engine.ts`'s `shuffle` method deterministic for testing.
- **Event Listeners**: Ensure client-side mock tests on the `document` clean up their registered listeners in `afterEach` to prevent event collision.
- **Build Validity**: Always check that `pnpm validate-data` passes when updating data JSON structures.
