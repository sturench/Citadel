# Campaign: Citadel V2 Build

Status: completed
Started: 2026-03-26T18:48:42.472Z
Direction: Build all V2 roadmap tiers — governance, observability, recovery, learning, documentation, platform features, merge arbitration. Make Citadel undeniably infrastructure, not just tooling.

## Claimed Scope
- hooks_src/
- hooks/
- agents/
- skills/
- scripts/
- .planning/_templates/

## Phases

1. [complete] build: Tier 1 — Foundation (hook events, agent frontmatter, state migration, security, smart PreCompact)
2. [complete] build: Tier 2 — Governance (scope enforcement, audit log, policy layer)
3. [complete] build: Tier 3 — Observability (dashboard skill, real /do status)
4. [complete] build: Tier 4 — Recovery (phase checkpoints, rollback)
5. [complete] build: Tier 5 — Learning (auto-extract patterns, citadel:learn skill)
6. [complete] build: Tier 6 — Documentation (automatic, audience-aware, opt-out)
7. [complete] build: Tier 8 — Platform Features (schedule skill, templates, setup updates)
8. [complete] build: Tier 9 — Merge Arbitration (merge-review skill, fleet conflict protocol)
9. [complete] verify: Full smoke test — 70/70 PASS

## Phase End Conditions

| Phase | Type | Condition |
|---|---|---|
| 1 | command_passes | node hooks_src/smoke-test.js exits 0 |
| 1 | file_exists | hooks_src/stop-failure.js |
| 1 | file_exists | hooks_src/task-events.js |
| 1 | file_exists | hooks_src/subagent-stop.js |
| 1 | file_exists | hooks_src/session-end.js |
| 1 | file_exists | hooks_src/worktree-remove.js |
| 1 | command_passes | node -e "JSON.parse(require('fs').readFileSync('hooks/hooks-template.json','utf8'))" exits 0 |
| 2 | file_exists | hooks_src/governance.js |
| 3 | file_exists | skills/dashboard/SKILL.md |
| 4 | manual | Archon campaign can checkpoint and rollback a phase |
| 5 | file_exists | skills/learn/SKILL.md |
| 6 | file_exists | hooks_src/doc-sync.js |
| 7 | file_exists | skills/schedule/SKILL.md |
| 7 | file_exists | .planning/_templates/REVIEW.md |
| 7 | file_exists | .planning/_templates/claude-triage.yml |
| 8 | file_exists | skills/merge-review/SKILL.md |
| 9 | command_passes | node hooks_src/smoke-test.js exits 0 |

## Feature Ledger

| Feature | Status | Phase | Notes |
|---|---|---|---|
| 7 new hook events | complete | 1 | PostCompact, StopFailure, TaskCreated, TaskCompleted, SubagentStop, SessionEnd, WorktreeRemove |
| Agent frontmatter | complete | 1 | maxTurns, disallowedTools, effort on all 4 agents |
| PLUGIN_DATA migration | complete | 1 | circuit-breaker-state + compact-state use CLAUDE_PLUGIN_DATA with fallback |
| Smart PreCompact | complete | 1 | auto-handoff with handoffMode config in harness.json |
| CLAUDE_CODE_SUBPROCESS_ENV_SCRUB | complete | 1 | inject in install-hooks.js; present in .claude/settings.json |
| Audit log utility | complete | 1 | writeAuditLog in harness-health-util, PLUGIN_DATA_DIR exported |
| Campaign scope enforcement | complete | 2 | protect-files.js warns on out-of-scope + blocks Restricted Files |
| Governance audit hook | complete | 2 | governance.js logs Edit/Write/Bash/Agent to audit.jsonl |
| Policy defaults in harness.json | complete | 2 | scopeEnforcement, auditLog, allowedOutOfScopeTools |
| Dashboard skill | complete | 3 | skills/dashboard/SKILL.md — /do status routes here |
| Phase checkpointing in Archon | complete | 4 | git stash before each phase, Recovery section added |
| /do rollback | complete | 4 | Tier 0 pattern routes to git stash pop |
| /learn skill | complete | 5 | extracts patterns, anti-patterns, quality rules from campaigns |
| doc-sync.js | complete | 6 | queue processor for doc staleness events |
| post-edit docStalenessCheck | complete | 6 | detects signature changes, queues to doc-sync-queue.jsonl |
| session-end.js | complete | 6 | queues doc sync on session exit, respects docs.auto config |
| /schedule skill | complete | 8 | CronCreate/Delete/List wrapper with cloud-persistent guidance |
| Setup skill GitHub App + MCP | complete | 8 | /install-github-app step + .mcp.json scaffold step |
| .planning/_templates/.mcp.json | complete | 8 | version-pinned MCP stubs with security note on mcp-server-git |
| .planning/_templates/REVIEW.md | complete | 8 | PR review template |
| .planning/_templates/claude-triage.yml | complete | 8 | GitHub Actions triage workflow |
| /merge-review skill | complete | 9 | fleet merge arbitration — conflict detection, merge order |
| worktree-remove.js merge queue | complete | 9 | queues completed worktrees to merge-check-queue.jsonl |
| Smoke test | complete | verify | 70/70 PASS — all hooks valid, syntax clean |

## Decision Log

- 2026-03-26: PLUGIN_DATA_DIR uses `CLAUDE_PLUGIN_DATA` env var with fallback to `.claude/` for backward compat. Ensures state survives plugin updates when env var is set, degrades gracefully when not.
- 2026-03-26: `handoffMode: "auto"` is default for smart PreCompact. Always writes handoff silently. "prompt" outputs a warning message (hooks are non-interactive, cannot truly prompt). "off" skips auto-save entirely.
- 2026-03-26: arch-reviewer gets `disallowedTools: [Edit, Write, Bash, NotebookEdit]` — truly read-only. knowledge-extractor gets `disallowedTools: [Bash, WebSearch, WebFetch, Agent]` — can only read/write knowledge files.
- 2026-03-26: Fleet agents handle Tiers 2-9 in parallel while Tier 1 builds in main session.

## Active Context

Campaign complete. All 9 tiers built and verified. 70/70 smoke tests passing.
Completed: 2026-03-26

## Continuation State

Phase: complete
Sub-step: done
Files modified: hooks_src/ (7 new + 3 modified), hooks/hooks-template.json, agents/ (4 updated), skills/ (5 new SKILL.md), scripts/install-hooks.js, .planning/_templates/ (3 new), .claude/settings.json
Blocking: none
