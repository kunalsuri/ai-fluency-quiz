# AGENTS.md

Persistent behavioral guidelines and reference commands for Codex in the **AI Fluency Quiz** project.

## Project Overview
AI Fluency Quiz is a self-assessment static website built with Astro. It features role-specific assessments (technical vs. managerial), custom terminology sheets, and landmark paper archives in both English and French.

## Core Commands
- **Install Dependencies**: `pnpm install` (preferred) or `npm install`
- **Development Server**: `pnpm dev` or `npm run dev`
- **Production Build**: `pnpm build` or `npm run build` (runs validation + astro build)
- **Data Validator**: `pnpm validate-data` or `npm run validate-data`
- **Run Tests**:
  - Direct Node execution (works in sandboxed environments): `node node_modules/vitest/vitest.mjs run`
  - Standard command: `pnpm test` or `npm test`
- **TypeScript Check**: `pnpm exec tsc` or `npx tsc`

## Code Style & Conventions
- **Language**: Strict TypeScript for core logic (`src/lib/`, `src/scripts/`).
- **Imports**: Always use explicit type imports where applicable, e.g., `import type { Question } from './types'`.
- **UI Components**: Written as static Astro components (`src/components/`, `src/pages/`). Keep them lightweight.
- **Styling**: Vanilla CSS for maximum speed and compatibility. Do not add utility CSS frameworks (like Tailwind) unless explicitly requested.
- **I18n**: Support parity between English and French. Any new text must be added to `src/lib/i18n.ts` under both `en` and `fr` keys.
- **Data Integrity**: JSON files under `data/` must conform to `data/manifest.json`. Always run `npm run validate-data` to check questions, keys, and formats before committing.
