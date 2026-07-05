# Ideas — Agentic Dev Workflow Hub (Consolidated Design Record)

This is the single design record for the **ts- skill family**: `ts-deliver-router`,
`ts-project-planner`, `ts-orchestrate`, and `ts-acpl`. It supersedes the original `Ideas.md`,
the `DISCUSSION_code_graph_registry.md` design session, and all interim
rename/change PRDs — those reasoning trails are folded in here. The goal is to
preserve *why* the design looks the way it does, not just the artifacts
(`SKILL.md` / `SKILL_caveman.md` / `README.md` / reference files per skill).

---

## 1. Goal & Constraints

Build a set of workflows to develop **and** manage software products with
agentic coding agents (Claude Code, Copilot, Gemini), at any scale — from a
single bugfix to a giant greenfield project (e.g. a new ERP).

Constraints that shaped every decision below:
- Operator is **not** a craft agentic-coding dev — the flow must *guide*, not
  just execute.
- Must deliver: speed, quality, consistency across a team, onboarding,
  governance.
- Full lifecycle including **idea discovery** — flexible start point, not just
  "code exists, now manage it."
- **Claude Code primary** (agentic hub); Copilot/Gemini alongside as
  cheap muscle.
- Any software domain. Personal → maybe team. Mixed-skill, mid-level
  engineers. Both **single-change** and **portfolio** scope.

---

## 2. The Spine Decision — gstack over Spectra/superpowers

Three candidate "process spines" existed: **Spectra** (5-phase BDD:
discuss→propose→apply→ingest→archive), **superpowers** (TDD-first dev
methodology), and **gstack** (7-phase: Think→Plan→Build→Review→Test→Ship→
Reflect).

**Key tension:** all three are competing end-to-end methodologies. Running
more than one as a spine creates two sources of truth for "what phase are we
in."

**Decision: one spine, many organs.** gstack's 7 phases became the fixed
spine. Spectra's BDD discipline (`discuss`/`propose`/`apply`/`ingest`/
`archive`) nests *inside* specific gstack phases rather than running as a
parallel spine. superpowers and mattpocock/addyosmani libraries are harvested
for specific skills only (TDD, TS tooling, frontend patterns) — never as a
second spine.

**Why gstack won:** Spectra's 5-phase model has no native Ship/Reflect —
exactly where governance, release, and learning live. gstack closes that loop.
Spectra still defines the *artifacts* (spec + Given/When/Then scenarios);
gstack defines the *rhythm*. The Spectra→gstack mapping:

| gstack phase | Spectra skill |
|---|---|
| Think | `discuss` |
| Plan | `propose` (spec + scenarios) |
| Build | `apply` |
| (cross-cutting) | `ingest` (sub-loop, not a phase) |
| Ship | `archive` |
| Review / Test / Reflect | gstack-native (no Spectra equivalent) |

`ingest` works better as a triggerable sub-loop than a phase — spec changes
happen when Build/Review/Test surfaces a gap, not on a schedule. The sub-loop
is: write delta → re-check scope (council-advisor) → resume the triggering
phase.

---

## 3. The Hardening Pass — State as Truth, Named Gates, DRY-RUN

Three primitives emerged from a hardening pass whose prime directive was "add
rigour, never add scope":

