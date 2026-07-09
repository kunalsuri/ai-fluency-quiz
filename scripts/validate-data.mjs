#!/usr/bin/env node
/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
/**
 * Zero-dependency validator for the quiz question database.
 * Usage: node scripts/validate-data.mjs
 * Exits non-zero if any structural problem is found.
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (msg) => errors.push(msg);

let manifest;
try {
  manifest = JSON.parse(await readFile(join(root, 'data', 'manifest.json'), 'utf8'));
} catch (e) {
  console.error(`FAIL: cannot read/parse data/manifest.json (${e.message})`);
  process.exit(1);
}

// --- Manifest checks ---
if (!manifest.metadata?.title) fail('manifest: missing metadata.title');
if (!manifest.metadata?.version) fail('manifest: missing metadata.version');

const difficulties = Object.keys(manifest.difficultyPoints ?? {});
if (difficulties.length === 0) fail('manifest: difficultyPoints is missing or empty');
for (const [name, pts] of Object.entries(manifest.difficultyPoints ?? {})) {
  if (!Number.isInteger(pts) || pts <= 0) fail(`manifest: difficultyPoints.${name} must be a positive integer`);
}

const tiers = manifest.scoringTiers ?? [];
if (tiers.length < 2) fail('manifest: need at least 2 scoringTiers');
tiers.forEach((tier, i) => {
  if (typeof tier.minPercent !== 'number' || tier.minPercent < 0 || tier.minPercent > 100) {
    fail(`manifest: scoringTiers[${i}].minPercent out of range`);
  }
  if (!tier.status || !tier.description) fail(`manifest: scoringTiers[${i}] missing status/description`);
  if (i > 0 && tier.minPercent <= tiers[i - 1].minPercent) {
    fail(`manifest: scoringTiers[${i}].minPercent must be strictly increasing`);
  }
});
if (tiers[0]?.minPercent !== 0) fail('manifest: first scoring tier must start at minPercent 0');

// --- Bank checks ---
if (!Array.isArray(manifest.banks) || manifest.banks.length === 0) fail('manifest: banks missing or empty');

const seenQuestionIds = new Set();
const seenBankIds = new Set();
let totalQuestions = 0;

for (const entry of manifest.banks ?? []) {
  const label = `manifest bank '${entry.id}'`;
  if (!entry.id || !entry.file || !entry.topic || !entry.description) {
    fail(`${label}: requires id, file, topic, description`);
    continue;
  }
  if (seenBankIds.has(entry.id)) fail(`${label}: duplicate bank id`);
  seenBankIds.add(entry.id);

  // Constrain bank paths to data/banks/ — rejects absolute paths and traversal
  if (!/^banks\/[a-z0-9-]+\.json$/.test(entry.file)) {
    fail(`${label}: file must match banks/<kebab-case-name>.json (got '${entry.file}')`);
    continue;
  }

  let bank;
  try {
    bank = JSON.parse(await readFile(join(root, 'data', entry.file), 'utf8'));
  } catch (e) {
    fail(`${label}: cannot read/parse data/${entry.file} (${e.message})`);
    continue;
  }

  if (bank.id !== entry.id) fail(`${entry.file}: bank id '${bank.id}' does not match manifest id '${entry.id}'`);
  if (bank.topic !== entry.topic) fail(`${entry.file}: topic does not match manifest`);
  if (!Array.isArray(bank.questions) || bank.questions.length === 0) {
    fail(`${entry.file}: questions missing or empty`);
    continue;
  }

  bank.questions.forEach((q, i) => {
    const ql = `${entry.file} questions[${i}] (${q.id ?? 'no id'})`;
    if (!q.id) fail(`${ql}: missing id`);
    else if (seenQuestionIds.has(q.id)) fail(`${ql}: duplicate question id`);
    else seenQuestionIds.add(q.id);

    if (!difficulties.includes(q.difficulty)) fail(`${ql}: unknown difficulty '${q.difficulty}'`);
    if (typeof q.question !== 'string' || q.question.trim().length < 10) fail(`${ql}: question text too short`);
    if (!Array.isArray(q.options) || q.options.length < 3) fail(`${ql}: needs at least 3 options`);
    else {
      if (new Set(q.options).size !== q.options.length) fail(`${ql}: duplicate options`);
      if (!Number.isInteger(q.correctAnswerIndex) || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
        fail(`${ql}: correctAnswerIndex out of range`);
      }
    }
    if (typeof q.explanation !== 'string' || q.explanation.trim().length < 20) fail(`${ql}: explanation missing or too short`);
    if (q.source !== undefined && !/^https:\/\//.test(q.source)) fail(`${ql}: source must be an https URL`);
  });

  totalQuestions += bank.questions.length;
}

if (errors.length) {
  console.error(`FAIL: ${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

// Distribution summary
const counts = {};
for (const entry of manifest.banks) {
  const bank = JSON.parse(await readFile(join(root, 'data', entry.file), 'utf8'));
  for (const q of bank.questions) counts[q.difficulty] = (counts[q.difficulty] ?? 0) + 1;
}
console.log(`OK: ${manifest.banks.length} banks, ${totalQuestions} questions, all valid.`);
console.log(`Difficulty distribution: ${Object.entries(counts).map(([d, n]) => `${d}=${n}`).join(', ')}`);
