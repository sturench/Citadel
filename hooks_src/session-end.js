#!/usr/bin/env node

/**
 * session-end.js — SessionEnd hook
 *
 * Fires when the Claude Code session ends (user closes, times out, or exits).
 * Responsibilities:
 *   1. Log session end to telemetry
 *   2. Update active campaign continuation state if mid-campaign
 *   3. Write a doc-sync queue entry if there are pending doc updates
 *   4. Mark any in-progress fleet agents as needing-continue
 *
 * This hook fires AFTER the session is done — it cannot send output to Claude.
 * It only writes state files for the next session to read.
 *
 * Fringe cases:
 * - Session ends mid-campaign: continuation state is updated so next session picks up
 * - Session ends with no active work: quiet exit, nothing written
 * - Session ends during fleet execution: fleet agents should already have their own state
 * - Hook crashes: non-critical, logs error but doesn't block
 */

const fs = require('fs');
const path = require('path');
const health = require('./harness-health-util');

const PROJECT_ROOT = health.PROJECT_ROOT;

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    let event = {};
    try { event = JSON.parse(input); } catch { /* partial input ok */ }

    health.increment('session-end', 'count');

    // Log session end
    health.logTiming('session-end', 0, {
      event: 'session-end',
      session_id: event.session_id || null,
    });

    // Check for active campaigns and mark continuation point
    markCampaignContinuation();

    // Write doc sync queue entry (Tier 6 - processed by next session or doc-sync hook)
    queueDocSync();

    process.exit(0);
  });
}

function markCampaignContinuation() {
  try {
    const campaignsDir = path.join(PROJECT_ROOT, '.planning', 'campaigns');
    if (!fs.existsSync(campaignsDir)) return;

    const files = fs.readdirSync(campaignsDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(campaignsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (!/^Status:\s*active/mi.test(content)) continue;

      // Add a session-end marker to the continuation state
      const marker = `\n<!-- session-end: ${new Date().toISOString()} -->\n`;
      const updated = content.replace(
        /(## Continuation State[\s\S]*?)(\n## |$)/,
        (match, section, next) => section + marker + next
      );
      if (updated !== content) {
        fs.writeFileSync(filePath, updated);
      }
      break; // only one active campaign at a time
    }
  } catch { /* non-critical */ }
}

function queueDocSync() {
  try {
    const config = health.readConfig();
    const docConfig = config.docs || {};
    if (docConfig.auto === false) return; // opted out

    const queueFile = path.join(PROJECT_ROOT, '.planning', 'telemetry', 'doc-sync-queue.jsonl');
    const entry = JSON.stringify({
      event: 'session-end',
      timestamp: new Date().toISOString(),
      audiences: docConfig.audiences || ['user', 'org', 'agents'],
      status: 'pending',
    });
    fs.appendFileSync(queueFile, entry + '\n', 'utf8');
  } catch { /* non-critical */ }
}

main();
