import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const banksDir = join(root, 'data', 'banks');
const cuePattern = /\b(always|never|only|completely|entirely|exclusively|guarantees?|identical|impossible|zero|all)\b/i;

const filenames = (await readdir(banksDir))
  .filter((name) => name.endsWith('.json') && !name.endsWith('.fr.json'))
  .sort();

const questions = [];
for (const filename of filenames) {
  const bank = JSON.parse(await readFile(join(banksDir, filename), 'utf8'));
  for (const question of bank.questions) questions.push({ ...question, bank: bank.id });
}

let sourced = 0;
let correctUniquelyLongest = 0;
let correctLongestTies = 0;
let absolutistDistractorWithoutCorrectCue = 0;
const correctIndexDistribution = [0, 0, 0, 0];
const lengthCueCandidates = [];
const normalizedQuestions = new Map();
const duplicateQuestions = [];

for (const question of questions) {
  if (question.source) sourced += 1;
  correctIndexDistribution[question.correctAnswerIndex] += 1;

  const lengths = question.options.map((option) => option.length);
  const correctLength = lengths[question.correctAnswerIndex];
  const longest = Math.max(...lengths);
  if (correctLength === longest) {
    if (lengths.filter((length) => length === longest).length === 1) correctUniquelyLongest += 1;
    else correctLongestTies += 1;
  }

  const distractorMean = lengths
    .filter((_, index) => index !== question.correctAnswerIndex)
    .reduce((total, length) => total + length, 0) / (lengths.length - 1);
  const ratio = correctLength / distractorMean;
  if (ratio >= 1.5) {
    lengthCueCandidates.push({
      id: question.id,
      bank: question.bank,
      ratio: Number(ratio.toFixed(2)),
    });
  }

  const correctHasCue = cuePattern.test(question.options[question.correctAnswerIndex]);
  const distractorHasCue = question.options.some(
    (option, index) => index !== question.correctAnswerIndex && cuePattern.test(option),
  );
  if (distractorHasCue && !correctHasCue) absolutistDistractorWithoutCorrectCue += 1;

  const normalized = question.question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const previous = normalizedQuestions.get(normalized);
  if (previous) duplicateQuestions.push([previous, question.id]);
  else normalizedQuestions.set(normalized, question.id);
}

const result = {
  questions: questions.length,
  sourcedQuestions: sourced,
  correctIndexDistribution,
  correctUniquelyLongest,
  correctLongestTies,
  correctUniquelyLongestPercent: Number(((correctUniquelyLongest / questions.length) * 100).toFixed(1)),
  questionsWithAbsolutistDistractorButNoCorrectAnswerCue: absolutistDistractorWithoutCorrectCue,
  exactNormalizedDuplicateQuestions: duplicateQuestions,
  lengthCueCandidates: lengthCueCandidates.sort((a, b) => b.ratio - a.ratio),
};

console.log(JSON.stringify(result, null, 2));

