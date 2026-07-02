Create a one-page HTML cheat sheet, styled as a dark code-editor mockup
(VS Code dark theme, monospace fonts, color-coded sections), titled
"Agentic Dev Workflow: Orchestrate → Discover + Deliver".

NO SIDEBAR. Full-width layout only.

LAYOUT (top to bottom, full-width):

1. IDE TOP BAR
   - macOS traffic-light dots (left)
   - File tabs: README.md · CLAUDE.md · .ai/ts-deliver-router/state.json · .ai/iteration.json
   - Right side: [WORKFLOW STATE] chip (phase + active_epic) · DIAL badge (HIGH/MID/LOW)

2. ORCHESTRATE BAND — ts-orchestrate (full width, ~110px tall)
   Title: "ts-orchestrate — Dual-Track Orchestrator"
   Three columns inside:
     Col A — Commands (session entry point):
       /ts-orchestrate:start WORK_TYPE=EPIC|REFACTOR|BUGFIX AUTONOMY=HIGH|MID|LOW
         → writes active_epic + dial to iteration.json, initializes state.json, routes spine
       /ts-orchestrate:status → unified view: Discovery WIP + Delivery phase + pending gates
       /ts-orchestrate:next   → enforced phase advance with gate checks (refuses if gate unsigned)
     Col B — Dual-Track Orchestration Flow:
       Layer D  (Discovery)   /ts-discover:idea → explore → validate → decide
       Layer 0  (Backlog)     /ts-project:plan --sync  →  release map
       Layer 1  (Sequencing)  /ts-iteration:start → next → /ts-deliver:init → close
       Layer 2  (Delivery)    spine by WORK_TYPE:
         BUGFIX   → Think → Build → Ship                           (no gates)
         REFACTOR → Think → Plan → Build → Review → Ship → Reflect (G1)
         EPIC     → Think → Plan → Build → Review → Test → Ship → Reflect (G1+G2)
     Col C — Gate Rules + Hard Rules:
       G1 threat-model: blocks Think→Plan for REFACTOR + EPIC. NEVER auto-signed.
       G2 sec-review:   blocks Ship for EPIC only. NEVER auto-signed.
       [BLOCKED] if no active_epic in iteration.json → run /ts-project:plan --new
       Feedback loop: Reflect done → discovery.json ← source_epic → /ts-iteration:next

