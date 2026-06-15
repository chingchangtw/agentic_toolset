# Ideas — Agentic Dev Workflow Hub (Consolidated Design Record)

This is the single design record for the **ts- skill family**: `ts-deliver-router`,
`ts-project-planner`, and `ts-acpl`. It supersedes the original `Ideas.md`,
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
per-project *live* collection — initialized via `/ts-router init`, refined at
every Reflect via `/ts-router refine`, with an append-only `registry.log`
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

## 5. The ts- Family — Why a Prefix, Why Three Skills

Once a second skill (`ts-project-planner`) and a third (`ts-acpl`) existed
alongside the router, a namespace became necessary — a single skill doesn't
need a prefix; a *family* does. All skill names, sub-agent names, commands,
and skill-private workspace directories took the `ts-` prefix:

| Role | Skill |
|---|---|
| Per-epic 7-phase engine | **`ts-deliver-router`** (originally `lifecycle-router`) |
| Build-time coding discipline | **`ts-acpl`** (AI Coding Pattern Language) |
| Cross-epic orchestrator, dual-track agile | **`ts-project-planner`** |

The shared workspace root `.ai/` and generic shared artifacts (`domain.json`,
`iteration.json`, `risks.md`, `discovery.json`, `decisions/`, `WORKSPACE.md`)
deliberately stayed **unprefixed** — they're conventions any future skill
might use, not identifiers of one skill. Only skill-private directories
(`.ai/ts-deliver-router/`, `.ai/ts-project-planner/`) and the skill/command/
sub-agent identifiers themselves carry the prefix.

`ts-deliver-router`'s `/ts-router *` commands kept "router" rather than
becoming `/ts-deliver *` — "router" is retained from the new name
(`ts-deliver-router` still ends in `-router`); only the descriptive prefix
changed (`lifecycle`→`deliver`). The rename's deeper purpose: "deliver"
positions this skill as the **Delivery**-track engine, the counterpart to
`ts-project-planner`'s new **Discovery** track (`/ts-discover *`) — see §6.

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
buffer: `.ai/discovery.json`, entries with `status=ready`.

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

## 9. Explored But Not Yet Merged — Code-Graph / Dev-Graph

A separate design session explored two extensions, deliberately scoped as
*extensions to existing primitives*, not new primitives — analyzed and
recorded, **not yet merged** into any `SKILL.md`:

**Phase-branch/tag strategy.** `.router/state.json` (now `.ai/ts-deliver-router/
state.json`) is truth but a single mutable file. A git tag at every phase exit
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

## 10. Final Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ ts-project-planner                                                    │
│                                                                         │
│  Layer D — Discovery (continuous, irregular cadence)                  │
│    /ts-discover idea|explore|validate|decide|status                   │
│    /ts-discover idea --from-router  ◄──────────────────────┐          │
│         │ status=ready                                       │          │
│         ▼                                                     │          │
│  Layer 0 — Backlog                                            │          │
│    /ts-project plan --new   (seeds Discovery)                │          │
│    /ts-project plan --sync  (ready → plan.json epics)        │          │
│         │                                                     │          │
│         ▼                                                     │          │
│  Layer 1 — Delivery (release cadence)                         │          │
│    /ts-iteration start/next/close ───────────────────────────┘          │
└──────────────────────────│─────────────────────────────────────────────┘
                            │ /ts-router init (per epic)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ts-deliver-router  (Layer 2 — per-epic 7-phase spine)                 │
│                                                                         │
│  Think → Plan → Build → Review → Test → Ship → Reflect                │
│   │G1▲           │              │G1▼     │G2▼                          │
│   │              ▼              │                                      │
│   │         ts-acpl (Build discipline, 20 patterns / 5 groups)         │
│   │                                                                     │
│   └── Discovery Feedback Hook (gated a/b/c, non-blocking) ─────────────┘
└─────────────────────────────────────────────────────────────────────┘

Shared workspace: .ai/ (root, unprefixed) — domain.json, discovery.json,
iteration.json, risks.md, decisions/, WORKSPACE.md
Private: .ai/ts-deliver-router/, .ai/ts-project-planner/
```

---

## 11. Open Items Carried Forward

- Fill registry placeholders (`<SAST tool>`, `<dep/secrets scanner>`,
  `<mutation tool>`) per real project stack — currently Semgrep/Trivy/
  Stryker-PITest-mutmut as defaults.
- Privacy-review skill: dedicated check vs. fold into `gstack:/cso` +
  `critical-thinker` — still undecided.
- Code-graph/dev-graph registry rows (§9) — analyzed, not merged; open
  questions Q1-Q3 unresolved.
- Monthly refresh of spine + harvested libraries (gstack, Spectra,
  superpowers, code-review-graph, conditionally mattpocock/addyosmani).
- Verify code-review-graph MCP configuration per project before invoking
  `ts-deliver-router` for real.
- 4 sub-agents (`ts-event-storming-facilitator`, `ts-spec-validator`,
  `ts-ddd-tactical-validator`, `ts-mutation-analyst`) are specified
  (`references/sub-agents.md`) but not yet built as `.claude/agents/*.md`
  files.
- GitHub MCP not yet configured in any real project (`tier=pending-setup`).
