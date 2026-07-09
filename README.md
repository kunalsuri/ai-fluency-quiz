<!-- Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. -->

# 🧠 AI Fluency

<div align="center">

[![Vitest Tests](https://img.shields.io/badge/Vitest-203%20passed-4ab730?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Astro](https://img.shields.io/badge/Astro%207-static-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)

**How AI-fluent are you?** Ten minutes. Honest questions, real explanations, cited sources —
and a cheat sheet generated for *your* gaps.

</div>

---

## What it is

Three sections, one design, two languages (EN/FR):

1. **The Assessment** — pick who you are (*I build with AI* / *I lead with AI*) and how long you have. One question per screen, instant explanation with its citation, a tier at the end, and an in-session *retake the ones you missed* loop.
2. **Guide / Cheat Sheets** — every topic's terminology, typeset for reading and downloadable as plain-text cheat sheets (`/guide/<topic>.txt`). After a quiz, download a **personalized cheat sheet** containing exactly what you missed — plain text, so you can paste it into any AI assistant and ask to be tutored.
3. **The Frontier** — a hand-curated reading room of the landmark papers behind every concept in the quiz.

### Privacy by architecture

- **Zero storage** — no accounts, no cookies, no `localStorage`. Quiz state lives in memory and dies with the tab.
- **Zero tracking** — no analytics of any kind.
- **Zero external requests** — fonts are self-hosted; question data is embedded at build time. After page load the site talks to no one.
- Dark mode follows `prefers-color-scheme` — pure CSS, nothing persisted.

## Quick start

```powershell
.\start.ps1        # Windows: checks deps, installs, validates data, starts dev server
```

or manually, on any platform:

```bash
npm install
npm run dev        # → http://localhost:4321/
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Validate data, then build the static site into `dist/` |
| `npm test` | Run the Vitest suite (data integrity, FR parity, engine, field guide) |
| `npm run validate-data` | Validate `data/` structure, IDs, answers, citations |
| `npm run audit` | Start the **local-only** audit workbench (human data verification) |
| `npm run generate-provenance` | Regenerate `data/data-provenance.md` |

## Architecture: showroom and factory

```
┌─ THE SHOWROOM (deployed, static, read-only) ─────────────────┐
│  src/                                                        │
│  ├── pages/          EN routes + fr/ mirrors                 │
│  │   ├── index       landing — a plain HTML form, zero JS    │
│  │   ├── quiz        the one JS island (vanilla TypeScript)  │
│  │   ├── guide/      static cheat-sheet pages + .txt routes  │
│  │   └── frontier    curated papers, static                  │
│  ├── components/     Astro components (server-rendered)      │
│  ├── scripts/        quiz-island.ts — the only client JS     │
│  ├── lib/            pure logic: engine, data, i18n, txt     │
│  └── styles/         design tokens, one voice, light + dark  │
└──────────────────────────────────────────────────────────────┘
┌─ THE FACTORY (your machine only, never deployed) ────────────┐
│  data/               single source of truth (EN + .fr.json)  │
│  scripts/            validator + provenance generator        │
│  tools/              audit workbench (writes provenance)     │
│  tests/              Vitest suite                            │
└──────────────────────────────────────────────────────────────┘
```

- Every content page ships **zero JavaScript** — Astro renders it all at build time from `data/`.
- The quiz is the **only island**: a ~300-line vanilla-TypeScript state machine. Its question payload is embedded in the page at build time, so the quiz makes no fetches.
- The audit workbench (`npm run audit`) needs to **write to disk** (`data/data-provenance.md`), which is exactly why it lives outside the Astro build and can never be deployed.

## Question database

**136 questions · 15 topic banks · 4 difficulty tiers** (beginner 5 pts → expert 20 pts), with per-question explanations and HTTPS citations. 11 banks are fully translated to French (`*.fr.json`); new banks land in English first.

Technical track: foundations, LLM mechanics, transformers, prompting, RAG, agents & tooling, context engineering, harness engineering, safety & alignment, multimodal AI, ethics & governance, fine-tuning, evals & benchmarking.
Managerial track: AI business value & ROI, AI in the workspace.

Scoring tiers (technical): **AI Novice → Prompt Engineer → Context Engineer → AI-Native Architect**.
Scoring tiers (managerial): **AI Explorer → AI-Assisted Manager → AI Strategist → AI-Native Leader**.

The validator (`npm run validate-data`) enforces: manifest/bank consistency, globally unique IDs, in-bounds answers, valid difficulties, strictly increasing tiers, and HTTPS-only citations. The test suite additionally enforces EN↔FR structural parity.

## Deployment

Static output — deploy `dist/` anywhere. For **Vercel**: framework preset *Astro*, build command `npm run build`, output `dist/`. No adapter, no serverless functions, no environment variables.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
