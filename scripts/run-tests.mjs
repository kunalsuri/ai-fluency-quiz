/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

console.log('🧪 Starting AI Fluency Quiz Test Runner...\n');

// 1. Validate data
console.log('📋 Running data validation...');
const valResult = spawnSync(process.execPath, [path.join(root, 'scripts', 'validate-data.mjs')], {
  stdio: 'inherit',
  cwd: root,
});

if (valResult.status !== 0) {
  console.error('\n❌ Data validation failed. Stopping test runner.');
  process.exit(valResult.status || 1);
}
console.log('✅ Data validation passed.\n');

// 2. Run unit & integration tests
console.log('🏃 Running Vitest test suite...');
const testResult = spawnSync(process.execPath, [path.join(root, 'node_modules', 'vitest', 'vitest.mjs'), 'run'], {
  stdio: 'inherit',
  cwd: root,
});

if (testResult.status !== 0) {
  console.error('\n❌ Vitest tests failed.');
  process.exit(testResult.status || 1);
}

console.log('\n🎉 All tests passed successfully!');
process.exit(0);
