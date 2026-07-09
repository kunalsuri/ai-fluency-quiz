// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
// Plain-text generators for the downloadable "field guide" files.
// Used at build time (per-topic sheets → static .txt routes) and in the quiz
// island (personalized guide → client-side Blob download). Plain text on
// purpose: it pastes cleanly into any AI assistant as study context.
import type { Answer, Lang, ScoringTier, TerminologyEntry } from './types';

const RULE = '='.repeat(64);
const THIN = '-'.repeat(64);

function header(lang: Lang, subtitle: string): string {
  const title = lang === 'fr' ? 'AI FLUENCY — FICHE DE RÉVISION' : 'AI FLUENCY — CHEAT SHEET';
  return `${RULE}\n${title}\n${subtitle}\n${RULE}\n`;
}

function formatTerm(t: TerminologyEntry, lang: Lang): string {
  const exampleLabel = lang === 'fr' ? 'ex.' : 'e.g.';
  const lines = [`* ${t.term}`, `  ${t.definition}`];
  if (t.example) lines.push(`  ${exampleLabel} ${t.example}`);
  return lines.join('\n');
}

/** One topic's cheat sheet — the static download on each Field Guide page. */
export function topicSheet(lang: Lang, topic: string, description: string, terms: TerminologyEntry[]): string {
  const count = lang === 'fr' ? `${terms.length} termes` : `${terms.length} terms`;
  const body = terms.map((t) => formatTerm(t, lang)).join('\n\n');
  const tip =
    lang === 'fr'
      ? 'Astuce : collez ce fichier dans votre assistant IA préféré et demandez un tutorat.'
      : 'Tip: paste this file into your favorite AI assistant and ask to be tutored on it.';
  return `${header(lang, topic)}\n${description}\n${count}\n\n${THIN}\n\n${body}\n\n${THIN}\n${tip}\n`;
}

/** The personalized post-quiz guide: missed questions + glossary for those gaps. */
export function personalGuide(
  lang: Lang,
  opts: {
    percent: number;
    score: number;
    maxScore: number;
    tier: ScoringTier;
    missed: Answer[];
    terms: TerminologyEntry[];
    date?: Date;
  },
): string {
  const fr = lang === 'fr';
  const date = (opts.date ?? new Date()).toISOString().slice(0, 10);
  const sub = fr
    ? `Généré le ${date} · Score ${opts.percent}% (${opts.score}/${opts.maxScore} pts) · ${opts.tier.status}`
    : `Generated ${date} · Score ${opts.percent}% (${opts.score}/${opts.maxScore} pts) · ${opts.tier.status}`;
  const parts: string[] = [header(lang, sub)];

  if (opts.missed.length === 0) {
    parts.push(fr ? 'Un sans-faute — rien à réviser.\n' : 'A perfect run — nothing to review.\n');
    return parts.join('\n');
  }

  const missedHead = fr
    ? `CE QUE VOUS AVEZ MANQUÉ (${opts.missed.length})`
    : `WHAT YOU MISSED (${opts.missed.length})`;
  parts.push(`${missedHead}\n${THIN}`);

  opts.missed.forEach((a, i) => {
    const q = a.question;
    const yourAnswer = q.options[a.selectedIndex] ?? '—';
    const correct = q.options[q.correctAnswerIndex];
    const block = [
      `${i + 1}. [${q.topic} · ${q.difficulty}]`,
      `   Q: ${q.question}`,
      `   ${fr ? 'Votre réponse' : 'Your answer'}: ${yourAnswer}`,
      `   ${fr ? 'Bonne réponse' : 'Correct answer'}: ${correct}`,
      `   ${fr ? 'Pourquoi' : 'Why'}: ${q.explanation}`,
    ];
    if (q.source) block.push(`   ${fr ? 'Source' : 'Source'}: ${q.source}`);
    parts.push(block.join('\n'));
  });

  const gapTopics = new Set(opts.missed.map((a) => a.question.topic));
  const gapTerms = opts.terms.filter((t) => gapTopics.has(t.category));
  if (gapTerms.length > 0) {
    const glossHead = fr
      ? `GLOSSAIRE POUR VOS LACUNES (${gapTerms.length} termes)`
      : `GLOSSARY FOR YOUR GAPS (${gapTerms.length} terms)`;
    parts.push(`\n${glossHead}\n${THIN}`);
    parts.push(gapTerms.map((t) => formatTerm(t, lang)).join('\n\n'));
  }

  parts.push(
    `\n${THIN}\n${
      fr
        ? 'Astuce : collez ce fichier dans votre assistant IA préféré et demandez un tutorat.'
        : 'Tip: paste this file into your favorite AI assistant and ask to be tutored on it.'
    }\n`,
  );
  return parts.join('\n\n');
}
