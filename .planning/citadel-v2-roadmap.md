# Citadel V2 Roadmap
> Created: 2026-03-26
> Source: Research fleet (5 scouts) + deep codebase audit + strategic vision synthesis
> Research: .planning/research/fleet-anthropic-features-2026/

---

## The Goal

Transform Citadel from a well-designed orchestration toolkit into the **default infrastructure layer** for agentic software development. The difference is specific: infrastructure has provable primitives. Governance, observability, recovery, and learning — not just routing and execution.

---

## What's Already Defined (Don't Change These)

- Maturity ladder (raw prompting → CLAUDE.md → skills → hooks → orchestration/fleets)
- "Exit code ≠ quality" — task completion is not the same as correct output
- Post-prompt architecture — there's a threshold where prompting stops being the right abstraction
- One developer at team scale — the leverage thesis
- Orchestration as a layer, not a trick

---

## The Six Missing Primitives

These are what make Citadel infrastructure rather than tooling:

| Primitive | Current State | Target State |
|---|---|---|
| **Governance** | Protected files only | Per-agent scope limits, policy declarations, immutable audit log |
| **Observability** | JSONL telemetry files | Real dashboard: campaigns, phases, agent events, cost estimates |
| **Recovery** | Circuit breaker only | Phase checkpoints, campaign rollback, StopFailure-triggered restore |
| **Learning** | Manual knowledge-extractor | Auto-extract patterns from postmortems → quality gate rules |
| **Documentation** | Manual `/doc-gen` invocation | Always current, audience-aware, automatic — opt-out not opt-in |
| **Context preservation** | Dumb PreCompact snapshot | Smart save: detects unwritten work, auto-saves before compaction |
| **Merge arbitration** | Nothing | Fleet worktree conflict protocol before merge |
| **Approval gates** | Manual only | Built-in pause-for-human-input between campaign phases |

---

## Build Tiers

### Tier 1 — Foundation (do first, enables everything)
Fast wins. Zero risk to existing behavior. All are new platform features not yet wired.

