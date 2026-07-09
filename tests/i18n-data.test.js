/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
// French data parity. The French database is allowed to be a SUBSET of the
// English one (new banks land in English first, translations follow via the
// tools/ factory) — but every bank the French manifest lists must exist as a
// .fr.json sibling that matches the English bank structurally.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { ROOT } from './helpers/paths.js';

function readJson(relative) {
  return JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));
}

const manifestEn = readJson('data/manifest.json');
const manifestFr = readJson('data/manifest.fr.json');
const enBankById = new Map(manifestEn.banks.map((b) => [b.id, b]));

describe('manifest.fr.json', () => {
  it('defines the same difficulty keys and points as the English manifest', () => {
    expect(manifestFr.difficultyPoints).toEqual(manifestEn.difficultyPoints);
  });

  it('has scoring tiers with the same thresholds as the English manifest', () => {
    expect(manifestFr.scoringTiers.map((t) => t.minPercent)).toEqual(
      manifestEn.scoringTiers.map((t) => t.minPercent)
    );
    expect(manifestFr.managerialScoringTiers.map((t) => t.minPercent)).toEqual(
      manifestEn.managerialScoringTiers.map((t) => t.minPercent)
    );
  });

  it('lists a subset of the English banks, with matching id/file/role', () => {
    expect(manifestFr.banks.length).toBeGreaterThan(0);
    for (const frBank of manifestFr.banks) {
      const enBank = enBankById.get(frBank.id);
      expect(enBank, `FR manifest bank '${frBank.id}' missing from English manifest`).toBeTruthy();
      expect(frBank.file).toBe(enBank.file);
      expect(frBank.role ?? 'technical').toBe(enBank.role ?? 'technical');
    }
  });
});

describe('bank .fr.json siblings', () => {
  manifestFr.banks.forEach((entry) => {
    const frFile = entry.file.replace(/\.json$/, '.fr.json');

    it(`${frFile}: exists and matches the English bank's ids/difficulty/correctAnswerIndex/options length`, () => {
      expect(existsSync(join(ROOT, 'data', frFile)), `${frFile} missing on disk`).toBe(true);
      const bankEn = readJson(join('data', entry.file));
      const bankFr = readJson(join('data', frFile));

      expect(bankFr.id).toBe(bankEn.id);
      expect(bankFr.questions).toHaveLength(bankEn.questions.length);

      bankEn.questions.forEach((qEn, i) => {
        const qFr = bankFr.questions[i];
        expect(qFr.id, `${frFile} question[${i}] id mismatch`).toBe(qEn.id);
        expect(qFr.difficulty, `${frFile} question[${i}] difficulty mismatch`).toBe(qEn.difficulty);
        expect(qFr.correctAnswerIndex, `${frFile} question[${i}] correctAnswerIndex mismatch`).toBe(
          qEn.correctAnswerIndex
        );
        expect(qFr.options, `${frFile} question[${i}] options length mismatch`).toHaveLength(
          qEn.options.length
        );
        expect(qFr.source, `${frFile} question[${i}] source mismatch`).toBe(qEn.source);
        expect(typeof qFr.question).toBe('string');
        expect(typeof qFr.explanation).toBe('string');
      });
    });
  });
});

describe('terminology.fr.json', () => {
  it('mirrors the English glossary term-for-term, with categories mapped to FR manifest topics', () => {
    const en = readJson('data/terminology.json');
    const fr = readJson('data/terminology.fr.json');
    expect(fr.terms).toHaveLength(en.terms.length);

    // Every FR category must be a topic in the FR manifest, so the Field Guide
    // can slug FR categories by bank id exactly like the English build does.
    const frTopics = new Set(manifestFr.banks.map((b) => b.topic));
    for (const t of fr.terms) {
      expect(frTopics.has(t.category), `FR term '${t.term}' category '${t.category}' not in FR manifest topics`).toBe(true);
    }
  });
});

describe('frontier.fr.json', () => {
  it('has the same entries (by id, in the same order) as the English frontier list', () => {
    const en = readJson('data/frontier.json');
    const fr = readJson('data/frontier.fr.json');
    expect(fr.entries.map((e) => e.id)).toEqual(en.entries.map((e) => e.id));
    expect(fr.entries.map((e) => e.source)).toEqual(en.entries.map((e) => e.source));
  });
});
