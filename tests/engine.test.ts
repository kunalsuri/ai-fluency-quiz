/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { describe, expect, it } from 'vitest';
import {
  buildPool,
  computeTopicBreakdown,
  getTier,
  isSafeHttpUrl,
  sessionSize,
  shuffle,
} from '../src/lib/engine';
import type { Answer, Question, ScoringTier } from '../src/lib/types';

function q(overrides: Partial<Question>): Question {
  return {
    id: 'q1',
    question: 'Q?',
    options: ['a', 'b', 'c', 'd'],
    correctAnswerIndex: 0,
    difficulty: 'beginner',
    explanation: 'Because.',
    bankId: 'foundations',
    topic: 'AI Foundations',
    role: 'technical',
    points: 5,
    ...overrides,
  };
}

const pool: Question[] = [
  q({ id: 'a', bankId: 'foundations', difficulty: 'beginner' }),
  q({ id: 'b', bankId: 'prompting', topic: 'Prompting', difficulty: 'expert', points: 20 }),
  q({ id: 'c', bankId: 'ai-business-value', topic: 'ROI', role: 'managerial', difficulty: 'intermediate', points: 10 }),
];

describe('buildPool', () => {
  it('filters by role', () => {
    expect(buildPool(pool, 'managerial', new Set(), 'all').map((x) => x.id)).toEqual(['c']);
  });

  it('treats an empty topic set as "all topics"', () => {
    expect(buildPool(pool, 'technical', new Set(), 'all')).toHaveLength(2);
  });

  it('filters by topic and difficulty together', () => {
    expect(buildPool(pool, 'technical', new Set(['prompting']), 'expert').map((x) => x.id)).toEqual(['b']);
    expect(buildPool(pool, 'technical', new Set(['prompting']), 'beginner')).toHaveLength(0);
  });
});

describe('sessionSize', () => {
  it('caps at the preset count', () => {
    expect(sessionSize(100, 'quick')).toBe(10);
    expect(sessionSize(100, 'standard')).toBe(20);
  });

  it('never exceeds the pool', () => {
    expect(sessionSize(7, 'standard')).toBe(7);
    expect(sessionSize(7, 'full')).toBe(7);
  });
});

describe('shuffle', () => {
  it('returns a new array with the same members', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).not.toBe(input);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('getTier', () => {
  const tiers: ScoringTier[] = [
    { minPercent: 0, status: 'Novice', description: '' },
    { minPercent: 35, status: 'Middle', description: '' },
    { minPercent: 85, status: 'Architect', description: '' },
  ];

  it('picks the highest tier whose threshold is met', () => {
    expect(getTier(tiers, 0).status).toBe('Novice');
    expect(getTier(tiers, 34).status).toBe('Novice');
    expect(getTier(tiers, 35).status).toBe('Middle');
    expect(getTier(tiers, 100).status).toBe('Architect');
  });
});

describe('computeTopicBreakdown', () => {
  it('aggregates per topic, sorted weakest first', () => {
    const answers: Answer[] = [
      { questionId: 'a', selectedIndex: 0, isCorrect: true, points: 5, question: q({ id: 'a' }) },
      { questionId: 'b', selectedIndex: 1, isCorrect: false, points: 0, question: q({ id: 'b', topic: 'Prompting' }) },
      { questionId: 'c', selectedIndex: 1, isCorrect: false, points: 0, question: q({ id: 'c', topic: 'Prompting' }) },
    ];
    const rows = computeTopicBreakdown(answers);
    expect(rows[0]).toMatchObject({ topic: 'Prompting', percent: 0, total: 2 });
    expect(rows[1]).toMatchObject({ topic: 'AI Foundations', percent: 100, total: 1 });
  });
});

describe('isSafeHttpUrl', () => {
  it('accepts only https URLs', () => {
    expect(isSafeHttpUrl('https://arxiv.org/abs/1706.03762')).toBe(true);
    expect(isSafeHttpUrl('http://example.com')).toBe(false);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl(undefined)).toBe(false);
  });
});
