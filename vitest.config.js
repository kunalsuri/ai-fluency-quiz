/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,ts}'],
    environment: 'node',
  },
});
