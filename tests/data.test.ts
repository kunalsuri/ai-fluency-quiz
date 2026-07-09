/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { describe, expect, it } from 'vitest';
import {
  getManifest,
  getTerminology,
  getFrontier,
  getAllQuestions,
  getGuideTopics,
  getQuizPayload,
} from '../src/lib/data';

describe('build-time data access module', () => {
  it('loads English and French manifests successfully', () => {
    const enManifest = getManifest('en');
    expect(enManifest).toBeDefined();
    expect(enManifest.metadata.title).toBe('AI Fluency Quiz');

    const frManifest = getManifest('fr');
    expect(frManifest).toBeDefined();
    expect(frManifest.metadata.title).toBe('Évaluation de la maturité en IA');
  });

  it('loads English and French terminology lists', () => {
    const enTerms = getTerminology('en');
    expect(enTerms.length).toBeGreaterThan(0);
    expect(enTerms[0].term).toBeTruthy();
    expect(enTerms[0].definition).toBeTruthy();

    const frTerms = getTerminology('fr');
    expect(frTerms.length).toBeGreaterThan(0);
  });

  it('loads English and French frontier entries', () => {
    const enFrontier = getFrontier('en');
    expect(enFrontier.length).toBeGreaterThan(0);
    expect(enFrontier[0].id).toBeTruthy();
    expect(enFrontier[0].title).toBeTruthy();

    const frFrontier = getFrontier('fr');
    expect(frFrontier.length).toBeGreaterThan(0);
  });

  it('retrieves all questions flattened and enriched', () => {
    const enQuestions = getAllQuestions('en');
    expect(enQuestions.length).toBeGreaterThan(0);

    const firstQ = enQuestions[0];
    expect(firstQ.id).toBeTruthy();
    expect(firstQ.bankId).toBeTruthy();
    expect(firstQ.topic).toBeTruthy();
    expect(firstQ.role).toMatch(/^(technical|managerial)$/);
    expect(firstQ.points).toBeGreaterThan(0);

    const frQuestions = getAllQuestions('fr');
    expect(frQuestions.length).toBeGreaterThan(0);
  });

  it('constructs guide topics grouped by category and sorted', () => {
    const enTopics = getGuideTopics('en');
    expect(enTopics.length).toBeGreaterThan(0);

    const firstTopic = enTopics[0];
    expect(firstTopic.slug).toBeTruthy();
    expect(firstTopic.topic).toBeTruthy();
    expect(firstTopic.description).toBeTruthy();
    expect(firstTopic.terms.length).toBeGreaterThan(0);

    // Verify alphabetized sorting within topics
    const terms = firstTopic.terms;
    for (let i = 1; i < terms.length; i++) {
      expect(terms[i].term.localeCompare(terms[i - 1].term)).toBeGreaterThanOrEqual(0);
    }
  });

  it('builds a complete quiz payload for client-side bundle embedding', () => {
    const payload = getQuizPayload('en');
    expect(payload.lang).toBe('en');
    expect(payload.difficultyPoints).toBeDefined();
    expect(payload.tiers.technical).toBeDefined();
    expect(payload.tiers.managerial).toBeDefined();
    expect(payload.banks.length).toBeGreaterThan(0);
    expect(payload.questions.length).toBeGreaterThan(0);
    expect(payload.terms.length).toBeGreaterThan(0);
    expect(payload.strings).toBeDefined();
  });
});
