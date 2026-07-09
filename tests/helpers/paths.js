/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repo root, for tests that read the real data/ and scripts/ trees. */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
