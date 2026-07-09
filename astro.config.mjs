// Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ai-fluency-quiz.vercel.app',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
