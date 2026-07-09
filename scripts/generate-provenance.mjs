#!/usr/bin/env node
/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
/**
 * Script to pre-populate data/data-provenance.md with all questions from JSON banks.
 * All questions will be initialized to an unverified [ ] status.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function escapeMarkdownCell(text) {
  if (!text) return 'N/A';
  return text
    .replace(/\|/g, '\\|')        // Escape markdown pipe
    .replace(/\r?\n/g, '<br>')    // Replace newlines with HTML linebreaks
    .trim();
}

async function run() {
  try {
    const manifestPath = join(root, 'data', 'manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    
    const questions = [];
    for (const bank of manifest.banks) {
      const bankPath = join(root, 'data', bank.file);
      const bankData = JSON.parse(await readFile(bankPath, 'utf8'));
      
      for (const q of bankData.questions) {
        questions.push({
          id: q.id,
          topic: bank.topic,
          difficulty: q.difficulty,
          question: q.question,
          explanation: q.explanation,
          source: q.source || 'N/A'
        });
      }
    }

    // Sort by ID to maintain a stable, neat ordering
    questions.sort((a, b) => a.id.localeCompare(b.id));

    let md = `# Data Provenance & Verification\n\n`;
    md += `This file tracks the verification status of all questions in the AI Fluency Quiz database.\n`;
    md += `An administrator/expert can audit and verify questions using the \`audit.html\` tool at the root of the project.\n\n`;
    md += `Total Questions: ${questions.length}\n`;
    md += `Verified Questions: 0 (0.0%)\n\n`;
    md += `## Verification Table\n\n`;
    md += `| Verified | Question ID | Topic | Difficulty | Question | Explanation | Source |\n`;
    md += `| :---: | :---: | :--- | :---: | :--- | :--- | :--- |\n`;

    for (const q of questions) {
      const cleanQuestion = escapeMarkdownCell(q.question);
      const cleanExplanation = escapeMarkdownCell(q.explanation);
      md += `| [ ] | ${q.id} | ${q.topic} | ${q.difficulty} | ${cleanQuestion} | ${cleanExplanation} | ${q.source} |\n`;
    }

    const outputPath = join(root, 'data', 'data-provenance.md');
    await writeFile(outputPath, md, 'utf8');
    console.log(`Successfully generated data-provenance.md with ${questions.length} questions in unverified state.`);
  } catch (err) {
    console.error("Error generating data-provenance.md:", err);
    process.exit(1);
  }
}

run();
