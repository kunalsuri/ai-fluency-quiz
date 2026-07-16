// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
// The quiz island: a linear state machine rendered into #quiz-root.
// No framework, no storage, no network — state lives in memory for the
// duration of the session and dies with the tab.
import { buildPool, computeTopicBreakdown, getTier, sessionSize, shuffle, isSafeHttpUrl, type LengthPresetId } from '../lib/engine';
import { personalGuide } from '../lib/fieldguide';
import type { Answer, Difficulty, Question, QuizPayload, Role } from '../lib/types';

interface SessionQuestion {
  question: Question;
  /** Display order → original option index (options are shuffled per question). */
  order: number[];
}

interface State {
  phase: 'quiz' | 'results' | 'empty';
  queue: SessionQuestion[];
  index: number;
  answers: Answer[];
  answered: boolean;
  isRetry: boolean;
}

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

function esc(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function mountQuiz(): void {
  const dataEl = document.getElementById('quiz-data');
  const root = document.getElementById('quiz-root');
  if (!dataEl || !root) return;

  const payload: QuizPayload = JSON.parse(dataEl.textContent ?? '{}');
  const s = payload.strings;
  const prefix = payload.lang === 'fr' ? '/fr' : '';

  const params = new URLSearchParams(window.location.search);
  const role: Role = params.get('role') === 'managerial' ? 'managerial' : 'technical';
  const len = (['quick', 'standard', 'full'].includes(params.get('len') ?? '') ? params.get('len') : 'standard') as LengthPresetId;
  const requestedDifficulty = params.get('diff');
  const diff: Difficulty | 'all' = DIFFICULTIES.includes(requestedDifficulty as Difficulty)
    ? (requestedDifficulty as Difficulty)
    : 'all';
  const roleBankIds = new Set(payload.banks.filter((b) => b.role === role).map((b) => b.id));
  const requestedTopics = params.getAll('topics').filter((t) => roleBankIds.has(t));

  const pool = buildPool(payload.questions, role, new Set(requestedTopics), diff);
  const count = sessionSize(pool.length, len);

  const state: State = {
    phase: pool.length === 0 ? 'empty' : 'quiz',
    queue: shuffle(pool)
      .slice(0, count)
      .map((q) => ({ question: q, order: shuffle(q.options.map((_, i) => i)) })),
    index: 0,
    answers: [],
    answered: false,
    isRetry: false,
  };

  function current(): SessionQuestion {
    return state.queue[state.index];
  }

  function tr(key: string, vars?: Record<string, string | number>): string {
    let text = s[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    return text;
  }

  // ---------- Views ----------

  function renderEmpty(): void {
    root!.innerHTML = `
      <p class="lede">${esc(tr('quizEmptyPool'))}</p>
      <p style="margin-top:2rem;"><a class="btn btn-quiet" href="${prefix}/">${esc(tr('quizBackHome'))}</a></p>`;
  }

  function renderQuestion(): void {
    const { question: q, order } = current();
    const n = state.index + 1;
    const total = state.queue.length;
    const completed = state.index;
    const progress = Math.round((completed / total) * 100);
    const progressLabel = tr('quizQuestionOf', { n, total });

    root!.innerHTML = `
      <div class="q-progress" role="progressbar" aria-label="${esc(progressLabel)}" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${total}">
        <span style="width:${progress}%"></span>
      </div>
      <p class="q-meta">
        <span>${esc(tr('quizQuestionOf', { n, total }))}</span>
        <span class="topic">${esc(q.topic)}</span>
        <span>${esc(q.difficulty)}</span>
      </p>
      <h1 class="q-text" id="q-text">${esc(q.question)}</h1>
      <div class="q-options" role="group" aria-labelledby="q-text">
        ${order
          .map(
            (originalIdx, displayIdx) => `
          <button type="button" class="q-option" data-original="${originalIdx}" data-display="${displayIdx}">
            <span class="key">${KEYS[displayIdx]}</span>
            <span>${esc(q.options[originalIdx])}</span>
          </button>`,
          )
          .join('')}
      </div>
      <div id="q-feedback" aria-live="polite"></div>
      <p class="q-kbd-hint" style="margin-top:1.6rem;">${esc(tr('quizKbdHint'))}</p>`;

    root!.querySelectorAll<HTMLButtonElement>('.q-option').forEach((btn) => {
      btn.addEventListener('click', () => answer(Number(btn.dataset.original)));
    });
  }

  function answer(selectedOriginal: number): void {
    if (state.answered) return;
    state.answered = true;

    const { question: q } = current();
    const isCorrect = selectedOriginal === q.correctAnswerIndex;
    state.answers.push({
      questionId: q.id,
      selectedIndex: selectedOriginal,
      isCorrect,
      points: isCorrect ? q.points : 0,
      question: q,
    });

    // Mark the option rows: correct always shown, wrong selection flagged, rest dimmed.
    root!.querySelectorAll<HTMLButtonElement>('.q-option').forEach((btn) => {
      const original = Number(btn.dataset.original);
      btn.disabled = true;
      if (original === q.correctAnswerIndex) btn.classList.add('is-correct');
      else if (original === selectedOriginal) btn.classList.add('is-wrong');
      else btn.classList.add('is-dim');
    });

    const last = state.index === state.queue.length - 1;
    const sourceLink =
      q.source && isSafeHttpUrl(q.source)
        ? `<a class="source" href="${esc(q.source)}" target="_blank" rel="noopener noreferrer">${esc(tr('quizSourceLabel'))}: ${esc(q.source)}</a>`
        : '';

    const feedback = root!.querySelector('#q-feedback')!;
    feedback.innerHTML = `
      <div class="q-note ${isCorrect ? 'is-correct' : 'is-wrong'}">
        <p class="verdict">${esc(isCorrect ? tr('quizCorrect') : tr('quizIncorrect'))}</p>
        <p class="explanation">${esc(q.explanation)}</p>
        ${sourceLink}
      </div>
      <div class="q-actions">
        <button type="button" class="btn" id="q-next">${esc(last ? tr('quizSeeResults') : tr('quizNext'))} →</button>
      </div>`;

    feedback.querySelector('#q-next')!.addEventListener('click', next);
    (feedback.querySelector('#q-next') as HTMLButtonElement).focus();

    const progressElement = root!.querySelector<HTMLElement>('.q-progress');
    const bar = progressElement?.querySelector<HTMLElement>('span');
    if (bar) bar.style.width = `${Math.round(((state.index + 1) / state.queue.length) * 100)}%`;
    progressElement?.setAttribute('aria-valuenow', String(state.index + 1));
  }

  function next(): void {
    if (!state.answered) return;
    state.answered = false;
    if (state.index < state.queue.length - 1) {
      state.index++;
      renderQuestion();
      window.scrollTo({ top: 0 });
    } else {
      state.phase = 'results';
      renderResults();
      window.scrollTo({ top: 0 });
    }
  }

  function renderResults(): void {
    const answers = state.answers;
    const maxScore = answers.reduce((sum, a) => sum + a.question.points, 0);
    const score = answers.reduce((sum, a) => sum + a.points, 0);
    const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
    const tier = getTier(payload.tiers[role], percent);
    const missed = answers.filter((a) => !a.isCorrect);
    const breakdown = computeTopicBreakdown(answers);

    const barsHtml = breakdown
      .map(
        (row) => `
        <div class="r-bar">
          <span>${esc(row.topic)}</span>
          <span class="track"><span class="fill" style="width:${row.percent}%"></span></span>
          <span class="pct">${row.percent}%</span>
        </div>`,
      )
      .join('');

    const missedHtml =
      missed.length === 0
        ? `<p class="lede">${esc(tr('resultsPerfect'))}</p>`
        : missed
            .map(
              (a) => `
          <details>
            <summary>${esc(a.question.question)}</summary>
            <div class="detail-body">
              <p><span class="label">${esc(tr('resultsYourAnswer'))}</span><span class="wrong-answer">${esc(a.question.options[a.selectedIndex] ?? '—')}</span></p>
              <p><span class="label">${esc(tr('resultsCorrectAnswer'))}</span><span class="right-answer">${esc(a.question.options[a.question.correctAnswerIndex])}</span></p>
              <p>${esc(a.question.explanation)}</p>
            </div>
          </details>`,
            )
            .join('');

    root!.innerHTML = `
      <p class="kicker">${esc(state.isRetry ? tr('resultsRetryTitle') : tr('resultsTitle'))}</p>
      <p class="r-score"><span id="r-count">0</span><sup>%</sup></p>
      <p class="r-tier">${esc(tier.status)}</p>
      <p class="r-tier-desc">${esc(tier.description)}</p>
      <p class="r-points">${esc(tr('resultsScoreOf', { score, total: maxScore }))}</p>

      <section class="r-section">
        <h2>${esc(tr('resultsBreakdown'))}</h2>
        <div class="r-bars">${barsHtml}</div>
      </section>

      <section class="r-section">
        ${missed.length > 0 ? `<h2>${esc(tr('resultsMissedHeading', { n: missed.length }))}</h2>` : ''}
        <div class="r-missed">${missedHtml}</div>
      </section>

      <div class="r-actions">
        ${missed.length > 0 ? `<button type="button" class="btn" id="r-download">${esc(tr('btnDownloadGuide'))}</button>` : ''}
        ${missed.length > 0 ? `<button type="button" class="btn btn-quiet" id="r-retry">${esc(tr('btnRetryMissed', { n: missed.length }))}</button>` : ''}
        <a class="btn btn-quiet" href="${prefix}/">${esc(tr('btnStartOver'))}</a>
      </div>
      ${missed.length > 0 ? `<p class="r-tip">${esc(tr('tipPasteGuide'))}</p>` : ''}`;

    // Count-up (skipped under reduced motion).
    const counter = root!.querySelector('#r-count')!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      counter.textContent = String(percent);
    } else {
      const start = performance.now();
      const duration = 900;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        counter.textContent = String(Math.round(percent * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    root!.querySelector('#r-download')?.addEventListener('click', () => {
      const text = personalGuide(payload.lang, {
        percent,
        score,
        maxScore,
        tier,
        missed,
        terms: payload.terms,
      });
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-fluency-cheat-sheet-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });

    root!.querySelector('#r-retry')?.addEventListener('click', () => {
      state.queue = shuffle(missed.map((a) => a.question)).map((q) => ({
        question: q,
        order: shuffle(q.options.map((_, i) => i)),
      }));
      state.index = 0;
      state.answers = [];
      state.answered = false;
      state.isRetry = true;
      state.phase = 'quiz';
      renderQuestion();
      window.scrollTo({ top: 0 });
    });
  }

  // ---------- Keyboard ----------

  document.addEventListener('keydown', (e) => {
    if (state.phase !== 'quiz') return;
    if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    if (!state.answered) {
      const num = Number(e.key);
      if (num >= 1 && num <= current().order.length) {
        e.preventDefault();
        answer(current().order[num - 1]);
      }
      const letterIdx = KEYS.indexOf(e.key.toUpperCase());
      if (letterIdx >= 0 && letterIdx < current().order.length) {
        e.preventDefault();
        answer(current().order[letterIdx]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      next();
    }
  });

  // ---------- Boot ----------

  if (state.phase === 'empty') renderEmpty();
  else renderQuestion();
}
