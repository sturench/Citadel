# Citadel Demo Site Facelift — Full Plan

## Overview

**One file.** The entire site lives in `docs/index.html` (1,970 lines, single HTML file with embedded CSS and JS). No build step, no framework, no dependencies. Every change in this plan is a direct edit to that file.

**Core structural shift:** Move the interactive routing demo to the hero. Let the visitor *experience* the concept before reading about it. Then build the narrative from problem → concept → proof → mechanism.

---

## File Map

```
docs/
└── index.html       ← everything lives here (HTML + CSS + JS, ~1,970 lines)
    FACELIFT_PLAN.md ← this document
```

No new files needed. No build config. Push to main, GitHub Pages deploys automatically.

---

## Page Architecture (Before → After)

### Before (current flow)
```
[Nav]
[Hero: headline + 4 static tier summary cards]
[Search input + generator buttons]
[Stats row: 33 skills, 4 agents, 14 hooks, ~0 config]
[2×2 How-it-works card grid]
[Footer]
[Side panels: Install, Skills, Hooks, Campaigns — hidden in nav]
```

### After (new flow)
```
[Nav]                                           ← minor revisions
[Hero: problem statement + demo is the hero]    ← fully restructured
[Screen 2: Why → Cascade → Install → Footer]    ← fully restructured
[Side panels: Install, Skills, Hooks, Campaigns]← content unchanged, CTAs improved
```

---

## Section-by-Section Plan

---

### 1. Navigation Bar

**Current:** Logo, nav links (Install, Skills, Hooks, Campaigns), v2.1 badge, Star button.

**Changes:**
- Add live GitHub star count fetched from `https://api.github.com/repos/SethGammon/Citadel` on page load (renders `★ 123` instead of just `★ Star`). Cache in sessionStorage to avoid refetch on reload. Show skeleton on load.
- Remove "Install" from the nav — install becomes an inline section on the page. Keep Skills, Hooks, Campaigns as panel triggers.
- Add a direct "Get Started" CTA button on the right side of the nav (secondary style, links to inline install section via smooth scroll).

**Interactions:** All existing panel open/close behavior unchanged.

---

### 2. Hero Section — Full Restructure

**Current:** Eyebrow text → big headline → description paragraph → 4 static tier cards. The demo lives *below* these cards.

**New Hero structure (single viewport, above the fold):**

```
[eyebrow]           "The routing layer for Claude Code"
[problem headline]  Two lines, large — establishes the BEFORE state
[subhead]           One sentence solution — the AFTER state
[demo bar]          Immediately below — the proof
```

#### 2a. Eyebrow
- Remove the current lightning bolt + "Interactive Demo · /do Intent Router"
- New: `"Agent orchestration for Claude Code"` — tells visitors the product category immediately

#### 2b. Problem Headline (replaces current headline)
Current: `"Say what you want. / Citadel routes it."`

New (two-line, large):
```
Every command costs the same.
Most of them shouldn't.
```
Typographically: first line in dim/muted white, second line in full white. The tension is *waste*, not difficulty — framing it as difficulty would insult developers who've figured out Claude Code. Waste is a problem every user feels without necessarily naming it.

#### 2c. Solution Subhead
Single sentence, directly below the headline:
```
Type what you want. Citadel finds the cheapest way to do it.
```
No taxonomy, no mechanism. The demo teaches the mechanism — the subhead just names the value. "Cheapest" does double duty: cost (tokens) and speed (ms).

#### 2d. Demo Bar — Moved to Hero
The search input becomes the visual center of the hero. Layout:

```
[  /do ______________________________ ] [→]
   ↑ generator buttons below
   [⚡ Instant] [◆ Skill] [⬡ Campaign] [⬢ Fleet]
```

