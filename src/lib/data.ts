// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
// Build-time data access. Runs only inside Astro's build (Node) — never in the browser.
// data/ at the repo root stays the single source of truth shared with the audit
// workbench (tools/) and the validation scripts (scripts/).
import { STRINGS } from './i18n';
import type {
  FrontierEntry, Lang, Manifest, Question, QuestionRaw, QuizPayload, Role, TerminologyEntry,
} from './types';

interface BankFile {
  id: string;
  questions: QuestionRaw[];
}

interface TerminologyFile {
  terms: TerminologyEntry[];
}

interface FrontierFile {
  entries: FrontierEntry[];
}

const manifests = import.meta.glob<{ default: Manifest }>('../../data/manifest*.json', { eager: true });
const bankFiles = import.meta.glob<{ default: BankFile }>('../../data/banks/*.json', { eager: true });
const terminologyFiles = import.meta.glob<{ default: TerminologyFile }>('../../data/terminology*.json', { eager: true });
const frontierFiles = import.meta.glob<{ default: FrontierFile }>('../../data/frontier*.json', { eager: true });

function pick<T>(modules: Record<string, { default: T }>, name: string): T {
  const key = Object.keys(modules).find((k) => k.endsWith(`/${name}`));
  if (!key) throw new Error(`Data file not found at build time: ${name}`);
  return modules[key].default;
}

export function getManifest(lang: Lang): Manifest {
  return pick(manifests, lang === 'fr' ? 'manifest.fr.json' : 'manifest.json');
}

export function getTerminology(lang: Lang): TerminologyEntry[] {
  return pick(terminologyFiles, lang === 'fr' ? 'terminology.fr.json' : 'terminology.json').terms;
}

export function getFrontier(lang: Lang): FrontierEntry[] {
  return pick(frontierFiles, lang === 'fr' ? 'frontier.fr.json' : 'frontier.json').entries;
}

/** All questions for a language, flattened and enriched with bank metadata. */
export function getAllQuestions(lang: Lang): Question[] {
  const manifest = getManifest(lang);
  return manifest.banks.flatMap((entry) => {
    const file = lang === 'fr' ? entry.file.replace(/\.json$/, '.fr.json') : entry.file;
    const bank = pick(bankFiles, file.replace(/^banks\//, ''));
    return bank.questions.map((q) => ({
      ...q,
      bankId: entry.id,
      topic: entry.topic,
      role: entry.role ?? ('technical' as Role),
      points: q.points ?? manifest.difficultyPoints[q.difficulty],
    }));
  });
}

/** Guide topics: terminology grouped by category, slugged by matching bank id. */
export interface GuideTopic {
  slug: string;
  topic: string;
  description: string;
  terms: TerminologyEntry[];
}

export function getGuideTopics(lang: Lang): GuideTopic[] {
  const manifest = getManifest(lang);
  const terms = getTerminology(lang);
  const byTopic = new Map<string, TerminologyEntry[]>();
  for (const t of terms) {
    if (!byTopic.has(t.category)) byTopic.set(t.category, []);
    byTopic.get(t.category)!.push(t);
  }
  return manifest.banks
    .filter((b) => byTopic.has(b.topic))
    .map((b) => ({
      slug: b.id,
      topic: b.topic,
      description: b.description,
      terms: byTopic.get(b.topic)!.slice().sort((a, z) => a.term.localeCompare(z.term)),
    }));
}

/** The full bundle the quiz island needs, embedded as JSON in the quiz page. */
export function getQuizPayload(lang: Lang): QuizPayload {
  const manifest = getManifest(lang);
  return {
    lang,
    difficultyPoints: manifest.difficultyPoints,
    tiers: {
      technical: manifest.scoringTiers,
      managerial: manifest.managerialScoringTiers,
    },
    banks: manifest.banks.map((b) => ({ id: b.id, topic: b.topic, role: b.role ?? 'technical' })),
    questions: getAllQuestions(lang),
    terms: getTerminology(lang),
    strings: { ...STRINGS[lang] },
  };
}
