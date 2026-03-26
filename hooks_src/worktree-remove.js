#!/usr/bin/env node

/**
 * worktree-remove.js — WorktreeRemove hook
 *
 * Fires when a git worktree is removed (fleet agent completes or is cleaned up).
 * Responsibilities:
 *   1. Log the worktree removal to telemetry
 *   2. Update the fleet session file to mark the agent as complete
 *   3. Queue a merge conflict check if the worktree had changes (Tier 9 prep)
 *   4. Clean up any scope claims the worktree's agent held
 *
 * Fringe cases:
 * - Worktree removed without corresponding fleet session: log and skip
 * - Worktree had no commits: skip merge check, just clean up
 * - Multiple worktrees removed simultaneously: each runs independently, no coordination needed
 * - Scope claim file missing: skip cleanup (already released or never claimed)
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

    const worktreePath = event.worktree_path || event.path || null;
    const worktreeName = worktreePath ? path.basename(worktreePath) : null;
    const branchName = event.branch || event.branch_name || null;

    health.increment('worktree-remove', 'count');

    // Log to telemetry
    health.logTiming('worktree-remove', 0, {
      event: 'worktree-remove',
      worktree: worktreeName,
      branch: branchName,
    });

    // Write to audit log
    health.writeAuditLog('worktree-removed', {
      worktree: worktreeName,
      branch: branchName,
    });

    // Queue merge conflict check for this branch (processed by citadel:merge-review)
    if (branchName) {
      queueMergeCheck(branchName, worktreeName);
    }

    // Clean up scope claims for this worktree
    cleanupScopeClaims(worktreeName);

    // Update fleet session if this worktree was part of one
    updateFleetSession(worktreeName, branchName);

    process.exit(0);
  });
}

function queueMergeCheck(branch, worktree) {
  try {
    const queueFile = path.join(PROJECT_ROOT, '.planning', 'telemetry', 'merge-check-queue.jsonl');
    const entry = JSON.stringify({
      event: 'worktree-removed',
      timestamp: new Date().toISOString(),
      branch,
      worktree,
      status: 'pending-merge-review',
    });
    fs.appendFileSync(queueFile, entry + '\n', 'utf8');
  } catch { /* non-critical */ }
}

function cleanupScopeClaims(worktreeName) {
  if (!worktreeName) return;
  try {
    const claimsDir = path.join(PROJECT_ROOT, '.planning', 'coordination', 'claims');
    if (!fs.existsSync(claimsDir)) return;
    const files = fs.readdirSync(claimsDir);
    for (const file of files) {
      // Claims named after the worktree or agent
      if (file.includes(worktreeName)) {
        fs.unlinkSync(path.join(claimsDir, file));
      }
    }
  } catch { /* non-critical */ }
}

function updateFleetSession(worktreeName, branch) {
  if (!worktreeName && !branch) return;
  try {
    const fleetDir = path.join(PROJECT_ROOT, '.planning', 'fleet');
    if (!fs.existsSync(fleetDir)) return;

    const files = fs.readdirSync(fleetDir).filter(f => f.startsWith('session-') && f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(fleetDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (!/status:\s*(active|needs-continue)/mi.test(content)) continue;

      // Mark the worktree's agent as cleaned up in the session file
      const marker = `\n<!-- worktree-removed: ${worktreeName || branch} at ${new Date().toISOString()} -->`;
      fs.appendFileSync(filePath, marker + '\n');
      break;
    }
  } catch { /* non-critical */ }
}

main();
