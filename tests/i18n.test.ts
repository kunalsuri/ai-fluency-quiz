/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { describe, expect, it } from 'vitest';
import { tr, alternatePath, localePrefix, STRINGS } from '../src/lib/i18n';

describe('i18n translation engine', () => {
  it('translates basic keys correctly', () => {
    expect(tr('en', 'siteName')).toBe('AI Fluency');
    expect(tr('fr', 'siteName')).toBe('AI Fluency');
    expect(tr('en', 'navAssessment')).toBe('Assessment');
    expect(tr('fr', 'navAssessment')).toBe('Évaluation');
  });

  it('interpolates single and multiple placeholders', () => {
    expect(tr('en', 'roleStat', { topics: 5, questions: 42 })).toBe('5 topics · 42 questions');
    expect(tr('fr', 'roleStat', { topics: 5, questions: 42 })).toBe('5 sujets · 42 questions');

    expect(tr('en', 'quizQuestionOf', { n: 3, total: 10 })).toBe('Question 3 of 10');
    expect(tr('fr', 'quizQuestionOf', { n: 3, total: 10 })).toBe('Question 3 sur 10');
  });

  it('handles alternatePath for language toggling', () => {
    // English path toggling to French
    expect(alternatePath('en', '/')).toBe('/fr/');
    expect(alternatePath('en', '/quiz')).toBe('/fr/quiz');
    expect(alternatePath('en', '/guide/prompting')).toBe('/fr/guide/prompting');

    // French path toggling to English
    expect(alternatePath('fr', '/fr/')).toBe('/');
    expect(alternatePath('fr', '/fr/quiz')).toBe('/quiz');
    expect(alternatePath('fr', '/fr/guide/prompting')).toBe('/guide/prompting');
  });

  it('returns appropriate locale prefix', () => {
    expect(localePrefix('en')).toBe('');
    expect(localePrefix('fr')).toBe('/fr');
  });

  it('ensures keys parity between English and French translation bundles', () => {
    const enKeys = Object.keys(STRINGS.en);
    const frKeys = Object.keys(STRINGS.fr);
    expect(frKeys.sort()).toEqual(enKeys.sort());
  });
});