- [ ] Wire 6 new hook events: `PostCompact`, `StopFailure`, `TaskCreated`, `TaskCompleted`, `SubagentStop`, `SessionEnd`, `WorktreeRemove`
- [ ] Add `disallowedTools`, `maxTurns`, `effort` to all agent definitions (archon.md, fleet.md, arch-reviewer.md, knowledge-extractor.md)
- [ ] Migrate `circuit-breaker-state.json` + `compact-state.json` to `${CLAUDE_PLUGIN_DATA}`
- [ ] Add `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to default harness.json env config
- [ ] Add `post-compact.js` hook (re-inject context in same session after compaction)
- [ ] Smart PreCompact: detect significant unwritten work and auto-save before compaction
  - `harness.json` config: `"preCompact": { "autoHandoff": true, "handoffMode": "auto" | "prompt" | "off" }`
  - Default: `auto` — silently writes session-handoff + any unwritten research/roadmap artifacts to `.planning/`
  - `prompt`: asks user before saving
  - `off`: current behavior (opt-out for users who don't want it)
  - Agents spawned for significant tasks must be given an output path — enforced in agent spawn guidelines

**Unlocks:** Every subsequent tier. These events are the sensor layer for governance and observability.

---

### Tier 2 — Governance (the category-defining move)
No other agent workflow project has a policy layer. This is the differentiator.

- [ ] Campaign scope enforcement via PreToolUse — agents blocked from editing files outside declared scope
- [ ] Immutable audit log — append-only `.planning/telemetry/audit.jsonl` records every significant action
- [ ] Policy declarations in `harness.json` — projects declare what agents can/cannot do
- [ ] Role-based `disallowedTools` per agent — architect agents can't write code, reviewers can't push
- [ ] `SubagentStop` hook writes agent boundary events to audit log

**Unlocks:** Trust in unattended agent runs. Required for institutional adoption.

---

### Tier 3 — Observability (makes governance visible)
- [ ] Real `/do status` — reads telemetry into human-readable dashboard: active campaigns, phase progress, recent events, error rates
- [ ] Campaign timeline — phase duration, agents spawned, artifacts produced
- [ ] Cost estimation — rough token count per campaign using TaskCreated/TaskCompleted events
- [ ] `citadel:dashboard` skill — on-demand report from `.planning/telemetry/`

**Unlocks:** Ability to show what's happening. Required for trust in multi-session campaigns.

---

### Tier 4 — Recovery (makes campaigns safe on real codebases)
- [ ] Phase checkpointing — `git stash` with campaign-slug label before each phase starts
- [ ] `StopFailure` hook triggers recovery — failed phase attempts restore from checkpoint
- [ ] `/do rollback` — restores to last campaign checkpoint
- [ ] Campaign rollback recorded in audit log

**Unlocks:** Running Citadel on production codebases without fear. Currently campaigns can leave things in a broken state.

---

### Tier 5 — Learning (makes the system improve over time)
- [ ] Auto-postmortem → quality gate rules — patterns from failed campaigns become new `qualityRules` entries
- [ ] Knowledge base auto-population — `.planning/knowledge/` grows after every campaign
- [ ] Failed fix pattern detection — if same fix fails twice, create a negative pattern record
- [ ] `citadel:learn` skill — runs after campaign completion, extracts and stores patterns

**Unlocks:** Compounding value. System gets smarter with each campaign.

---

### Tier 6 — Documentation (automatic, audience-aware, opt-out)
Documentation happens as a side effect of work — not as a separate task.
There are four audiences, each with different needs. The system serves all four by default.

**The four audiences:**
- **User** — what was built, how it works, what changed (CLAUDE.md, session notes, campaign decisions)
- **Org** — architecture decisions, why things are the way they are, onboarding context (`.planning/knowledge/`, ADRs)
- **Their users** — public API docs, component docs, README (generated from code + exports)
- **Agents** — `rules-summary.md`, agent-context files, CLAUDE.md — what future agents need to work effectively in this codebase

**The rule:** Documentation is always current. You never run `/doc-gen` manually unless you want non-obvious formatting or want to opt out of a specific file.

- [ ] `SessionEnd` hook triggers doc sync — at session end, detect what changed and update relevant docs for all four audiences
- [ ] Post-edit doc staleness detection — when a function signature or export changes, flag corresponding JSDoc/README as stale (non-blocking, queued for session-end sync)
- [ ] Agent context auto-sync — when CLAUDE.md changes, `rules-summary.md` and `.claude/agent-context/` regenerate automatically so agents always have accurate context
- [ ] Architectural decision propagation — when Archon logs a Decision Log entry, relevant decisions surface to CLAUDE.md and org docs automatically
- [ ] `harness.json` doc config:
  ```json
  "docs": {
    "auto": true,
    "audiences": ["user", "org", "public", "agents"],
    "exclude": ["src/internal/**"]
  }
  ```
  `auto: false` opts out entirely. Individual audiences can be removed. Specific paths can be excluded.
- [ ] `/doc-gen` becomes the override — for non-obvious formatting, custom structure, or manual control

**Unlocks:** Docs are never stale. Agents always have accurate context. Org knowledge compounds automatically. No one has to think about documentation unless they want something specific.

---

### Tier 8 — Platform Features (new Anthropic capabilities to wire in)
- [ ] Implement `/schedule` skill — currently empty directory; use CronCreate/RemoteTrigger for local scheduling, document cloud path
- [ ] GitHub Actions workflow template (`.github/workflows/claude-triage.yml`) → add to `_templates/`
- [ ] `REVIEW.md` template → add to `_templates/`, reference from `/triage` and `/review`
- [ ] `.mcp.json` scaffolding in `/setup` with commented stubs + version-pinned security pins
- [ ] `/install-github-app` reference added to `/setup` optional steps
- [ ] Claude Agent SDK rename documented in CLAUDE.md and `/create-skill`

---

### Tier 9 — Merge Arbitration (fleet completeness)
- [ ] Formal merge review phase at fleet completion
- [ ] `WorktreeRemove` hook triggers pre-merge conflict check
- [ ] `citadel:merge-review` — reads all worktree diffs, identifies overlapping changes, proposes resolution order
- [ ] Fleet session file records merge decisions in Decision Log

**Unlocks:** Fleet campaigns on codebases with shared files (currently risky).

---

## Measurement Criteria

Before marking any tier complete, these must be true:

**Tier 1:** All 6 hook events fire and write to telemetry. Agent definitions include `disallowedTools`/`maxTurns`. State files survive a plugin update.

**Tier 2:** A campaign that attempts to edit a file outside its declared scope is blocked. Every agent action is recorded in audit.jsonl. A policy violation produces a clear error message.

**Tier 3:** `/do status` shows active campaign phase, last 5 events, and estimated token spend without reading campaign files manually.

**Tier 4:** A campaign that fails Phase 3 can be restored to the state before Phase 3 started in one command.

**Tier 5:** After a completed campaign + postmortem, at least one new quality rule is automatically added to harness.json.

**Tier 6 (Docs):** A session that builds something new ends with CLAUDE.md updated, `rules-summary.md` regenerated, and any changed public functions having current JSDoc — without the user running any doc command. A user who adds `"auto": false` to harness.json docs config gets zero automatic doc changes.

**Tier 7 (PreCompact):** A session that produces significant research or decisions and then hits compaction auto-saves a handoff document to `.planning/` before context is lost. A user with `handoffMode: "prompt"` sees a confirmation before anything is written.

**Tier 8:** A new project running `/setup` gets `.mcp.json`, `REVIEW.md`, and the GitHub Actions template scaffolded automatically.

**Tier 9:** A fleet campaign that has two agents both modifying `package.json` produces a merge conflict report rather than silently overwriting.

---

## Research References

- Scout reports: `.planning/research/fleet-anthropic-features-2026/scout-{1-5}-*.md`
- Unified fleet report: `.planning/research/fleet-anthropic-features-2026/REPORT.md`
- Codebase audit: `.planning/research/fleet-anthropic-features-2026/codebase-audit.md`
