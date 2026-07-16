<!-- Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. -->

<div align="center">

# 🧠 AI Fluency Quiz

**How AI-fluent are you?** 

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro%207-static-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![Vitest Tests](https://img.shields.io/badge/Vitest-passing-4ab730?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

Ten minutes. Honest questions, real explanations, cited sources —
and a cheat sheet generated for *your* gaps.

[🌐 Live Demo](https://ai-fluency-quiz-rust.vercel.app/) · [📚 Docs](docs/)

</div>

<br>

---

## What it is?

Three sections, one design, two languages (EN/FR):

1. **The Assessment** — pick who you are (*I build with AI* / *I lead with AI*) and how long you have. One question per screen, instant explanation with its citation, a tier at the end, and an in-session *retake the ones you missed* loop.
2. **Guide / Cheat Sheets** — every topic's terminology, typeset for reading and downloadable as plain-text cheat sheets (`/guide/<topic>.txt`). After a quiz, download a **personalized cheat sheet** containing exactly what you missed — plain text, so you can paste it into any AI assistant and ask to be tutored.
3. **The Frontier** — a hand-curated reading room of the landmark papers behind every concept in the quiz.

<br>

### Privacy by architecture

- **No accounts or cookies** — quiz answers live only in memory and die with the tab. The optional color-theme preference is the only value stored in `localStorage`.
- **Privacy-focused telemetry** — Vercel Web Analytics and Speed Insights collect anonymous, aggregate usage and performance data. Quiz URL query parameters are removed before telemetry is sent.
- **No remote content dependencies** — fonts are self-hosted and question data is embedded at build time; no quiz answers are sent to a server.
- Dark mode follows `prefers-color-scheme` by default and can be overridden with the header toggle.

<br>

---

## Quick start

```powershell
.\scripts\start.ps1  # Windows: checks deps, installs, validates data, starts dev server
```

or manually, on any platform:

```bash
npm install
npm run dev        # → http://localhost:4321/
```

<br>

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Validate data, then build the static site into `dist/` |
| `npm test` | Run the Vitest suite (data integrity, FR parity, engine, field guide) |
| `npm run validate-data` | Validate `data/` structure, IDs, answers, citations |
| `npm run analyze-question-quality` | Report answer-length, wording-cue, duplicate, and citation indicators |
| `npm run audit` | Start the **local-only** audit workbench (human data verification) |
| `npm run generate-provenance` | Regenerate `data/data-provenance.md` |

<br>

## Architecture: showroom and factory

```
┌─ THE SHOWROOM (deployed, static, read-only) ─────────────────┐
│  src/                                                        │
│  ├── pages/          EN routes + fr/ mirrors                 │
│  │   ├── index       landing — HTML form + match counter    │
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

- Every content page is statically rendered by Astro. Small scripts handle the theme toggle and anonymous Vercel telemetry; the landing page also adds a progressive match counter.
- The quiz is the only application-style island: a vanilla-TypeScript state machine. Its question payload is embedded in the page at build time, so quiz answers require no API or database.
- The audit workbench (`npm run audit`) needs to **write to disk** (`data/data-provenance.md`), which is exactly why it lives outside the Astro build and can never be deployed.

<br>

---

## Question database

**136 questions · 15 topic banks · 4 difficulty tiers** (beginner 5 pts → expert 20 pts), with per-question explanations and HTTPS citations. 11 banks are fully translated to French (`*.fr.json`); new banks land in English first.

Technical track: foundations, LLM mechanics, transformers, prompting, RAG, agents & tooling, context engineering, harness engineering, safety & alignment, multimodal AI, ethics & governance, fine-tuning, evals & benchmarking.
Managerial track: AI business value & ROI, AI in the workspace.

Scoring tiers (technical): **AI Novice → Prompt Engineer → Context Engineer → AI-Native Architect**.
Scoring tiers (managerial): **AI Explorer → AI-Assisted Manager → AI Strategist → AI-Native Leader**.

The validator (`npm run validate-data`) enforces: manifest/bank consistency, globally unique IDs, in-bounds answers, valid difficulties, strictly increasing tiers, and HTTPS-only citations. The test suite additionally enforces EN↔FR structural parity.

<br>

---

## Deployment

Static output — deploy `dist/` anywhere. For **Vercel**: framework preset *Astro*, build command `npm run build`, output `dist/`. No adapter, no serverless functions, no environment variables.

<br>

---

## 📄 Acknowledgments & License

The **AI Fluency Quiz** project is open-source and licensed under the [Apache License 2.0](LICENSE)

**Warranty & Liability Notice**: This software is provided under the Apache License 2.0 on an "AS IS" basis, without warranties or conditions of any kind, either express or implied. To the extent permitted by the license and applicable law, the authors and contributors disclaim warranties and limit liability. Please refer to the LICENSE file for the complete terms, including Sections 7 (Disclaimer of Warranty) and 8 (Limitation of Liability). See the LICENSE file for the full license text.

Copyright © 2026 Kunal Suri ([@kunalsuri](https://github.com/kunalsuri)) (CEA LIST).