**State as truth, inference deprecated.** Phase detection moved from
inferred-from-artifacts to a persisted `state.json`, written by each phase on
exit (atomic write tmp+rename). The router reads it on every invoke; if
missing, stale (any declared artifact's mtime > state.json mtime), or invalid
→ "phase unclear, manual review" + specific reason, STOP. This eliminated the
original bug class: a half-written spec (3/5 scenarios missing `Then`) used to
look complete enough to advance to Build.

**Slim state.json + history.jsonl split (shipped 2026-06-28).** `state.json`
was growing unbounded as `phase_history` and `ingest_log` arrays accumulated
across a long epic — every router invocation loaded the full file. **Decision:
slim the live file, append-only the audit trail.** `state.json` now contains
only `schema_version`, `current_phase`, `phase_entered_at`, `artifacts`, and
`gates` — constant size regardless of how many phases have passed. Each phase
exit appends one JSON event to `history.jsonl` (`event`, `ts`, `from`, `to`,
`artifacts_at_exit`). The router reads `state.json` on every turn; it reads
`history.jsonl` only on `/ts-deliver:status --history`. DRY-RUN announces
`[DRY-RUN] would append history.jsonl` without writing. History append failure
is non-blocking — phase exit completes with a warning.

**Two named security gates, not "lean on critical-thinker."** G1
(threat-model, end of Think) and G2 (sec-review, start of Ship) became
explicit, recorded checklists writing to `state.gates[id].checklist_results`.
Both block at every autonomy level. **HIGH never auto-signs.**

**DIAL primitive (autonomy).** HIGH (auto) / MID (recommend, default) / LOW
(suggest-only). Security gates always pause for human regardless of DIAL.

**CHECKS REGISTRY primitive.** Every TDD/code-review/QA/security activity is a
*check* — `always` (continuous, non-blocking), `gate` (blocks phase exit), or
`rec` (surfaced, skippable) — attached to a phase via the registry. Adding an
activity = append one row; the spine and router never change. The two security
gates are simply the first and near-last `gate` rows.

**DRY-RUN primitive.** Session-scoped, defaults OFF, **not persisted** — a
sticky dry-run flag is a foot-gun (you think you're simulating, but you're
shipping, or the reverse). Orthogonal to DIAL — `HIGH + dry-run` is the
canonical pre-flight. Cannot sign security gates (structurally refused, even a
"simulated sign" was rejected as defeating the gate's purpose) and cannot
bypass minimum-schema verification.

**PROJECT REGISTRY primitive** (added later, alongside the rename below):
DIAL and CHECKS REGISTRY described *templates*; PROJECT REGISTRY is the
per-project *live* collection — initialized via `/ts-deliver:init`, refined at
every Reflect via `/ts-deliver:refine`, with an append-only `registry.log`
audit trail.

---

## 4. SKILL.md / SKILL_caveman.md Split

Two content-equivalent files ship per skill: `SKILL.md` (prose, canonical,
for onboarding/review/debugging) and `SKILL_caveman.md` (token-optimized,
~35-45% of the prose word count — same primitives, algorithm, checklists, edge
tests, only prose density differs). Every change to one propagates to the
other in the same session; a spec that differs between "readable" and
"deployed" is no spec at all.

---

## 5. The ts- Family — Why a Prefix, Why Four Skills

Once a second skill (`ts-project-planner`) and a third (`ts-acpl`) existed
alongside the router, a namespace became necessary — a single skill doesn't
need a prefix; a *family* does. All skill names, sub-agent names, commands,
and skill-private workspace directories took the `ts-` prefix:

| Role | Skill |
|---|---|
| **Dual-track orchestrator** (session entry point; sees both Discovery + Delivery) | **`ts-orchestrate`** |
| Discovery track planner (Layer D/0/1 internals) | **`ts-project-planner`** |
| Delivery track engine (per-epic 7-phase spine) | **`ts-deliver-router`** (originally `lifecycle-router`) |
| Build-phase coding discipline | **`ts-acpl`** (AI Coding Pattern Language) |

`ts-orchestrate` sits above both tracks. It is the canonical session entry point (`/ts-orchestrate:start`),
the unified status hub that combines Discovery + Delivery state (`/ts-orchestrate:status`),
and the gate-enforcing phase advancer (`/ts-orchestrate:next`). The earlier description of
`ts-project-planner` as "dual-track agile orchestrator" referred to its internal Discovery
track layering — it is not the top-level orchestrator; `ts-orchestrate` is.

The shared workspace root `.agents/` and generic shared artifacts (`domain.json`,
`iteration.json`, `risks.md`, `discovery.json`, `decisions/`, `WORKSPACE.md`)
deliberately stayed **unprefixed** — they're conventions any future skill
might use, not identifiers of one skill. Only skill-private directories
(`.agents/ts-deliver-router/`, `.agents/ts-project-planner/`) and the skill/command/
sub-agent identifiers themselves carry the prefix.

`ts-deliver-router`'s commands use the `/ts-deliver:*` colon syntax
(`/ts-deliver:init`, `/ts-deliver:refine`, `/ts-deliver:status`, `/ts-deliver:jump`).
An earlier decision preserved "router" in the command names (`/ts-router *`);
that was subsequently reversed — the commands now match the skill's
`ts-deliver-` prefix. The rename's deeper purpose is unchanged: "deliver"
positions this skill as the **Delivery**-track engine, the counterpart to
`ts-project-planner`'s **Discovery** track (`/ts-discover *`) — see §6.

---

## 6. Dual-Track Agile — Discovery (Layer D) + Delivery (Layers 0-2)

`ts-project-planner` originally had two layers: Layer 0 (decompose vision →
epic backlog) and Layer 1 (sequence epics → call `ts-deliver-router`). Both
assumed the epic backlog was *already known and validated* at planning time —
true for small projects, false for a giant greenfield one. For a new ERP, you
don't know upfront whether "Manufacturing module" is one epic, three, or
deferred two iterations; that's exactly what **Product Discovery** (dual-track
agile, per Aktia) determines.

**Layer D — Discovery** (new). `/ts-discover idea → explore → validate →
decide [build|kill|keep-learning|reduce-scope]`. Produces a Ready-for-Delivery
buffer: `.agents/discovery.json`, entries with `status=ready`.

**Layer 0 — Backlog** (role clarified). `/ts-project plan --new` now seeds
Discovery with *candidate ideas*, not epics. `/ts-project plan --sync` pulls
`status=ready` items into `plan.json` as epics, grouped into releases.

**Layer 1 — Delivery** (unchanged behavior). `/ts-iteration start/next/close`
— sequences epics, calls `ts-deliver-router` per epic.

**Layer 2 — `ts-deliver-router`** (unchanged spine). Per-epic 7-phase engine.

### Why a buffer, not direct writes to plan.json?

Discovery work is non-linear and reversible — ideas get killed, reduced in
scope, or sent back to `keep-learning`. If Discovery wrote straight to
`plan.json`, every false start would pollute the delivery backlog. The buffer
isolates that churn; only `status=ready` items cross the boundary, via
`--sync`.

### The Discovery state machine

```
idea ──explore──> exploring ──validate──> validating
                       │                       │
                       │ (skip if no H-risk)   ├──build────> ready
                       └──────build────────────┘
                                               ├──kill─────> killed (+ADR)
                                               ├──keep-learning──> exploring
                                               │   (keep_learning_count++)
                                               └──reduce-scope──> split into
                                                                   new ideas
```

- **`validate` is optional** unless `riskiest_assumptions` contains an
  H-risk item — Aktia explicitly allows low-uncertainty items to skip
  discovery rigor.
- **WIP limit = 3** (exploring+validating combined) — enough to avoid idle
  time on one slow validation, not so many nothing finishes.
- **Stale rule** — `keep_learning_count >= 3` flags an idea for a forced
  decision (advisory, not blocking).
- **No entry is ever deleted** — `killed` and `reduce-scope` are terminal but
  remain for audit.

### Two tracks, continuous and parallel

Both tracks run **continuously, at different cadences** — not sequential
phases. While Release N is in Delivery, Release N+1's modules are in
Discovery. `/ts-iteration close` explicitly prompts: "Discovery has been
running in parallel — check `/ts-discover status` for the next release's ready
items."

---

## 7. The Discovery Feedback Hook — Closing the Loop

Discovery feeds Delivery (via `--sync`). The missing half was Delivery feeding
*back* to Discovery when it surfaces a new unknown — the other direction of
the dual-track loop.

**`/ts-discover idea --from-router`** — called by `ts-deliver-router`'s Think
or Build phase when an unresolved assumption meets one of three gating
criteria:

```
(a) blocks a security gate (G1 or G2), OR
(b) affects the scope of more than one epic, OR
(c) introduces a new external dependency not previously in scope
```

**Design choices:**
- **Push, not poll.** `ts-project-planner` polling `ts-deliver-router`'s
  internal phase state would violate the existing read-only boundary between
  the two skills. A push-based hook keeps the boundary intact and the signal
  timely.
- **Non-blocking, always logged.** The hook never blocks phase progression;
  success or failure is logged in `state.json.notes` regardless. If
  `ts-project-planner` isn't installed, Delivery continues — the hook degrades
  gracefully.
- **Gated by 3 criteria, not "any unknown."** Unfiltered, the hook would flood
  Discovery with implementation noise (naming, internal refactors) and defeat
  its signal value. Minor details go to `state.json.notes` only.
- **Dedup is Discovery's job, not the hook's.** `ts-project-planner` runs a
  Jaccard-similarity check (>0.5 on normalized title tokens) against existing
  entries before creating a new one — permissive toward merging, since false
  positives (two ideas merge) are cheaper to recover from than false
  negatives (duplicates silently accumulate).
- **G1 surfaces, but does not hard-block on, linked Discovery items.** If
  `discovery.json` has an entry with `source_epic` = the current epic and
  `status` not in `{ready, killed}`, G1 surfaces it advisorily. Human may
  resolve via `/ts-discover` or explicitly accept the risk in
  `state.gates.G1.notes`.
- **`ts-deliver-router` has APPEND-ONLY access to `discovery.json`** —
  it can create new entries via the hook (dedup-checked) but cannot modify
  `status`, `decision`, `ready_epics`, or any other field on existing entries.
  This preserves a single point of decision authority: only
  `/ts-discover decide` (human-invoked, in `ts-project-planner`) can move an
  idea to `ready`/`killed`/`reduce-scope`.

---

## 8. ts-acpl — The Build Discipline

`ts-acpl` (AI Coding Pattern Language) is the Build-phase coding discipline —
20 patterns across 5 groups (Guard & Boundary, Pure Logic, State & Transition,
Seam & Testability, Output Contract), each with a *Mutation Sensitivity Note*
naming which mutant classes it kills. 8 core generation rules (dependency
injection, guard-clauses-first, named predicates, explicit state transitions,
typed error results, contract comments, isolated side effects, named
constants) apply to all Build-phase code generation.

A **Problem Frame → Pattern Group** quick-map connects `ts-deliver-router`'s
Think-phase classification (via `ts-event-storming-facilitator`) directly to
which pattern groups apply — Think's output (`acpl_pattern_group`) flows into
Build pre-selected, and into Test where `ts-mutation-analyst` maps surviving
mutants back to the specific missing pattern/test.

This is the third leg of the **Core 4 invariant** (alongside gstack spine,
Spectra BDD, code-review-graph MCP): gstack/Spectra/code-review-graph/caveman
+ ACPL-as-Build-discipline are never negotiated per project.

---

## 9. ts-orchestrate — Dual-Track Orchestrator (shipped 2026-07-01)

`ts-orchestrate` is the fourth skill in the ts- family and the **top-level
dual-track orchestrator** — the session entry point that sits above both
`ts-project-planner` (Discovery track) and `ts-deliver-router` (Delivery
track). It is the only skill that has a unified view of both tracks
simultaneously.

**Why a separate skill, not extending ts-deliver-router or ts-project-planner?**
ts-deliver-router owns the per-epic spine; adding cross-layer awareness there
would mean it needs to know about discovery state — a responsibility violation.
ts-project-planner manages Discovery internals (Layer D/0/1); making it the
session entry point would mean it owns phase advancement and security gates —
also wrong. ts-orchestrate is the seam: it delegates Discovery internals to
ts-project-planner and phase execution to ts-deliver-router, while owning
session start, combined status, gate enforcement, and phase advancement.

**ts-orchestrate orchestrates all 4 layers:**

| Layer | Owner | ts-orchestrate role |
|---|---|---|
| Layer D — Discovery | ts-project-planner | surfaces Discovery WIP in `:status`; routes new idea → `/ts-discover:idea` |
| Layer 0 — Backlog | ts-project-planner | surfaces sync-ready buffer; routes → `/ts-project:plan --sync` |
| Layer 1 — Sequencing | ts-project-planner | advances iteration; routes → `/ts-iteration:next` → `/ts-deliver:init` |
| Layer 2 — Delivery | ts-deliver-router | routes WORK_TYPE → correct phase spine; enforces G1/G2 on `:next` |

`:status` is the cross-layer readout of all 4 layers. `:next` advances whichever
layer is currently active (Discovery → decide, Sequencing → next epic, Delivery →
next phase). `:start` is the session entry that sets WORK_TYPE + AUTONOMY and
determines which layer to activate first.

### Core mechanism — `[WORKFLOW STATE]` hook

ts-orchestrate does not call `jq .agents/ts-deliver-router/state.json` directly.
Instead it reads the `[WORKFLOW STATE]` prefix injected by the
`inject-workflow-state.sh` hook (see §10) into every Claude Code prompt. This
keeps the skill's token cost flat — no file reads, no jq calls on every turn.

**Entry gate:** if hook shows `active epic: none` → emit
`[BLOCKED] No active epic in iteration.json.active_epic. Run /ts-project:plan --new to create one.`
and refuse `/ts-deliver:init`.

### Work-type routing (expanded to 9 types — see §12)

ts-orchestrate reads the end-user's WORK_TYPE and routes to the correct phase
spine. Originally 3 types (`bugfix`/`refactor`/`epic`); expanded to 9 by
EPIC-DUAL-TRACK-ORCHESTRATION (§12) — full table there. `epic` is retained
as an internal `iteration.json` concept (a plan slice reached via
`/ts-iteration:next`), not an end-user WORK_TYPE.

**Why named spines, not DIAL alone?** A bugfix that runs through Review,
Test, and Reflect at the same DIAL level as a greenfield feature wastes time
and burns token budget. But making DIAL alone control which phases run
conflates *confidence* (how much oversight) with *scope* (which activities
matter). Named spines with explicit gate lists are legible, auditable, and
require no heuristic.

**Implementation:** `src/utils/phase-routing.ts` exports
`getPhaseList(epicType: "epic" | "feature" | "bugfix" | "hotfix" | "refactor" | "chore" | "patch" | "spike" | "ops"): string[]`
— a pure function over 9 fixed arrays (`poc` is intentionally absent —
Discovery-only, never initializes a Delivery spine). The skill reads this via
TypeScript; `SKILL.md`'s Workflow Routing table documents the same mapping.

### Commands

- `/ts-orchestrate:start WORK_TYPE=FEATURE|BUGFIX|HOTFIX|REFACTOR|CHORE|PATCH|SPIKE|POC|OPS AUTONOMY=HIGH|MID|LOW` — session entry point; writes `active_epic` + `dial` to `iteration.json`, initializes `state.json` with `current_phase: "think"`, routes to correct phase spine, outputs first `[WORKFLOW STATE]`
- `/ts-orchestrate:status` — **unified dual-track view**: reads `[WORKFLOW STATE]` (Delivery) + `discovery.json` (Discovery); shows WIP idea count, next unvalidated idea, active epic, current phase, DIAL, and pending gates
- `/ts-orchestrate:next` — enforced phase advancement with gate checks (refuses if G1/G2 unsigned; never auto-signs)

### Autonomy levels

| Level | Behavior |
|---|---|
| HIGH | Auto-advance after gate sign-off; never auto-sign gates |
| MID | Recommend next action; user confirms phase advances |
| LOW | Wait for explicit user command at every step |

### Feedback loop (Reflect → Discovery)

After Reflect: mark epic `done` in iteration.json → write entry to
`discovery.json` with `source_epic` field → run `/ts-iteration:next` (or
`/ts-iteration:close`). Discovery resumes with the completed epic as context.

---

## 10. inject-workflow-state Hook (shipped 2026-06-30)

**Problem:** every session Claude Code starts cold. The agent must re-read
`state.json` + `iteration.json` before it can answer "where are we?" — wasted
tokens and a step that requires the human to remember to ask. ts-orchestrate
needs phase + epic context on every prompt turn, not just session start.

**Solution:** `inject-workflow-state.sh` is a `UserPromptSubmit` hook that
runs on every Claude Code prompt. It writes a `[WORKFLOW STATE]` prefix line
into the prompt context.

### Output format

```
[WORKFLOW STATE] ts-deliver phase: <phase> | active epic: <id>
[NEXT] Run /ts-deliver:refine after <phase-specific guidance>
```

Discovery mode (no `state.json`):
```
[WORKFLOW STATE] Discovery | dial: <dial> | active_epic: <id or none>
[NEXT] Run /ts-discover explore <id> (WIP limit 3)
```
The Discovery `[NEXT]` line (added by EPIC-DUAL-TRACK-ORCHESTRATION, §12) picks
a focus idea from `discovery.json` by status priority `validating > exploring
> idea > ready` (first match wins, one line only — D11) and emits the matching
next command. Malformed or missing `discovery.json` degrades to a generic seed
suggestion rather than crashing.

No state files: hook emits nothing (silent).

### Design decisions

- **Reads from two files:** `state.json` (phase) + `iteration.json`
  (`active_epic`). `active_epic` is NOT in `state.json` — it lives in
  `iteration.json` because iteration sequencing owns it, not the per-epic
  router.
- **Free-text fields are never echoed.** `iteration.json.epics[].notes` and
  any other free-text field are suppressed to prevent prompt injection.
  Only enum values and IDs are emitted.
- **Silent on error.** `jq` unavailable, malformed JSON, missing files → no
  stdout, no stderr. Claude Code sees an empty hook output and continues.
- **Project-scoped, not global.** Installs to `${PROJECT_CLAUDE_DIR}/hooks/`,
  not `~/.claude/hooks/`. Each project has independent hook state.
- **Idempotent install.** `install.sh` checks for existing `UserPromptSubmit`
  entry before adding — re-running install never duplicates.

### `[NEXT]` guidance — mirrors `ts-orchestrate/SKILL.md`'s Workflow Guidance table

The hook's `[NEXT]` case-statement strings are an executable copy of
`ts-orchestrate/SKILL.md`'s canonical **Workflow Guidance** table (`Track |
Phase/State | Guidance`) — same source of truth, two surfaces, kept in sync
manually (D9, see §12). Reproduced here so this record doesn't drift from
either:

| Track | Phase/State | Guidance | Hook emits `[NEXT]` for this state? |
|---|---|---|---|
| Discovery | idea | Run `/ts-discover explore <id>` (WIP limit 3 in exploring+validating) | yes |
| Discovery | exploring | `ts-event-storming-facilitator` output required to exit; then `/ts-discover validate <id>` (mandatory if any H-risk assumption) or `/ts-discover decide <id> build` | yes |
| Discovery | validating | council-advisor + tows-strategy-analyst + `ts-ddd-tactical-validator`; then `/ts-discover decide <id>` | yes |
| Discovery | ready | Run `/ts-project plan --sync` to move epic(s) into the backlog | yes |
| Discovery | keep-learning | Back to exploring, `keep_learning_count++`; at 3 → forced `/ts-discover decide` | no — not a status value; the entry's `status` returns to `exploring`, so it re-surfaces under that row |
| Discovery | killed | ADR written; entry retained for audit — no further action | no — terminal, correctly excluded from the focus-priority chain (`validating > exploring > idea > ready`) |
| Discovery | reduce-scope | Idea split into new `idea` entries; explore each separately | no — terminal for the original entry; the new split entries surface under `idea` |
| Delivery | think | Spectra:discuss + G1 threat-model sign-off (if required) → `/ts-deliver:refine` | yes |
| Delivery | plan | Spectra:propose + design review → `/ts-deliver:refine` | yes |
| Delivery | build | Spectra:apply + test coverage gate → `/ts-deliver:refine` | yes |
| Delivery | review | staff-review report → `/ts-deliver:refine` | yes |
| Delivery | test | acceptance + integration gates → `/ts-deliver:refine` | yes |
| Delivery | ship | Spectra:archive + G2 sec-review sign-off (if required) → `/ts-deliver:refine` | yes |
| Delivery | reflect | `/ts-iteration:next` (or `/ts-iteration:close` if last epic); spike: write learning entry to discovery.json first | yes |

Every Delivery phase and the 4 non-terminal Discovery statuses get a literal
`[NEXT]` line (verbatim strings in `inject-workflow-state.sh`). The 3 excluded
Discovery rows aren't a gap — `keep-learning` isn't a real `status` value (it's
a decision outcome that resets `status` to `exploring`), and `killed` /
`reduce-scope` are terminal, so the hook's focus-priority chain never selects
them by design.

Unknown Delivery phase value → `[NEXT] Unknown phase: <value> — check
state.json`. No Discovery entry matches the priority chain → generic seed
suggestion (`/ts-discover idea "<desc>"` or `/ts-project:plan --new`).

---

## 11. Explored But Not Yet Merged — Code-Graph / Dev-Graph

A separate design session explored two extensions, deliberately scoped as
*extensions to existing primitives*, not new primitives — analyzed and
recorded, **not yet merged** into any `SKILL.md`:

**Phase-branch/tag strategy.** `.agents/ts-deliver-router/state.json` is truth
but a single mutable file. A git tag at every phase exit
(`lifecycle/<phase>/<cycle-id>`) gives a hard, immutable checkpoint —
extension of the Phase Exit Contract, one new `state.json` field
(`phase_tag`, schema v1→v2), one new registry row (`phase-tag`, cross-cutting
gate). **Decision: tags only, no long-lived phase branches** — branch
discipline competing with state.json truth was exactly what the hardening pass
eliminated.

**Development-graph.** code-review-graph solves context-efficiency for *code*;
nothing graphs the *lifecycle/workflow* itself. **Decision: derivable from
state.json first, MCP server deferred** — a lightweight muscle task (Copilot/
Gemini) derives a Mermaid diagram from `state.json` on demand. 80% of the
value, zero new infrastructure.

**Landscape survey findings** (for when these are picked up):
- **GCC** (`faugustdev/git-context-controller`) — intra-session agent memory
  (COMMIT/BRANCH/MERGE/CONTEXT), validates git-as-state-store but is
  scratchpad management, not lifecycle phase tracking.
- **GNAP** (`farol-team/gnap`) — task-board coordination via git, same
  pattern, different problem.
- **codegraph** vs **Graphify** — both stronger candidates than
  code-review-graph for the existing `incr-review` registry row (wider
  language support, better token numbers). codegraph = solo/small-team
  (SQLite-only); Graphify = team/shared-server (HTTP transport).

**Four registry rows proposed, not yet merged:** `code-graph` (build, always —
repo-indexing via codegraph/Graphify MCP), `incr-review` (updated source
reference only), `gcc-commit` (build, rec — GCC:COMMIT at milestones),
`phase-tag` (cross-cutting gate — git tag at every phase exit),
`dev-graph-snapshot` (reflect, rec — Mermaid from state.json).

**Open questions carried forward:** codegraph vs. Graphify per project;
whether `phase-tag` should be `gate` (hard block) or `always`+warning for
environments without git push rights; whether `dev-graph-snapshot` should also
fire after Review (to show which ingest deltas review findings triggered).

---

## 12. EPIC-DUAL-TRACK-ORCHESTRATION — ts-orchestrate Becomes Real (shipped 2026-07-05)

§9 described ts-orchestrate's *design*; this epic is where the dual-track
orchestrator, the two Discovery sub-agents, and the WORK_TYPE expansion it
depended on actually shipped. Source idea: `discovery.json` idea-002.
Full task-by-task execution log: `tasks/dual-track-orchestration-plan.md`
(T1–T12 + T9.5, weak-model-executable runbook, 12 locked decisions in its §0).

### WORK_TYPE set: 3 → 9

§9's `bugfix`/`refactor`/`epic` set couldn't express most real work — a
one-line dependency bump and a greenfield feature both had to squeeze into
`epic` or `bugfix`. Expanded to: `FEATURE | BUGFIX | HOTFIX | REFACTOR |
CHORE | PATCH | SPIKE | POC | OPS`. No `EPIC` (an epic is a *plan slice*
reached via `/ts-iteration:next`, not a work type a user declares) and no
`DISCOVERY` (Discovery entry is via `FEATURE` with no validated idea, or
`POC`).

| WORK_TYPE | Spine | Gates |
|---|---|---|
| `FEATURE` | Think → Plan → Build → Review → Test → Ship | G1 |
| `BUGFIX` / `HOTFIX` | Think → Build → Ship | none (HOTFIX = expedited audit tag) |
| `REFACTOR` | Think → Plan → Build → Review → Ship → Reflect | G1 |
| `CHORE` | Build → Ship | none |
| `PATCH` | Build → Test → Ship | G2 (only if security-related) |
| `SPIKE` | Think → Build → Reflect (learning feeds Discovery, no Ship) | none |
| `POC` | Discovery-only, never initializes a Delivery spine | none |
| `OPS` | Think → Build → Review → Ship | G2 |

**Spike vs PoC** — the one distinction easy to blur: a Spike answers a
technical question *inside* Delivery and feeds the learning back; a PoC
validates idea feasibility entirely *inside* Discovery and never ships.

### Two Discovery sub-agents ship as real `.claude/agents/*.md` files

§14's open item — 4 sub-agents specified in `references/sub-agents.md` but
never built — is now half-closed. `ts-event-storming-facilitator` and
`ts-ddd-tactical-validator` are built as `.md` prompt files in `src/agents/`
(not skills — D1, user-confirmed), packaged via a new `agents[]` manifest
category (parallel to `skills[]`/`hooks[]`), installed to
`<project>/.claude/agents/`. `ts-spec-validator` and `ts-mutation-analyst`
remain unbuilt (explicit non-goal for this epic).

Both are now **required gates**, not optional aids:
- `ts-event-storming-facilitator` is **required to exit** `/ts-discover
  explore` — status stays `idea` until `exploration_output` is non-empty (D2).
- `ts-ddd-tactical-validator` is **required before** `/ts-discover decide
  build` — runs during `validate` when validate runs; `decide` invokes it
  directly if validate was skipped (no H-risk). A `FAIL` recommendation
  blocks the build decision (D3).

**Why gates, not recommendations?** The original spec (`sub-agents.md`)
described these as available tools; nothing forced their use, so an idea
could reach `ready` with an unvalidated domain model. Making them
required-to-exit closes that gap without adding a new phase or primitive —
it's a Guard Clause on an existing transition.

### `ts-orchestrate/SKILL.md` — two distinct tables, not one merged table

D7 (user-corrected 3×) settled on two tables that look similar but serve
different questions:
- **Workflow Routing** (`Work type | Route`) — *which path*, track named
  inline, states walked one by one. Answers "what do I run next, end to end?"
- **Workflow Guidance** (`Track | Phase/State | Guidance`) — *what to do
  inside* a given state, strictly per-state, both tracks. Answers "I'm in
  state X, what happens here?"

The hook's `[NEXT]` bash strings are a third, executable copy of the same
guidance (D9 — see below). Three surfaces, one source of truth in intent,
kept in sync manually.

### Known accepted duplication, and where it's NOT yet enforced

D9 accepts that bash can't `import` markdown, so
`inject-workflow-state.sh`'s `[NEXT]` case-statement strings duplicate
`SKILL.md`'s Workflow Guidance table. The runbook's original framing
("lockstep enforced by hook-output tests") turned out to be **inaccurate** —
caught during this epic's own Review phase: `hook-output.test.ts` only
asserts the hook's literal output against fixtures, never diffs against
`SKILL.md`. Corrected in `openspec/changes/archive/2026-07-05-dual-track-orchestration/design.md`.
Net state: the duplication is accepted, but nothing currently catches drift
between the hook and the skill doc — open item, carried to §14.

A narrower, adjacent risk *is* covered: `src/tests/unit/spine-consistency.test.ts`
(T9.5, added post-Plan-review) asserts `phase-routing.ts` and
`work-unit-profiles.md` agree on phase lists — but only for the 6 new types,
deliberately excluding `epic`/`refactor`/`bugfix` (those three have a
pre-existing, out-of-scope spine contradiction between
`work-unit-profiles.md` and `SKILL.md`/`phase-routing.ts` — asserting
equality there would fail on a known issue this epic didn't fix).

### Review-phase findings (self-correcting the record)

Running this epic's own Review phase (8-angle `/code-review high`) surfaced
two gaps in the epic's own artifacts, both fixed in the same session:
- `scripts/pilot.mjs` asserted skills/hooks land on disk post-install but
  never `manifest.agents` — fixed.
- `design.md`'s D9 note overstated test coverage that didn't exist (above) —
  corrected.

Deferred as non-blocking: the `agents` manifest category is wired into
`install.sh`/`install.ps1`/`build-release.mjs`/`dogfood.mjs` as a third
copy-pasted per-category loop (same shape as the pre-existing
skills/hooks loops) — a rule-of-three reuse gap, refactor-scope, not shipped
this epic.

---

## 13. Final Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ ts-orchestrate  (cross-layer coordinator)                             │
│                                                                       │
│  Reads [WORKFLOW STATE] from inject-workflow-state.sh hook            │
│  Routes epic.type → phase spine   Gates: G1 (refactor+epic) /        │
│  /ts-orchestrate:start|status|next             G2 (epic only)        │
└──────────┬──────────────────────────────────────────┬───────────────┘
           │                                           │
           ▼                                           ▼
┌──────────────────────────┐          ┌──────────────────────────────┐
│ ts-project-planner       │          │ ts-deliver-router             │
│                          │          │  (Layer 2 — per-epic spine)   │
│  Layer D — Discovery     │          │                               │
│    /ts-discover:idea     │          │  Think → Plan → Build →       │
│    /ts-discover:explore  │          │  Review → Test → Ship →       │
│    /ts-discover:validate │          │  Reflect                      │
│    /ts-discover:decide   │          │   │G1▲          │G1▼  │G2▼   │
│    /ts-discover:status   │          │              ts-acpl           │
│         │ status=ready   │          │   └─ Discovery Feedback Hook ─┘
│         ▼                │          │      (gated a/b/c, non-blocking)
│  Layer 0 — Backlog       │          └──────────────────────────────┘
│    /ts-project:plan --new│
│    /ts-project:plan --sync◄─────────────────────── discovery.json
│         │                │          ▲
│         ▼                │          │ append-only (hook: /ts-discover idea --from-router)
│  Layer 1 — Delivery      │──────────┘
│    /ts-iteration:start   │
│    /ts-iteration:next ───┼──────────► /ts-deliver:init (per epic)
│    /ts-iteration:close   │
└──────────────────────────┘

Shared workspace: .agents/ (root, unprefixed)
  domain.json · discovery.json · iteration.json · risks.md · decisions/ · WORKSPACE.md

Private:
  .agents/ts-deliver-router/state.json     ← slim: current phase only
  .agents/ts-deliver-router/history.jsonl  ← append-only: one line per phase exit
  .agents/ts-project-planner/plan.json
  .agents/ts-project-planner/retrospectives/

inject-workflow-state.sh (UserPromptSubmit hook):
  reads state.json + iteration.json → injects [WORKFLOW STATE] + [NEXT] every prompt turn
```

---

## 14. Open Items Carried Forward

- Fill registry placeholders (`<SAST tool>`, `<dep/secrets scanner>`,
  `<mutation tool>`) per real project stack — currently Semgrep/Trivy/
  Stryker-PITest-mutmut as defaults.
- Privacy-review skill: dedicated check vs. fold into `gstack:/cso` +
  `critical-thinker` — still undecided.
- Code-graph/dev-graph registry rows (§11) — analyzed, not merged; open
  questions Q1-Q3 unresolved.
- Monthly refresh of spine + harvested libraries (gstack, Spectra,
  superpowers, code-review-graph, conditionally mattpocock/addyosmani).
- Verify code-review-graph MCP configuration per project before invoking
  `ts-deliver-router` for real.
- 2 of 4 specified sub-agents shipped (§12): `ts-event-storming-facilitator`
  and `ts-ddd-tactical-validator` are built and required-gated.
  `ts-spec-validator` and `ts-mutation-analyst` remain specified
  (`references/sub-agents.md`) but unbuilt — explicit non-goal of §12's epic.
- GitHub MCP not yet configured in any real project (`tier=pending-setup`).
- `ts-orchestrate:status` cross-layer view format not yet finalized — open
  question on whether to render as Mermaid diagram or tabular status block.
- `inject-workflow-state.sh` — iteration.json orchestration fields
  (`active_phase`, `active_idea`, `epic_dial_overrides`, `resume_log`)
  documented in `iteration-schema.md` but not yet wired into hook output.
  (`dial` and `active_epic` are wired.)
- Add a JSON-shape/type check for Discovery sub-agent output (§12) — only a
  non-empty-fields gate exists today; a structurally malformed-but-non-empty
  blob would pass and corrupt `discovery.json` silently.
- No test asserts `inject-workflow-state.sh`'s `[NEXT]` bash strings stay in
  lockstep with `SKILL.md`'s Workflow Guidance table (§12) — the runbook's
  original claim that this was test-enforced was corrected during §12's
  Review phase; the underlying gap is still open.
- Installer/build-script `agents` manifest category (§12) is wired as a
  third copy-pasted per-category loop across `install.sh`/`install.ps1`/
  `build-release.mjs`/`dogfood.mjs` — rule-of-three reuse gap, refactor-scope.
- Release/Iteration DDD model gap (§12 validate): under-modeled as its own
  aggregate; `WorkflowStateInjected` mis-classified as a domain event rather
  than a read-side projection.
