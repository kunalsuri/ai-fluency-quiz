/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { ROOT } from './helpers/paths.js';

function readJson(relative) {
  return JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));
}

const manifest = readJson('data/manifest.json');
const banks = manifest.banks.map((entry) => ({ entry, bank: readJson(join('data', entry.file)) }));
const allQuestions = banks.flatMap(({ bank }) => bank.questions.map((q) => ({ ...q, bankId: bank.id })));

describe('manifest.json', () => {
  it('has required metadata', () => {
    expect(manifest.metadata?.title).toBeTruthy();
    expect(manifest.metadata?.version).toBeTruthy();
  });

  it('defines at least one difficulty with positive integer points', () => {
    const difficulties = Object.entries(manifest.difficultyPoints ?? {});
    expect(difficulties.length).toBeGreaterThan(0);
    for (const [name, pts] of difficulties) {
      expect(Number.isInteger(pts), `${name} points must be an integer`).toBe(true);
      expect(pts, `${name} points must be positive`).toBeGreaterThan(0);
    }
  });

  it('has at least 2 scoring tiers, strictly increasing, starting at 0', () => {
    const tiers = manifest.scoringTiers ?? [];
    expect(tiers.length).toBeGreaterThanOrEqual(2);
    expect(tiers[0].minPercent).toBe(0);
    tiers.forEach((tier, i) => {
      expect(tier.minPercent).toBeGreaterThanOrEqual(0);
      expect(tier.minPercent).toBeLessThanOrEqual(100);
      expect(tier.status, `tier[${i}] missing status`).toBeTruthy();
      expect(tier.description, `tier[${i}] missing description`).toBeTruthy();
      if (i > 0) {
        expect(tier.minPercent, `tier[${i}].minPercent must exceed tier[${i - 1}]`).toBeGreaterThan(
          tiers[i - 1].minPercent
        );
      }
    });
  });

  it('lists at least one bank, each with unique id and a valid file path', () => {
    expect(Array.isArray(manifest.banks)).toBe(true);
    expect(manifest.banks.length).toBeGreaterThan(0);
    const ids = new Set();
    for (const entry of manifest.banks) {
      expect(entry.id, 'bank entry missing id').toBeTruthy();
      expect(entry.file, 'bank entry missing file').toBeTruthy();
      expect(entry.topic, 'bank entry missing topic').toBeTruthy();
      expect(entry.description, 'bank entry missing description').toBeTruthy();
      expect(ids.has(entry.id), `duplicate bank id '${entry.id}'`).toBe(false);
      ids.add(entry.id);
      expect(entry.file, `bank file must live under banks/ ('${entry.file}')`).toMatch(
        /^banks\/[a-z0-9-]+\.json$/
      );
    }
  });
});

describe('bank files', () => {
  it.each(banks.map(({ entry, bank }) => [entry.file, entry, bank]))(
    '%s: bank id/topic matches manifest, non-empty questions',
    (_file, entry, bank) => {
      expect(bank.id).toBe(entry.id);
      expect(bank.topic).toBe(entry.topic);
      expect(Array.isArray(bank.questions)).toBe(true);
      expect(bank.questions.length).toBeGreaterThan(0);
    }
  );
});

describe('questions (flattened across all banks)', () => {
  const difficulties = new Set(Object.keys(manifest.difficultyPoints ?? {}));

  it('all question ids are globally unique', () => {
    const seen = new Map();
    const dupes = [];
    for (const q of allQuestions) {
      if (seen.has(q.id)) dupes.push(q.id);
      seen.set(q.id, (seen.get(q.id) ?? 0) + 1);
    }
    expect(dupes, `duplicate question ids: ${dupes.join(', ')}`).toEqual([]);
  });

  it.each(allQuestions.map((q) => [`${q.bankId}/${q.id}`, q]))('%s is well-formed', (_label, q) => {
    expect(q.id, 'missing id').toBeTruthy();
    expect(difficulties.has(q.difficulty), `unknown difficulty '${q.difficulty}'`).toBe(true);
    expect(typeof q.question).toBe('string');
    expect(q.question.trim().length, 'question text too short').toBeGreaterThanOrEqual(10);

    expect(Array.isArray(q.options)).toBe(true);
    expect(q.options.length, 'needs at least 3 options').toBeGreaterThanOrEqual(3);
    expect(new Set(q.options).size, 'duplicate options').toBe(q.options.length);

    expect(Number.isInteger(q.correctAnswerIndex)).toBe(true);
    expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctAnswerIndex).toBeLessThan(q.options.length);

    expect(typeof q.explanation).toBe('string');
    expect(q.explanation.trim().length, 'explanation missing or too short').toBeGreaterThanOrEqual(20);

    if (q.source !== undefined) {
      expect(q.source, 'source must be an https URL').toMatch(/^https:\/\//);
    }
  });

  it('every question resolves to a positive point value via manifest.difficultyPoints or its own override', () => {
    for (const q of allQuestions) {
      const points = q.points ?? manifest.difficultyPoints[q.difficulty];
      expect(Number.isInteger(points), `${q.bankId}/${q.id} has no resolvable points`).toBe(true);
      expect(points).toBeGreaterThan(0);
    }
  });
});
