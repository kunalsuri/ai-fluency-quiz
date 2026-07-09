// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.

export type Lang = 'en' | 'fr';
export type Role = 'technical' | 'managerial';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface QuestionRaw {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: Difficulty;
  explanation: string;
  source?: string;
  points?: number;
}

export interface Question extends QuestionRaw {
  bankId: string;
  topic: string;
  role: Role;
  points: number;
}

export interface ManifestBank {
  id: string;
  file: string;
  topic: string;
  description: string;
  role?: Role;
}

export interface ScoringTier {
  minPercent: number;
  status: string;
  description: string;
}

export interface Manifest {
  metadata?: { title?: string; version?: string };
  banks: ManifestBank[];
  difficultyPoints: Record<Difficulty, number>;
  scoringTiers: ScoringTier[];
  managerialScoringTiers: ScoringTier[];
}

export interface Answer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  points: number;
  question: Question;
}

export interface TopicBreakdownRow {
  topic: string;
  correct: number;
  total: number;
  percent: number;
}

export interface FrontierEntry {
  id?: string;
  title: string;
  topic?: string;
  authors?: string;
  date?: string;
  why: string;
  source?: string;
}

export interface TerminologyEntry {
  term: string;
  category: string;
  definition: string;
  example?: string;
}

/** Everything the quiz island needs, embedded in the page at build time. */
export interface QuizPayload {
  lang: Lang;
  difficultyPoints: Record<Difficulty, number>;
  tiers: Record<Role, ScoringTier[]>;
  banks: { id: string; topic: string; role: Role }[];
  questions: Question[];
  terms: TerminologyEntry[];
  strings: Record<string, string>;
}
