/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { ROOT } from './helpers/paths.js';

let tempDir;

function makeFixture() {
  tempDir = mkdtempSync(join(tmpdir(), 'validate-data-'));
  cpSync(join(ROOT, 'scripts'), join(tempDir, 'scripts'), { recursive: true });
  cpSync(join(ROOT, 'data'), join(tempDir, 'data'), { recursive: true });
  return tempDir;
}

function readBank(dir, file) {
  return JSON.parse(readFileSync(join(dir, 'data', file), 'utf8'));
}

function writeBank(dir, file, bank) {
  writeFileSync(join(dir, 'data', file), JSON.stringify(bank, null, 2));
}

function readManifest(dir) {
  return JSON.parse(readFileSync(join(dir, 'data', 'manifest.json'), 'utf8'));
}

function writeManifest(dir, manifest) {
  writeFileSync(join(dir, 'data', 'manifest.json'), JSON.stringify(manifest, null, 2));
}

function runValidator(dir) {
  return spawnSync(process.execPath, [join(dir, 'scripts', 'validate-data.mjs')], {
    encoding: 'utf8',
  });
}

afterEach(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

describe('scripts/validate-data.mjs', () => {
  it('exits 0 against the real, unmodified database', () => {
    const dir = makeFixture();
    const result = runValidator(dir);
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/OK: \d+ banks, \d+ questions, all valid\./);
  });

  it('fails when a question has an out-of-bounds correctAnswerIndex', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].correctAnswerIndex = 99;
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/correctAnswerIndex out of range/);
  });

  it('fails on duplicate question ids across banks', () => {
    const dir = makeFixture();
    const foundations = readBank(dir, 'banks/foundations.json');
    const promptBank = readBank(dir, 'banks/prompting.json');
    promptBank.questions[0].id = foundations.questions[0].id;
    writeBank(dir, 'banks/prompting.json', promptBank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/duplicate question id/);
  });

  it('fails on unknown difficulty key', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].difficulty = 'legendary';
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/unknown difficulty 'legendary'/);
  });

  it('fails when options has fewer than 3 entries', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].options = ['A', 'B'];
    bank.questions[0].correctAnswerIndex = 0;
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/needs at least 3 options/);
  });

  it('fails on duplicate options within a question', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].options = ['Same', 'Same', 'Different'];
    bank.questions[0].correctAnswerIndex = 0;
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/duplicate options/);
  });

  it('fails when explanation is missing or too short', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].explanation = 'short';
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/explanation missing or too short/);
  });

  it('fails when source is not an https URL', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].source = 'http://insecure.example.com/paper';
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/source must be a valid https URL/);
  });

  it('fails when source has an https prefix but is not a complete URL', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].source = 'https://';
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/source must be a valid https URL/);
  });

  it('fails when a question has an invalid points override', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].points = 0;
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/points override must be a positive integer/);
  });

  it('fails when an option is not a non-empty string', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].options[0] = '';
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/every option must be a non-empty string/);
  });

  it('fails when a bank file has an empty questions array', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions = [];
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/questions missing or empty/);
  });

  it('fails when a bank id does not match its manifest entry', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.id = 'wrong-id';
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/bank id 'wrong-id' does not match manifest id/);
  });

  it('fails on a manifest bank file path outside banks/ (path traversal)', () => {
    const dir = makeFixture();
    const manifest = readManifest(dir);
    manifest.banks[0].file = '../../../etc/passwd';
    writeManifest(dir, manifest);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/file must match banks\/<kebab-case-name>\.json/);
  });

  it('fails when scoringTiers are not strictly increasing', () => {
    const dir = makeFixture();
    const manifest = readManifest(dir);
    manifest.scoringTiers[1].minPercent = manifest.scoringTiers[0].minPercent;
    writeManifest(dir, manifest);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/minPercent must be strictly increasing/);
  });

  it('fails when the first scoring tier does not start at 0', () => {
    const dir = makeFixture();
    const manifest = readManifest(dir);
    manifest.scoringTiers[0].minPercent = 5;
    writeManifest(dir, manifest);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/first scoring tier must start at minPercent 0/);
  });

  it('validates the managerial scoring tiers independently', () => {
    const dir = makeFixture();
    const manifest = readManifest(dir);
    manifest.managerialScoringTiers[0].minPercent = 5;
    writeManifest(dir, manifest);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/first managerial scoring tier must start at minPercent 0/);
  });

  it('fails when a manifest bank role is invalid', () => {
    const dir = makeFixture();
    const manifest = readManifest(dir);
    manifest.banks[0].role = 'executive';
    writeManifest(dir, manifest);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/role must be 'technical' or 'managerial'/);
  });

  it('fails when difficultyPoints contains a non-positive value', () => {
    const dir = makeFixture();
    const manifest = readManifest(dir);
    manifest.difficultyPoints.beginner = 0;
    writeManifest(dir, manifest);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/difficultyPoints\.beginner must be a positive integer/);
  });

  it('fails when a manifest bank entry is missing required fields', () => {
    const dir = makeFixture();
    const manifest = readManifest(dir);
    delete manifest.banks[0].description;
    writeManifest(dir, manifest);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/requires id, file, topic, description/);
  });

  it('exits non-zero (not throws) when manifest.json is malformed', () => {
    const dir = makeFixture();
    writeFileSync(join(dir, 'data', 'manifest.json'), '{ not valid json');

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/cannot read\/parse data\/manifest\.json/);
  });

  it('reports all accumulated errors, not just the first', () => {
    const dir = makeFixture();
    const bank = readBank(dir, 'banks/foundations.json');
    bank.questions[0].correctAnswerIndex = 99;
    bank.questions[1].explanation = 'short';
    writeBank(dir, 'banks/foundations.json', bank);

    const result = runValidator(dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/correctAnswerIndex out of range/);
    expect(result.stderr).toMatch(/explanation missing or too short/);
    expect(result.stderr).toMatch(/FAIL: 2 problem\(s\) found/);
  });
});
