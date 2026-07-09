/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { describe, expect, it } from 'vitest';
import { personalGuide, topicSheet } from '../src/lib/fieldguide';
import type { Answer, Question, TerminologyEntry } from '../src/lib/types';

const terms: TerminologyEntry[] = [
  { term: 'Token', category: 'AI Foundations', definition: 'A chunk of text.', example: 'un/believ/able' },
  { term: 'RAG', category: 'RAG & Retrieval', definition: 'Retrieval-augmented generation.' },
];

function missedAnswer(): Answer {
  const question: Question = {
    id: 'fnd-01',
    question: 'What is a token?',
    options: ['A coin', 'A chunk of text', 'A pixel'],
    correctAnswerIndex: 1,
    difficulty: 'beginner',
    explanation: 'Tokens are the basic units models read.',
    source: 'https://example.org/tokens',
    bankId: 'foundations',
    topic: 'AI Foundations',
    role: 'technical',
    points: 5,
  };
  return { questionId: 'fnd-01', selectedIndex: 0, isCorrect: false, points: 0, question };
}

describe('topicSheet', () => {
  it('renders header, description, terms and examples as plain text', () => {
    const text = topicSheet('en', 'AI Foundations', 'Core terminology.', terms);
    expect(text).toContain('AI FLUENCY — CHEAT SHEET');
    expect(text).toContain('AI Foundations');
    expect(text).toContain('* Token');
    expect(text).toContain('e.g. un/believ/able');
    expect(text).toContain('2 terms');
  });

  it('localizes the French sheet', () => {
    const text = topicSheet('fr', 'Fondations IA', 'Terminologie.', terms);
    expect(text).toContain('FICHE DE RÉVISION');
    expect(text).toContain('2 termes');
  });
});

describe('personalGuide', () => {
  const base = {
    percent: 80,
    score: 40,
    maxScore: 50,
    tier: { minPercent: 65, status: 'Context Engineer', description: '' },
    date: new Date('2026-07-09T12:00:00Z'),
  };

  it('includes score line, missed questions, and only glossary terms for gap topics', () => {
    const text = personalGuide('en', { ...base, missed: [missedAnswer()], terms });
    expect(text).toContain('80%');
    expect(text).toContain('Context Engineer');
    expect(text).toContain('What is a token?');
    expect(text).toContain('Your answer: A coin');
    expect(text).toContain('Correct answer: A chunk of text');
    expect(text).toContain('Source: https://example.org/tokens');
    // Gap glossary: Token (AI Foundations) yes, RAG (different topic) no.
    expect(text).toContain('* Token');
    expect(text).not.toContain('* RAG');
  });

  it('congratulates a perfect run instead of listing sections', () => {
    const text = personalGuide('en', { ...base, percent: 100, score: 50, missed: [], terms });
    expect(text).toContain('A perfect run');
    expect(text).not.toContain('WHAT YOU MISSED');
  });
});