3. SECOND LEVEL — two panels side by side (fills remaining height above bottom strip)

   LEFT PANEL — ts-project-planner (Discovery Track)
   Header: "ts-project-planner — Discovery Track"
   Accent color: purple (#bc8cff)

   Show 3 stacked layers:

   Layer D — Discovery (idea→explore→validate→decide loop)
     Commands:
       /ts-discover:idea     → capture raw idea into discovery.json
       /ts-discover:explore  → research + assumption mapping
       /ts-discover:validate → test riskiest assumption
       /ts-discover:decide   → Ready-for-Delivery or kill
       /ts-discover:status   → kanban view of all ideas
     Rule: both tracks run in parallel — Discovery for next release
           while Delivery ships current one

   Layer 0 — Backlog (sync ready items to release map)
     Commands:
       /ts-project:plan --sync → sync Ready-for-Delivery buffer → release map
       /ts-project:plan --new  → create new project (first use)

   Layer 1 — Delivery Sequencing (drives ts-deliver-router per epic)
     Commands:
       /ts-iteration:start → open new iteration, pick epics
       /ts-iteration:next  → advance to next epic, call /ts-deliver:init
       /ts-iteration:close → close iteration after last epic

   Workflow Routing Table (compact, 5 rows):
     New idea              → /ts-discover:idea
     Small idea in disc.   → /ts-discover:decide build → /ts-iteration:next → /ts-deliver:init --scope lean
     Med/Large idea        → explore → validate → decide → /ts-project:plan --sync → /ts-iteration:start
     Active epic           → /ts-deliver:status → follow phase spine
     Epic complete         → /ts-iteration:next (or :close) → /ts-discover:status

   RIGHT PANEL — ts-deliver-router (Delivery Track)
   Header: "ts-deliver-router — Delivery Track"
   Accent color: blue (#79c0ff)

   Epic-type spine reminder (compact banner inside panel):
     bugfix → Think·Build·Ship | refactor → +Plan·Review·Reflect | epic → all 7

   7 compact phase cards in a 2-column grid (4 rows: Think/Plan, Build/Review, Test/Ship, Reflect full-width):

   Each card: phase number + icon + name (colored) | 1-line purpose |
              primitive tags | 2-line command snippet

   Think   §1 🔍  Frame + threat-model. Tags: DIAL, G1, WORKFLOW STATE, lean-path
     /ts-orchestrate:start reads [WORKFLOW STATE]
     spectra:discuss optional · G1 checklist → human sign-off

   Plan    §2 📐  Spec + G/W/T scenarios. Tags: Spectra BDD, CHECKS REGISTRY, G1-exit
     spectra:propose · gstack:/plan-eng-review
     exit gate: design-review  (skipped on bugfix)

   Build   §3 ⚙   TDD + incremental review. Tags: DRY-RUN, spectra:apply, state.json
     dry-run off · spectra:apply · TDD loop
     spec drift → spectra:ingest → Plan delta

   Review  §4 🔎  Staff-engineer bug pass. Tags: CHECKS REGISTRY, spectra:ingest
     gstack:/review staff-engineer pass
     report → .ai/review/report.md  (skipped on bugfix)

   Test    §5 🧪  Run G/W/T acceptance tests. Tags: Spectra BDD, state.json
     run G/W/T from Plan scenarios
     pass/fail → state.artifacts.test  (epic type only)

   Ship    §6 ▶   G2 gate + archive + release notes. Tags: DRY-RUN, G2 sec-review, spectra:archive
     /ts-deliver:status → G2 checklist
     spectra:archive · human sign-off NEVER auto

   Reflect §7 ↺   Retro + harvest + close iteration. Tags: CHECKS REGISTRY, discovery.json
     gstack:/retro · harvest-skill → registry-reflect.md
     /ts-iteration:next (or :close) · → discovery.json

4. BOTTOM STRIP — "Workflow Habits" (8 habits, 4 per row, 2 rows)
   - [WORKFLOW STATE] hook auto-injects phase + active_epic — read first every session
   - Never /ts-deliver:init without active_epic in iteration.json
   - /ts-orchestrate:start determines epic.type → correct phase spine
   - Both tracks run in parallel: Discovery (next release) + Delivery (current)
   - state.json is slim (no history) — phase exits append to history.jsonl atomically
   - Keep CHECKS REGISTRY (registry/registry-<phase>.md) current — 1 row per new check
   - G1 blocks Think→Plan (refactor+epic) · G2 blocks Ship (epic only) — ALWAYS human sign-off
   - REFLECT: retro + harvest skill + /ts-iteration:next or :close + feedback → discovery.json

STYLE:
- Background: #0d1117
- ts-orchestrate band: #1c2128 background, gold/amber accent (#e3b341)
- Discovery panel (left): dark background, purple accent (#bc8cff)
- Delivery panel (right): dark background, blue accent (#79c0ff)
- Phase card accent colors (left border): Think=#79c0ff Plan=#d2a8ff Build=#56d364
  Review=#ffa657 Test=#e3b341 Ship=#f78166 Reflect=#39c5cf
- Monospace font (JetBrains Mono) throughout
- Primitive tags: colored chips per type (DIAL=amber, CHECKS REGISTRY=blue,
  DRY-RUN=purple, Spectra BDD=green, G1=amber, G2=coral, WORKFLOW STATE=teal)
- No placeholder text — use real terminology above
- Panels split approximately 40% discovery / 60% delivery
- All content must fit one screen without scrolling
