// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
// UI strings for both languages. Data (questions, terms, papers) carries its own
// translations in data/*.fr.json — this file only covers interface chrome.
import type { Difficulty, Lang } from './types';

export const DIFFICULTY_LABELS: Record<Lang, Record<Difficulty, string>> = {
  en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' },
  fr: { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', expert: 'Expert' },
};

export const STRINGS = {
  en: {
    siteName: 'AI Fluency',
    siteTagline: 'How AI-fluent are you?',
    navAssessment: 'Assessment',
    navGuide: 'Cheat Sheets',
    navFrontier: 'Frontier',
    footerPrivacy: 'No cookies. No tracking. Nothing stored, nothing sent.',
    footerSource: 'Source on GitHub',
    // Landing
    heroTitle: 'How AI-fluent are you?',
    heroLede:
      'Ten minutes. Honest questions, real explanations, cited sources. Find out exactly where you stand — and leave with a cheat sheet built for your gaps.',
    roleLegend: 'Who are you?',
    roleTechnicalTitle: 'I build with AI',
    roleTechnicalDesc: 'Transformers, prompting, RAG, agents, context and harness engineering.',
    roleManagerialTitle: 'I lead with AI',
    roleManagerialDesc: 'ROI, adoption, privacy, risk, and putting AI to work in a team.',
    roleStat: '{topics} topics · {questions} questions',
    roleNote: 'Two separate tracks: each draws on its own question banks and is graded on its own tier ladder.',
    lengthLegend: 'How long do you have?',
    lengthQuick: 'Quick',
    lengthQuickDesc: '10 questions · ~5 min',
    lengthStandard: 'Standard',
    lengthStandardDesc: '20 questions · ~10 min',
    lengthFull: 'The full bank',
    lengthFullDesc: 'Every question you qualify for',
    customizeSummary: 'Customize topics & difficulty',
    topicsTechnical: 'Technical topics — for “I build with AI”',
    topicsManagerial: 'Managerial topics — for “I lead with AI”',
    topicsHint: 'Leave everything unchecked to include all topics for your track.',
    difficultyLabel: 'Difficulty',
    labelAll: 'All levels',
    btnBegin: 'Begin the assessment',
    matchSome: '{n} questions match your selection',
    matchNone: 'No questions match this combination — loosen the filters above.',
    landingGuideTitle: 'Guide / Cheat Sheets',
    landingGuideDesc: 'Cheat sheets for every topic — read them here or take them with you as plain text.',
    landingFrontierTitle: 'The Frontier',
    landingFrontierDesc: 'The landmark papers behind every concept in this quiz, curated by hand.',
    landingBrowse: 'Browse',
    // Quiz island
    quizQuestionOf: 'Question {n} of {total}',
    quizCheckAnswer: 'Select an answer',
    quizNext: 'Next',
    quizSeeResults: 'See your results',
    quizCorrect: 'Correct',
    quizIncorrect: 'Not quite',
    quizSourceLabel: 'Source',
    quizKbdHint: 'Keys 1–4 to answer · Enter to continue',
    quizEmptyPool: 'No questions match this selection. Loosen the filters and try again.',
    quizBackHome: 'Back to start',
    // Results
    resultsTitle: 'Your result',
    resultsRetryTitle: 'Your second pass',
    resultsScoreOf: '{score} of {total} points',
    resultsBreakdown: 'By topic',
    resultsMissedHeading: 'The {n} you missed',
    resultsPerfect: 'A perfect run. Every question, every topic.',
    resultsYourAnswer: 'Your answer',
    resultsCorrectAnswer: 'Correct answer',
    btnDownloadGuide: 'Download your cheat sheet (.txt)',
    btnRetryMissed: 'Retake the {n} you missed',
    btnStartOver: 'Start over',
    tipPasteGuide: 'Tip: the cheat sheet is plain text — paste it into your favorite AI assistant and ask to be tutored.',
    // Guide
    guideTitle: 'Guide / Cheat Sheets',
    guideLede: 'One cheat sheet per topic: every term that matters, typeset for reading and packaged for taking away. No quiz here — just the reference.',
    guideTermCount: '{n} terms',
    guideDownload: 'Download this cheat sheet (.txt)',
    guideExampleLabel: 'e.g.',
    guideAllTopics: 'All topics',
    // Frontier
    frontierTitle: 'The Frontier',
    frontierLede: 'The papers that built this field — hand-picked, with one honest line on why each one matters.',
    frontierRead: 'Read the paper',
  },
  fr: {
    siteName: 'AI Fluency',
    siteTagline: 'Où en êtes-vous avec l’IA ?',
    navAssessment: 'Évaluation',
    navGuide: 'Fiches',
    navFrontier: 'Frontière',
    footerPrivacy: 'Pas de cookies. Pas de suivi. Rien de stocké, rien d’envoyé.',
    footerSource: 'Code source sur GitHub',
    heroTitle: 'Où en êtes-vous avec l’IA ?',
    heroLede:
      'Dix minutes. Des questions honnêtes, de vraies explications, des sources citées. Sachez exactement où vous en êtes — et repartez avec une fiche de révision faite pour vos lacunes.',
    roleLegend: 'Qui êtes-vous ?',
    roleTechnicalTitle: 'Je construis avec l’IA',
    roleTechnicalDesc: 'Transformers, prompting, RAG, agents, ingénierie du contexte et des harnais.',
    roleManagerialTitle: 'Je dirige avec l’IA',
    roleManagerialDesc: 'ROI, adoption, confidentialité, risques, et mise en œuvre de l’IA en équipe.',
    roleStat: '{topics} sujets · {questions} questions',
    roleNote: 'Deux parcours distincts : chacun a ses propres banques de questions et sa propre échelle de niveaux.',
    lengthLegend: 'Combien de temps avez-vous ?',
    lengthQuick: 'Rapide',
    lengthQuickDesc: '10 questions · ~5 min',
    lengthStandard: 'Standard',
    lengthStandardDesc: '20 questions · ~10 min',
    lengthFull: 'La banque complète',
    lengthFullDesc: 'Toutes les questions de votre parcours',
    customizeSummary: 'Personnaliser les sujets et la difficulté',
    topicsTechnical: 'Sujets techniques — pour « Je construis avec l’IA »',
    topicsManagerial: 'Sujets managériaux — pour « Je dirige avec l’IA »',
    topicsHint: 'Ne cochez rien pour inclure tous les sujets de votre parcours.',
    difficultyLabel: 'Difficulté',
    labelAll: 'Tous niveaux',
    btnBegin: 'Commencer l’évaluation',
    matchSome: '{n} questions correspondent à votre sélection',
    matchNone: 'Aucune question ne correspond à cette combinaison — élargissez les filtres ci-dessus.',
    landingGuideTitle: 'Guide / Fiches',
    landingGuideDesc: 'Des fiches de révision pour chaque sujet — à lire ici ou à emporter en texte brut.',
    landingFrontierTitle: 'La Frontière',
    landingFrontierDesc: 'Les articles fondateurs derrière chaque concept de ce quiz, choisis à la main.',
    landingBrowse: 'Parcourir',
    quizQuestionOf: 'Question {n} sur {total}',
    quizCheckAnswer: 'Choisissez une réponse',
    quizNext: 'Suivant',
    quizSeeResults: 'Voir vos résultats',
    quizCorrect: 'Correct',
    quizIncorrect: 'Pas tout à fait',
    quizSourceLabel: 'Source',
    quizKbdHint: 'Touches 1–4 pour répondre · Entrée pour continuer',
    quizEmptyPool: 'Aucune question ne correspond à cette sélection. Élargissez les filtres et réessayez.',
    quizBackHome: 'Retour à l’accueil',
    resultsTitle: 'Votre résultat',
    resultsRetryTitle: 'Votre second passage',
    resultsScoreOf: '{score} points sur {total}',
    resultsBreakdown: 'Par sujet',
    resultsMissedHeading: 'Les {n} manquées',
    resultsPerfect: 'Un sans-faute. Chaque question, chaque sujet.',
    resultsYourAnswer: 'Votre réponse',
    resultsCorrectAnswer: 'Bonne réponse',
    btnDownloadGuide: 'Télécharger votre fiche personnalisée (.txt)',
    btnRetryMissed: 'Refaire les {n} manquées',
    btnStartOver: 'Recommencer',
    tipPasteGuide: 'Astuce : la fiche est en texte brut — collez-la dans votre assistant IA préféré et demandez un tutorat.',
    guideTitle: 'Guide / Fiches',
    guideLede: 'Une fiche de révision par sujet : tous les termes qui comptent, mis en page pour la lecture et emballés pour l’emporter. Pas de quiz ici — juste la référence.',
    guideTermCount: '{n} termes',
    guideDownload: 'Télécharger cette fiche (.txt)',
    guideExampleLabel: 'ex.',
    guideAllTopics: 'Tous les sujets',
    frontierTitle: 'La Frontière',
    frontierLede: 'Les articles qui ont construit ce domaine — choisis à la main, avec une ligne honnête sur l’importance de chacun.',
    frontierRead: 'Lire l’article',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type StringKey = keyof (typeof STRINGS)['en'];

/** Translate with `{placeholder}` interpolation. */
export function tr(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  let text: string = STRINGS[lang][key] ?? STRINGS.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

/** Path of the same page in the other language, for the header toggle. */
export function alternatePath(lang: Lang, path: string): string {
  if (lang === 'en') return path === '/' ? '/fr/' : `/fr${path}`;
  const stripped = path.replace(/^\/fr/, '');
  return stripped === '' ? '/' : stripped;
}

export function localePrefix(lang: Lang): string {
  return lang === 'fr' ? '/fr' : '';
}
