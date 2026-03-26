#!/usr/bin/env node

/**
 * test-all.js — Full fast test suite for Citadel
 *
 * Runs both hook smoke tests and skill lint checks in sequence.
 * Fast (no network, no LLM calls). Suitable for CI and pre-commit.
 *
 * For execution-based scenario testing (requires claude CLI):
 *   node scripts/skill-bench.js --execute
 *
 * Usage:
 *   node scripts/test-all.js           # hooks + skills
 *   node scripts/test-all.js --strict  # treat skill WARNs as failures
 *
 * Exit codes:
 *   0 = all tests pass
 *   1 = hook smoke tests failed
 *   2 = skill lint failed
 *   3 = both failed
 */

'use strict';

const { execFileSync } = require('child_process');
const path             = require('path');

const PLUGIN_ROOT  = path.resolve(__dirname, '..');
const SMOKE_TEST   = path.join(PLUGIN_ROOT, 'hooks_src', 'smoke-test.js');
const SKILL_LINT   = path.join(PLUGIN_ROOT, 'scripts', 'skill-lint.js');

const STRICT = process.argv.includes('--strict');

// ── Banner ────────────────────────────────────────────────────────────────────

console.log('\nCitadel Full Test Suite\n' + '='.repeat(40));
console.log('Running: hook smoke test + skill lint\n');

// ── Run a sub-script ──────────────────────────────────────────────────────────

function run(label, scriptPath, extraArgs = []) {
  console.log(`\n▶ ${label}`);
  console.log('-'.repeat(40));

  try {
    execFileSync(
      process.execPath,              // same node binary
      [scriptPath, ...extraArgs],
      {
        cwd:      PLUGIN_ROOT,
        stdio:    'inherit',          // stream output directly
        encoding: 'utf8',
      }
    );
    return true;
  } catch (err) {
    // execFileSync throws when exit code !== 0
    return false;
  }
}

// ── Execute ───────────────────────────────────────────────────────────────────

const hooksPassed  = run('Hook Smoke Test',  SMOKE_TEST);
const lintArgs     = STRICT ? ['--warn-as-fail'] : [];
const skillsPassed = run('Skill Lint',       SKILL_LINT, lintArgs);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(40));
console.log('SUMMARY');
console.log(`  Hook smoke test: ${hooksPassed  ? 'PASS' : 'FAIL'}`);
console.log(`  Skill lint:      ${skillsPassed ? 'PASS' : 'FAIL'}`);
console.log('');

if (hooksPassed && skillsPassed) {
  console.log('All tests pass.\n');
  console.log('Next steps:');
  console.log('  node scripts/skill-bench.js --list      see benchmark scenarios');
  console.log('  node scripts/skill-bench.js             validate scenario files');
  console.log('  node scripts/skill-bench.js --execute   run against claude CLI\n');
  process.exit(0);
} else {
  const hookFail  = !hooksPassed  ? 1 : 0;
  const skillFail = !skillsPassed ? 2 : 0;
  const code      = hookFail | skillFail;

  if (!hooksPassed)  console.log('Hook smoke test failed. Fix hook issues before proceeding.');
  if (!skillsPassed) console.log('Skill lint failed. Fix FAIL-level issues before shipping.');
  console.log('');
  process.exit(code);
}