- Generator buttons sit directly under the input, labeled with tier name only (no cost metadata yet — that's for after they route something). The buttons carry the variety — they're already labeled Instant / Skill / Campaign / Fleet and each produces different examples on click.
- Input placeholder is **static**: `"Type any engineering task..."` — no cycling. Cycling placeholder text performs while the visitor is trying to decide whether to click, creates urgency where there shouldn't be any, and disappears mid-read. Let the input feel *waiting*, not performing.
- Live badge (`→ /skill-name`) appears inside the input on the right as you type

#### 2e. Result Panel — Same Position, Improved Visual Weight
The result panel that appears after routing stays in place but gets visual hierarchy improvements:
- The matched tier row gets a brighter, more distinct active state (currently too subtle — all rows are similar dark)
- The LLM classification radar gets a thin border box to make it feel like a distinct visualization, not floating text
- The output card (showing tool name/description) gets a left-border accent matching the tier color — currently it's too flat

**What's removed from the hero:**
- The 4 static tier summary cards (Instant, Skill, Campaign, Fleet with cost/latency metadata) — these move into Screen 2 as part of the cascade explanation
- The "How It Works" eyebrow section that duplicated the cards
- The paragraph description of the router ("Type any engineering task...") — replaced by the tighter subhead above

---

### 3. Screen 2 — Full Restructure

**Current Screen 2:** Stats bar → 2×2 how-it-works grid → footer.

**New Screen 2 (top to bottom):**
```
[Vertical tier cascade]          ← replaces 2×2 grid — leads immediately
[Campaign / depth section]       ← new — the "real product story"
[Stats with context]             ← reframed, same data
[Inline install section]         ← moved from hidden modal
[Footer]
```

The problem elaboration strip from the earlier draft is cut. By the time a visitor reaches Screen 2 they've used the demo — they don't need to be re-sold on the problem. They need to understand the mechanism they just experienced. The cascade leads directly.

#### 3a. Vertical Tier Cascade (replaces 2×2 grid)
The single most important structural change. The 4 tiers are currently in a 2×2 grid — visually implying equivalence. They evaluate *in sequence*. The layout must reflect that.

**Layout:** Single column, stacked vertically, each tier connected to the next by a vertical line with a downward-pointing chevron. The vertical connector is thin (1px), the same color as the tier below it.

**Each tier card:**
```
[tier number badge] [tier name]                    [cost]  [latency]
[one-sentence description]
[visual: pattern/table/radar/parallel — same as current how-cards]
[example commands: 2-3 clickable pills]
                            ↓
[next tier — greyed/dimmed header showing "if no match, falls through"]
```

The "falls through" connector text reads: `"No match · evaluates next tier →"` in dim text between each card. This explicitly teaches the cascade logic that the current 2×2 grid hides.

**Tier 0 — Pattern Match (green)**
- Badge: `0`
- Name: "Pattern Match"
- Cost: `~0 tokens`
- Latency: `<1ms`
- Description: "Regex against 9 built-in patterns — commit, rename, build, status, continue."
- Visual: Same regex pattern animation (already built, unchanged)
- Examples: `fix the typo on line 42`, `commit my changes`, `run the tests`

**Tier 2 — Keyword Lookup (cyan)**
- Badge: `2`
- Name: "Keyword Lookup"
- Cost: `~0 tokens`
- Latency: `<10ms`
- Description: "12 registered skill keywords — /review, /test-gen, /refactor, /triage, and 8 more."
- Visual: Same skill table animation (already built, unchanged)
- Examples: `review the auth module`, `write tests for UserService`, `debug the login failure`

**Tier 3 — LLM Classifier (orange/purple — single card, forked output)**
- Badge: `3`
- Name: "LLM Classifier"
- Cost: `~500 tokens`
- Latency: `<2s`
- Description: "Classifies scope, complexity, and persistence. One evaluation, two possible dispatches."
- Visual: Same 6-dimension classification visualization (already built, unchanged)
- Fork visualization: Below the classification radar, a single vertical line splits into a Y, and each branch terminates in a **compact output block** — not a full card, just a destination label with enough context to distinguish the two:
  - Left branch (orange): `→ Archon` / "Single-feature, single-session work" — left border 3px orange, background `#1c2128`
  - Right branch (purple): `→ Fleet` / "Platform-wide or parallel work" — left border 3px purple, background `#1c2128`
  - Each output block: `width: calc(50% - 8px)`, displayed side by side with 16px gap, same height, padding 12px
  - The Y fork line: 1px, color transitions from orange/purple gradient at the branch point (subtle, not loud)
- **Mobile fork (inside `<details>` expand):** The Y shape is replaced by two output blocks stacked vertically with a centered `or` text divider between them (dim color, 11px). A Y fork at 360px is cramped and the spatial metaphor doesn't survive the narrowing. Stack communicates "two options" just as clearly.
- Examples: `build me a recipe app` (routes Archon), `migrate the platform to TypeScript strict` (routes Fleet)

**Note on Tier 3 as one card, not two:** Tier 3 is *one* LLM evaluation that produces two possible outputs. Showing it as 3a/3b would imply sequential evaluation. It's a fork, not a sequence — show it as one card with a branch.

**Note on numbering:** Tier 1 is intentionally absent — it's the "Active Context" tier that the router skips in the demo. A small footnote under Tier 0's card: `"Tier 1 (active session context) is evaluated in live Claude Code sessions — skipped in this demo."` This acknowledges the gap without confusing the cascade.

#### 3b. Campaign Depth Section (new)
This section doesn't exist currently. It's the product story hidden in the Campaigns modal.

**Layout:** Full-width section with a dark surface background (slightly lighter than page bg), 3 feature points in a horizontal row on desktop, stacked vertically on mobile (full stop — 2+1 layouts look like layout bugs at mid-breakpoints).

**Section headline:** `"Work that spans sessions. Automatically."`

**One-sentence setup below the headline** (frames this as a trust problem, not a feature list):
```
Complex tasks run across sessions without losing direction — or your confidence.
```
The three feature points below then become *how* it earns that trust rather than asserting it.

**Three feature points (icon + title + 1-sentence description each):**
1. **Phase checkpoints** — "Quality spot-checks run at the end of every phase before the next begins."
2. **Circuit breakers** — "After 3 consecutive failures, the campaign parks automatically and waits for human review."
3. **Regression guards** — "Type baselines and test counts are captured before the campaign and verified after."

**Below the three points:** A single CTA link: `"Read the full campaign lifecycle →"` — opens the Campaigns side panel. This is the first place in the primary scroll where the side panels get a clear, motivated CTA.

#### 3c. Stats Row (reframed)
**Current:** 4 columns — `33 Skills`, `4 Autonomous Agents`, `14 Hook Events`, `~0 Config Required`. Big number, small label. No context.

**New:** Same 4 columns, but each gets a one-line context caption below the label:

| Number | Label | Context caption |
|--------|-------|----------------|
| `33` | Skills | "covering code quality, debugging, research, orchestration, and more" |
| `4` | Orchestrators | "Marshal, Archon, Fleet, Autopilot" |
| `14` | Hook Events | "automatic quality gates without agent intervention" |
| `~0` | Config Required | "works on any repo, any language" |

**What changed and why:** "every /do route resolved in under 10ms" is a speed claim, not a description of what 33 skills *are* — speed is already established by the cascade. The caption should reinforce the number's meaning (breadth of coverage). Similarly, "pre, post, and error for every tool call" is mechanism; "automatic quality gates without agent intervention" is the benefit that makes a developer care.

The context captions are 11px, muted color, centered under the label. They turn numbers into claims.

#### 3d. Inline Install Section (moved from side panel)
Currently hidden behind the "Install" nav link. A developer who's convinced needs to see the install path *without* an extra click.

**Layout:** Full-width section, dark surface. Left column: headline + value reinforcement. Right column: the 3-step install.

**Left column:**
```
Try it now.

Works on any Claude Code project.
No config required — Citadel detects
your stack on first run.
```

**Right column (the 3 steps, verbatim from the modal):**
```bash
npm install -g @anthropic-ai/claude-code  # if not installed

claude mcp add citadel-harness --scope project

cd your-project && /do setup
```

Each step is a numbered code block. Monospace font, green syntax highlighting on the command. Below the steps: `"Full install guide →"` link that opens the Install side panel for the optional harness.json step.

#### 3e. Footer
**Current:** Architecture overview link, GitHub, MIT License.

**New:** Replace the separate "GitHub" link with a combined `★ 123 · Star on GitHub` — one element, one click target, carries both the count and the action. Add "Built with Claude Code" badge. Keep existing links. Light separator line above footer.

---

### 4. Typography System (site-wide)

**Current:** Essentially 3 levels — big cyan heading, medium white heading, small gray body. Not enough range.

**New: 5-level system** (no new fonts, just intentional sizing/weight/color usage):

| Level | Usage | Size | Weight | Color |
|-------|-------|------|--------|-------|
| Display | Problem headline | 64px / 48px mobile | 700 | `#e6edf3` (first line), `#ffffff` (second) |
| Heading | Section headings | 28px | 600 | `#e6edf3` |
| Label | Tier names, stat labels | 13px | 600 | `#e6edf3` uppercase, letter-spacing 0.08em |
| Body | Descriptions, captions | 15px | 400 | `#8b949e` |
| Micro | Context captions, footnotes | 11px | 400 | `#4a5568` |

**Monospace examples in tier cards:** The command pills need to *feel* different by complexity, but 12px vs 13px is invisible at monospace scale without a direct side-by-side comparison. Use color temperature instead: Tier 0/2 pills use `color: #8b949e` (muted gray), Tier 3 pills use `color: #c9d1d9` (closer to white). The card context — classification radar, fork visualization, "~500 tokens" label — already communicates "this is bigger." The command text just needs to feel slightly warmer, not larger.

---

### 5. Visual Hierarchy (site-wide)

**Current problem:** All cards sit at approximately the same luminance. The page reads as one dark slab.

**Changes:**

**Background layering (explicit z-axis):**
- Page background: `#0d1117` (unchanged)
- Section backgrounds (problem strip, campaign section, install): `#161b22` (one step lighter)
- Cards (tier cards): `#1c2128` (two steps lighter)
- Active/hover state on cards: `#21262d`

**Active tier states in the result panel:** Currently too subtle. When a tier matches:
- Background: tier color at 10% opacity (not 5%)
- Left border: 3px solid, tier color at full opacity (not 60%)
- Tier name text: full tier color (not muted)
- The "skip" animation on non-matching tiers: add a strikethrough-style text treatment (dim the row to 30% opacity) to make the "evaluated and skipped" state visually clear

**Card borders:** Increase default border opacity from `#30363d` (current) to `#3d444d`. 8% increase but meaningful at this luminance level.

---

### 6. Generator Buttons

**Current:** 4 buttons — icon + tier name + cost metadata + latency. Visually complex.

**New:** Simplified — icon + tier name only. Move cost/latency into a tooltip that appears on hover and also into the tier cards in Screen 2. Don't put specs on a button you haven't explained yet.

```
Before: [⚡ Instant (~0 tokens, <1ms)]
After:  [⚡ Instant]  ← hover shows tooltip: "~0 tokens · <1ms"
```

---

### 7. Particle Background

**Current:** Physics dot grid with mouse repulsion. Visually impressive but generic — it doesn't connect to any concept in the system.

**Change:** Keep the physics simulation but add a visual affordance that ties it to routing. When a command routes successfully:
1. A pulse wave originates from the search input (already have the click pulse mechanism)
2. The pulse color matches the matched tier (green for Tier 0, cyan for Tier 2, orange for Tier 3 Archon, purple for Tier 3 Fleet)
3. The wave radius: Tier 0 = 80px (tight, fast, cheap). Tier 3 = full viewport width (expensive, wide-reaching)

This turns the background animation from decoration into a data visualization. The "blast radius" of the wave teaches cost intuitively.

**Implementation:** The pulse system already exists (`addPulse(x, y, type)`). Add a `color` parameter and `radius` parameter. Map tier to color and max radius. Trigger on route completion instead of/in addition to click.

---

### 8. Side Panels (content changes only)

The panel infrastructure (slide-in, backdrop, Escape key) is unchanged.

**Skills panel:** Add a brief intro sentence before the skill list: `"33 skills. Type /do [anything] and the router finds the right one."` Then the existing categorized list, unchanged.

**Campaigns panel:** Restructure the content order to match the narrative arc: problem → solution → mechanism → guardrails. Currently it leads with mechanism. No content deletions, just reordering.

**Install panel:** Add the `harness.json` optional step that's currently missing from the basic install flow. The main 3-step install moves to the inline section; the panel becomes the "full guide" for advanced configuration.

**Hooks panel:** Unchanged.

---

## Interactions — Full Map

### Input / Routing
| Event | Trigger | Effect |
|-------|---------|--------|
| Keyup in input | Any character | Live badge updates with `→ /tool-name` |
| Enter key | Text present | Route sequence begins |
| Click generator button | Any tier button | Typing animation → auto-route |
| Click example pill (tier cards) | Any `.how-example` | Populate input → scroll to Screen 1 → auto-route |
| Click history pill | Any `.history-pill` | Re-route that command |
| ↑ / ↓ arrows | Input focused | Navigate command history |
| Escape | Input focused, text present | Clear input |
| Escape | Result panel showing | Reset to input state |

### Route Animation Sequence (unchanged timings)
1. Hero compresses (generators fold)
2. Result panel slides in
3. Tier 0 evaluates: 480ms — match (green checkmark) or skip (dim to 30% opacity)
4. Tier 1 evaluates: always skipped, 200ms flash
5. Tier 2 evaluates: 620ms — match or skip
6. Tier 3 evaluates: 800ms — match (show classification dims) or marshal fallback
7. Output card reveals with tier-colored left border
8. Pulse wave fires from input position, color and radius = matched tier
9. History pill added to history row

### Screen Navigation
| Event | Trigger | Effect |
|-------|---------|--------|
| Scroll down (40px accumulated) | Mouse wheel | Animate to Screen 2 (780ms easeInOutQuart) |
| Scroll up (40px accumulated) | Mouse wheel, on Screen 2 | Animate to Screen 1 |
| Swipe down (50px) | Touch | Same as scroll down |
| Click scroll cue (↓ arrow) | Button, Screen 1 | Animate to Screen 2 |
| Click up arrow | Button, Screen 2 | Animate to Screen 1 |
| Click "Get Started" nav link | Nav CTA | Bypass cinematic transition — single continuous smooth scroll through both screens to install section anchor |

### Side Panels
| Event | Trigger | Effect |
|-------|---------|--------|
| Click nav link (Skills/Hooks/Campaigns) | Nav | Open panel, lock body scroll |
| Click "Read the full campaign lifecycle →" | Campaign section | Open Campaigns panel |
| Click "Full install guide →" | Install section | Open Install panel |
| Click backdrop | Panel open | Close panel |
| Escape key | Panel open | Close panel |
| Click close button | Panel open | Close panel |

### Particle Background
| Event | Trigger | Effect |
|-------|---------|--------|
| Mouse move | Canvas area | Dots repel from cursor |
| Route completion | Any successful route | Tier-colored pulse from input position |
| Click (existing) | Canvas | Burst pulse (white, full radius) |
| Right-click (existing) | Canvas | Ripple effect |
| Tab hidden | visibilitychange | Pause RAF loop |
| Tab visible | visibilitychange | Resume RAF loop |

### Star Count
| Event | Trigger | Effect |
|-------|---------|--------|
| Page load | DOMContentLoaded | Fetch GitHub API, render count in nav + footer |
| Fetch fails | Network error | Show static "★ Star" fallback |
| sessionStorage hit | Second visit | Skip fetch, use cached count |

---

## What's Removed

| Element | Location | Why |
|---------|----------|-----|
| 4 static tier summary cards | Hero | Redundant with tier cascade in Screen 2 |
| "How It Works" heading in hero | Hero | Screen 2 carries this now |
| Router description paragraph | Hero | Replaced by tighter subhead |
| Cost/latency on generator buttons | Hero | Moved to hover tooltip + Screen 2 cards |
| "Install" in nav links | Nav | Moved to inline section + "Get Started" CTA |
| Generic particle pulse (white) on routing | Canvas | Replaced by tier-colored pulse |
| Problem elaboration strip | Screen 2 | Cut — demo is the bridge, re-stating the problem after the visitor has used it is throat-clearing |
| Placeholder cycling animation | Hero | Cut — input should feel waiting, not performing |

---

## What's Added

| Element | Location | Why |
|---------|----------|-----|
| Problem headline (2 lines, waste framing) | Hero | Establishes the before-state as waste, not difficulty |
| Live star count | Nav + Footer | Social proof from launch week |
| "Get Started" CTA button | Nav | Clear action for convinced visitors |
| Vertical cascade connector lines | Screen 2 | Teaches the sequential evaluation logic |
| "Falls through" connector text | Between tier cards | Explicit cascade language |
| Tier 3 fork visualization | Tier 3 card | One evaluation, two outputs — fork shows this clearly |
| Campaign depth section (3 features) | Screen 2 | Surfaces hidden modal content |
| Context captions under stats | Stats row | Turns numbers into claims |
| Inline install section | Screen 2 | Removes friction for convinced visitors |
| Tier-colored pulse on routing | Canvas | Turns decoration into data |
| Tier 1 footnote | Cascade section | Explains the gap without confusion |
| Hover tooltips on generator buttons | Hero | Defers spec info without losing it |

---

## Implementation Order

1. **CSS changes** — typography levels, background layering, border opacities, active tier states, prefers-reduced-motion block
2. **Hero restructure** — new eyebrow, new headline (waste framing), new subhead, static placeholder
3. **Generator button simplification** — strip labels, add hover tooltips
4a. **Vertical cascade** — replace 2×2 grid with single-column stack, connectors, "falls through" text, Tier 3 fork (Y line + compact output blocks, desktop); Tier 0 open by default
4b. **Campaign section** — new full-width section: headline, setup sentence, 3 feature points, CTA link to panel
4c. **Stats + install** — context captions on stats row; inline install section with left/right columns, anchor target for "Get Started" scroll
5. **"Get Started" scroll behavior** — bypass cinematic transition, implement single continuous smooth scroll to install anchor
6. **Tier-colored pulse** — extend existing `addPulse()` function with color + radius params, wire to route completion
7. **Star count fetch** — GitHub API fetch on DOMContentLoaded, sessionStorage cache, nav + footer render
8. **Nav changes** — remove Install link, add "Get Started" CTA
9. **Panel CTAs** — add campaign and install panel trigger links in their respective sections
10. **Mobile cascade** — `<details>`/`<summary>` accordion, Tier 3 fork to stacked "or" layout, desktop CSS override to force open
11. **Typography pass** — audit all text for correct level assignment

---

## What Doesn't Change

- Canvas physics simulation (particles, spring forces, mouse repulsion)
- All routing logic (TIER0/TIER2/TIER3 data, route() function)
- All example pools (Instant, Skill, Campaign, Fleet examples)
- Route animation timing (480ms, 200ms, 620ms, 800ms)
- Keyboard navigation (Enter, ↑↓, Escape)
- Side panel infrastructure (slide-in, backdrop, body scroll lock)
- Side panel content (Skills list, Hooks table) — except Campaigns reordering and Install additions
- Mobile breakpoint (760px) — same breakpoint, updated layouts
- Color variables — same cyan/green/orange/purple palette
- The LLM classification radar visualization
- Cinematic scroll (two-screen layout, wheel + touch + button triggers)
- History pills
- `.nojekyll` / GitHub Pages deployment

---

## Resolved Decisions

All open questions from the initial draft are resolved:

1. **Placeholder cycling** — removed entirely. Static placeholder: `"Type any engineering task..."`. Variety lives in the generator buttons.
2. **Star count in footer** — combined: `★ 123 · Star on GitHub`. One element, one click target.
3. **Campaign section mobile** — stack vertically, full stop. No 2+1 — it breaks between 400-760px.
4. **Problem headline** — waste framing: `"Every command costs the same. / Most of them shouldn't."` Difficulty framing was a bad position for a tool built on Claude Code.
5. **Tier 3** — one card with a fork, not two entries (3a, 3b). One evaluation produces two outputs. Sequential entries would break the cascade mental model.

---

## Mobile Cascade (below 760px)

The vertical cascade is 4 full cards stacked with connectors — on mobile this is very long and most of it is non-critical detail. Use a **summary-first, expand-on-tap** pattern:

**Default state:** Tier 0 starts with the `open` attribute — it renders fully expanded. Tiers 2 and 3 start collapsed. This ensures the visitor immediately sees content (not three blank rows that read as a table of contents), and the open tier demonstrates the expand pattern without instruction.

```
[0] Pattern Match      ~0 tokens · <1ms      [−]  ← open by default, full card visible
     [regex visualization + example pills]
     ↓ No match · evaluates next tier
[2] Keyword Lookup     ~0 tokens · <10ms     [+]  ← collapsed
[3] LLM Classifier     ~500 tokens · <2s     [+]  ← collapsed
```

**Expanded state:** Tapping a collapsed row expands it to show the full card — description, visual, example pills — and changes `[+]` to `[−]`. Accordion behavior (one open at a time). The Tier 3 fork renders as stacked output blocks with "or" divider inside the expanded card.

**Implementation:** Pure CSS using `<details>`/`<summary>` HTML elements — expand/collapse for free, no JS. Style the `<summary>` to match the collapsed row design. The existing `.how-card` content becomes the `<details>` body. On desktop (>760px), all `<details>` have the `open` attribute forced via CSS (`details { display: block; } details > *:not(summary) { display: block !important; }`) so the accordion behavior is mobile-only.

---

## Loading State (Pre-JS)

The page currently has no explicit pre-JS state — it either flashes unstyled or loads fine depending on JS parse time. Specify:

**HTML structure:** The hero input, headline, and generator buttons must be visible immediately from the HTML/CSS without JS. No elements should start in a JS-set display:none state that can't be undone by CSS.

**Canvas:** The particle canvas should initialize with a `visibility: hidden` state in CSS, revealed by JS once the simulation is ready. This prevents a white/blank canvas flash.

**Result panel:** Starts `display: none` in CSS. JS adds `.visible` class to show it. No flash risk.

**Star count:** Nav button starts as `★ Star` (text node). JS replaces the text after fetch resolves. No layout shift because character count is similar.

**Generator buttons:** Fully functional from static HTML/CSS. Clicking before JS loads does nothing (no handler attached yet), but they don't break.

**Critical:** The background color of `#0d1117` must be set on `<html>` or `<body>` in CSS, not via JS. If it's set via JS there will be a white flash on load. Verify this is already the case before starting implementation.

---

## Accessibility: `prefers-reduced-motion`

Add a single `@media (prefers-reduced-motion: reduce)` block to the embedded CSS. This is one paragraph of CSS, meaningful accessibility coverage:

```css
@media (prefers-reduced-motion: reduce) {
  /* Cascade animations — snap to end state */
  .tier-row, .output-card, .result-panel { transition: none !important; }

  /* Scroll cue animation */
  .scroll-cue { animation: none !important; }

  /* Screen transition — instant instead of 780ms ease */
  /* JS check: if matchMedia('prefers-reduced-motion').matches, set transition duration to 0 */

  /* Canvas — disable particle physics loop */
  /* JS check: if reduced motion, skip requestAnimationFrame entirely, draw static dot grid */

  /* Tier-colored pulse — skip entirely */
  /* JS check: if reduced motion, don't call addPulse() on route completion */

  /* Panel slide-in — instant */
  .panel { transition: none !important; }
}
```

The CSS `!important` overrides cover transition-based animations. The canvas RAF loop, screen transition timing, and pulse system require JS checks (noted inline above). Add three `const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches` checks at the top of the relevant JS blocks.
