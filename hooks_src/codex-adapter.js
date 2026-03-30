#!/usr/bin/env node

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { normalizeCodexHookInput } = require('../runtimes/codex/adapters/hook-input');
const { toLegacyHookPayload } = require('../core/hooks/hook-context');

function main() {
  const hookName = process.argv[2];
  if (!hookName) process.exit(0);

  const hookPath = path.join(__dirname, `${hookName}.js`);
  if (!fs.existsSync(hookPath)) process.exit(0);

  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    let payload = {};
    try {
      payload = input ? JSON.parse(input) : {};
    } catch {
      process.exit(0);
    }

    const envelope = normalizeCodexHookInput(payload);
    const legacyPayload = toLegacyHookPayload(envelope);
    const result = spawnSync(process.execPath, [hookPath], {
      cwd: path.resolve(__dirname, '..'),
      input: JSON.stringify(legacyPayload),
      encoding: 'utf8',
    });

    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(typeof result.status === 'number' ? result.status : 0);
  });
}

main();
