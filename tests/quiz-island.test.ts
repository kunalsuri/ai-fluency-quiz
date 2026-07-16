/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mountQuiz } from '../src/scripts/quiz-island';
import type { QuizPayload } from '../src/lib/types';

describe('quiz-island UI component and state machine', () => {
  let mockPayload: QuizPayload;

  let listeners: { type: string; listener: any; options?: any }[] = [];
  const originalAddEventListener = document.addEventListener;
  const originalRemoveEventListener = document.removeEventListener;

  beforeEach(() => {
    // Mock Math.random to make shuffle a no-op
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    listeners = [];
    document.addEventListener = (type: string, listener: any, options?: any) => {
      listeners.push({ type, listener, options });
      originalAddEventListener.call(document, type, listener, options);
    };
    document.removeEventListener = (type: string, listener: any, options?: any) => {
      listeners = listeners.filter((l) => !(l.type === type && l.listener === listener));
      originalRemoveEventListener.call(document, type, listener, options);
    };

    // Reset DOM body
    document.body.innerHTML = `
      <script id="quiz-data" type="application/json"></script>
      <div id="quiz-root"></div>
    `;

    mockPayload = {
      lang: 'en',
      difficultyPoints: { beginner: 5, intermediate: 10, advanced: 15, expert: 20 },
      tiers: {
        technical: [
          { minPercent: 0, status: 'Novice', description: 'Novice level' },
          { minPercent: 60, status: 'Advanced', description: 'Advanced level' },
        ],
        managerial: [
          { minPercent: 0, status: 'Novice Manager', description: 'Novice level' },
        ],
      },
      banks: [
        { id: 'foundations', topic: 'AI Foundations', role: 'technical' },
        { id: 'prompting', topic: 'Prompting', role: 'technical' },
      ],
      questions: [
        {
          id: 'q1',
          question: 'What is 1+1?',
          options: ['1', '2', '3'],
          correctAnswerIndex: 1,
          difficulty: 'beginner',
          explanation: 'It is 2.',
          bankId: 'foundations',
          topic: 'AI Foundations',
          role: 'technical',
          points: 5,
        },
        {
          id: 'q2',
          question: 'What is 2+2?',
          options: ['2', '3', '4'],
          correctAnswerIndex: 2,
          difficulty: 'beginner',
          explanation: 'It is 4.',
          bankId: 'prompting',
          topic: 'Prompting',
          role: 'technical',
          points: 5,
        },
      ],
      terms: [
        { term: 'Token', category: 'AI Foundations', definition: 'A chunk of text.' },
      ],
      strings: {
        quizQuestionOf: 'Question {n} of {total}',
        quizCheckAnswer: 'Select an answer',
        quizNext: 'Next',
        quizSeeResults: 'See your results',
        quizCorrect: 'Correct',
        quizIncorrect: 'Not quite',
        quizSourceLabel: 'Source',
        quizKbdHint: 'Keys 1–4 to answer · Enter to continue',
        quizEmptyPool: 'No questions match this selection.',
        quizBackHome: 'Back to start',
        resultsTitle: 'Your result',
        resultsScoreOf: '{score} of {total} points',
        resultsBreakdown: 'By topic',
        resultsPerfect: 'A perfect run.',
        btnDownloadGuide: 'Download your cheat sheet (.txt)',
        btnRetryMissed: 'Retake the {n} you missed',
        btnStartOver: 'Start over',
        tipPasteGuide: 'Tip: paste the cheat sheet...',
      },
    };

    document.getElementById('quiz-data')!.textContent = JSON.stringify(mockPayload);

    // Mock window location
    delete (window as any).location;
    window.location = new URL('https://example.com/quiz?role=technical&len=quick&diff=all') as any;

    // Mock scrollTo
    window.scrollTo = vi.fn();
    // Mock matchMedia
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  afterEach(() => {
    listeners.forEach(({ type, listener, options }) => {
      originalRemoveEventListener.call(document, type, listener, options);
    });
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
    vi.restoreAllMocks();
  });

  it('does not mount if required elements are missing', () => {
    document.getElementById('quiz-data')!.remove();
    mountQuiz();
    expect(document.getElementById('quiz-root')!.innerHTML).toBe('');
  });

  it('renders question and advances quiz flow with correct answers', () => {
    mountQuiz();

    const root = document.getElementById('quiz-root')!;
    expect(root.innerHTML).toContain('AI Foundations');

    // Select the correct option
    let buttons = root.querySelectorAll<HTMLButtonElement>('.q-option');
    expect(buttons.length).toBe(3);

    // Let's find correct answer. In mock payload it is option index 1.
    let correctBtn = Array.from(buttons).find((b) => b.dataset.original === '1')!;
    correctBtn.click();

    expect(root.innerHTML).toContain('Correct');
    expect(root.innerHTML).toContain('It is 2.');

    // Click next
    let nextBtn = root.querySelector('#q-next') as HTMLButtonElement;
    nextBtn.click();

    // Verify it loads second question
    expect(root.innerHTML).toContain('Prompting');

    // Click correct answer (index 2 for q2)
    buttons = root.querySelectorAll<HTMLButtonElement>('.q-option');
    correctBtn = Array.from(buttons).find((b) => b.dataset.original === '2')!;
    correctBtn.click();

    // Click results
    const resultsBtn = root.querySelector('#q-next') as HTMLButtonElement;
    resultsBtn.click();

    // Results screen verification
    expect(root.innerHTML).toContain('Your result');
    expect(root.innerHTML).toContain('10 points');
    expect(root.innerHTML).toContain('A perfect run.');
  });

  it('handles wrong answers, calculates breakdown and supports retry missed flow', () => {
    mountQuiz();

    const root = document.getElementById('quiz-root')!;
    
    // Choose wrong option for q1 (index 0 instead of 1)
    let buttons = root.querySelectorAll<HTMLButtonElement>('.q-option');
    let wrongBtn = Array.from(buttons).find((b) => b.dataset.original === '0')!;
    wrongBtn.click();

    expect(root.innerHTML).toContain('Not quite');

    let nextBtn = root.querySelector('#q-next') as HTMLButtonElement;
    nextBtn.click();

    // Choose correct option for q2 (index 2)
    buttons = root.querySelectorAll<HTMLButtonElement>('.q-option');
    let correctBtn = Array.from(buttons).find((b) => b.dataset.original === '2')!;
    correctBtn.click();

    let resultsBtn = root.querySelector('#q-next') as HTMLButtonElement;
    resultsBtn.click();

    // Results calculations:
    // Score should be 5/10 (50%) -> Tier: Novice
    expect(root.innerHTML).toContain('Your result');
    expect(root.innerHTML).toContain('Novice');
    expect(root.innerHTML).toContain('5 of 10 points');

    // Click retry missed
    const retryBtn = root.querySelector('#r-retry') as HTMLButtonElement;
    expect(retryBtn).toBeDefined();
    retryBtn.click();

    // Verify we are back to q1 (What is 1+1?)
    expect(root.innerHTML).toContain('What is 1+1?');
  });

  it('responds to keyboard numeric and Enter keys', () => {
    mountQuiz();

    const root = document.getElementById('quiz-root')!;
    
    // We want to answer. Let's find display index of correct answer (index 1)
    const order = (mountQuiz as any).order; // Wait, it's scoped, but we can check display buttons
    const buttons = root.querySelectorAll<HTMLButtonElement>('.q-option');
    const displayIndex = Array.from(buttons).findIndex((b) => b.dataset.original === '1');
    const key = String(displayIndex + 1); // e.g. '1', '2' or '3'

    const keyEvent = new KeyboardEvent('keydown', { key });
    document.dispatchEvent(keyEvent);

    expect(root.innerHTML).toContain('It is 2.');

    // Next question using Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);

    expect(root.innerHTML).toContain('Question 2 of 2');
  });

  it('renders empty pool view when no questions match the selection criteria', () => {
    // Navigate with a mismatching query
    delete (window as any).location;
    window.location = new URL('https://example.com/quiz?role=technical&len=quick&diff=expert') as any;

    mountQuiz();

    const root = document.getElementById('quiz-root')!;
    expect(root.innerHTML).toContain('No questions match this selection.');
  });

  it('falls back to all difficulties when the query value is invalid', () => {
    delete (window as any).location;
    window.location = new URL('https://example.com/quiz?role=technical&len=quick&diff=not-a-level') as any;

    mountQuiz();

    const root = document.getElementById('quiz-root')!;
    expect(root.innerHTML).toContain('What is 1+1?');
    expect(root.innerHTML).not.toContain('No questions match this selection.');
  });

  it('reports completed-question progress accurately to assistive technology', () => {
    mountQuiz();

    const root = document.getElementById('quiz-root')!;
    const progress = root.querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuemax')).toBe('2');
    expect(progress.getAttribute('aria-valuenow')).toBe('0');

    root.querySelector<HTMLButtonElement>('.q-option')!.click();
    expect(progress.getAttribute('aria-valuenow')).toBe('1');
  });
});
