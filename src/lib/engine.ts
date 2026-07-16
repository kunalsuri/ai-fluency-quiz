// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
// Pure quiz logic — no DOM, no storage. Runs at build time and in the quiz island.
import type { Answer, Difficulty, Question, Role, ScoringTier, TopicBreakdownRow } from './types';

export const LENGTH_PRESETS = [
  { id: 'quick', count: 10 },
  { id: 'standard', count: 20 },
  { id: 'full', count: Infinity },
] as const;

export type LengthPresetId = (typeof LENGTH_PRESETS)[number]['id'];

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(array: T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildPool(
  allQuestions: Question[],
  activeRole: Role,
  selectedTopics: Set<string>,
  selectedDifficulty: Difficulty | 'all',
): Question[] {
  return allQuestions.filter(
    (q) =>
      q.role === activeRole &&
      (selectedTopics.size === 0 || selectedTopics.has(q.bankId)) &&
      (selectedDifficulty === 'all' || q.difficulty === selectedDifficulty),
  );
}

export function sessionSize(poolLength: number, selectedLength: LengthPresetId): number {
  const preset = LENGTH_PRESETS.find((p) => p.id === selectedLength) ?? LENGTH_PRESETS[1];
  return Math.min(poolLength, preset.count);
}

export function computeTopicBreakdown(answers: Answer[]): TopicBreakdownRow[] {
  const map = new Map<string, { correct: number; total: number }>();
  answers.forEach((a) => {
    const topic = a.question.topic;
    if (!map.has(topic)) map.set(topic, { correct: 0, total: 0 });
    const rec = map.get(topic)!;
    rec.total++;
    if (a.isCorrect) rec.correct++;
  });
  return [...map.entries()]
    .map(([topic, rec]) => ({
      topic,
      correct: rec.correct,
      total: rec.total,
      percent: Math.round((rec.correct / rec.total) * 100),
    }))
    .sort((a, b) => a.percent - b.percent || a.topic.localeCompare(b.topic));
}

export function getTier(tiers: ScoringTier[], percentScore: number): ScoringTier {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (percentScore >= tiers[i].minPercent) return tiers[i];
  }
  return tiers[0];
}

export function isSafeHttpUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}
