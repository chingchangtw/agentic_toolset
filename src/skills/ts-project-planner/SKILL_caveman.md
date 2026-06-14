---
name: ts-project-planner
description: >
  Dual-track agile planner. Discovery (idea/explore/validate/decide) +
  Backlog (plan/sync) + Delivery (iteration via ts-deliver-router).
  Activate on project planning, discovery, iteration setup.
  Works WITH ts-deliver-router — does NOT replace it.
---

# ts-project-planner (caveman)

3-layer dual-track engine. Discovery / Backlog / Delivery.
Does NOT replace ts-deliver-router. Calls it.

Workspace: .ai/ root. Read references/workspace-spec.md on first use.

```
.ai/
├── discovery.json          ← buffer (primary writer: this skill)
│                              ts-deliver-router: APPEND-ONLY via --from-router
├── domain.json             ← ES model (read)
├── iteration.json          ← release state (primary writer)
├── risks.md                ← risk register (primary writer)
├── decisions/              ← ADRs (read + append)
├── ts-deliver-router/      ← private to ts-deliver-router
└── ts-project-planner/
    ├── plan.json           ← private backlog
    └── retrospectives/
```

---

## ARCHITECTURE

```
Layer D — Discovery
  /ts-discover idea|explore|validate|decide|status

Layer 0 — Backlog
  /ts-project plan --new|--sync|status|refine

Layer 1 — Delivery
  /ts-iteration start|next|status|close

Layer 2 — ts-deliver-router (separate skill)
  /ts-router init → 7-phase spine → /ts-router refine
```

Discovery + Delivery run parallel, different cadences. Release N delivering while
Release N+1 ideas in Discovery.

---

## DISCOVERY STATE MACHINE

States: idea → exploring → validating → ready / killed / reduce-scope

Transitions:
- idea → exploring: `/ts-discover explore`
- exploring → validating: `/ts-discover validate` (mandatory if H-risk)
- exploring → ready: `/ts-discover decide build` (no H-risk = skip validate)
- validating → ready/killed/reduce-scope: `/ts-discover decide`
- validating → exploring: `/ts-discover decide keep-learning` (count++)
- exploring → killed/reduce-scope: `/ts-discover decide`
- reduce-scope → child ideas (status=idea)

WIP limit: max 3 exploring+validating combined. Blocks explore at capacity.
Stale rule: keep_learning_count >= 3 → flagged stale in status. Advisory.
Validation skip: no H-risk → exploring can go straight to ready via decide build.
Dedup (--from-router): title similarity check before creating new entry.

Full criteria: references/discovery-kanban.md

---

## WORK UNIT TYPES

| type | phases | gates | mutation | branch |
|---|---|---|---|---|
| epic | full 7 | G1+G2 | 60→85% by stage | feat/<name> |
| refactor | Think→Build→Review→Test→Reflect | G1 only | 90% | refactor/<name> |
| bugfix | Plan→Build→Test→Ship | G2 only | 80% | fix/<name> |

/ts-router init reads type → pre-activates correct phases.

---

## COMMANDS

### /ts-discover idea "<title>"
Add to discovery.json, status=idea. Generate next id.

### /ts-discover idea --from-router
Feedback hook from ts-deliver-router. Fires only if unknown:
  (a) blocks G1/G2, OR (b) affects >1 epic scope, OR (c) new external dep.
Dedup check first. source_epic set. Non-blocking on failure.

### /ts-discover explore <id>
1. WIP check (3 limit)
2. ts-event-storming-facilitator → domain_events, aggregates
3. ts-acpl problem-frame-map → acpl_pattern_group
4. first-principles-agent → riskiest_assumptions
5. status = exploring, exploration_output populated

Degrades to first-principles only if ES facilitator unavailable.

### /ts-discover validate <id>
council-advisor + tows-strategy-analyst evaluate H-risk assumptions.
status = validating, validation_output = {feasibility, rationale}

### /ts-discover decide <id> [build|kill|keep-learning|reduce-scope]
- **build**: status=ready, ready_epics populated. NOT in plan.json yet.
  If exploring + no H-risk → validation skip allowed.
- **kill**: status=killed, ADR written. Entry stays for audit.
- **keep-learning**: status back to exploring, keep_learning_count++
- **reduce-scope**: status=reduce-scope, child ideas created (status=idea).
  Bidirectional note links.

### /ts-discover status
Kanban view grouped by status. WIP N/3. Stale flags.
Suggests next actions.

### /ts-project plan --new "<vision>"
Interview: vision / success / constraints → domain (optional ES) → seed
discovery.json with candidate ideas (status=idea). No plan.json yet.

### /ts-project plan --sync
Pull status=ready items → plan.json as epics. Mark synced_to_plan=true.
Zero ready → suggest explore oldest idea.

### /ts-project status
Project name / current release / releases[✓●○] / epics / discovery / risks / ADR

### /ts-project refine
Review deferred / add epics / reprioritise / update risks.md.
Offer re-run ES facilitator if domain evolved. Write plan.json (refined_count++)

### /ts-iteration start <release>
1. filter plan.json for release
2. zero epics → "run /ts-project plan --sync first"
3. topological sort by depends_on
4. surface blocked epics → human: defer or proceed
5. write iteration.json (all queued, active_epic=null)
6. GitHub MCP: milestone. Rovo: sprint/labels.

### /ts-iteration next
1. first queued epic → status=active, active_epic=id
2. lookup discovery.json → acpl_pattern_group
3. /ts-router init: type, acpl, branch, risks, phases
4. ts-deliver-router runs spine
5. on complete: write back status=done, mutation_score, shipped_at, active_epic=null

### /ts-iteration status
Release goal / N/N epics / active epic+phase+score / queue / deferred / risks / next gate

### /ts-iteration close
1. verify all done|deferred
2. GitHub: close milestone + release tag
3. Rovo: transition issues → Done
4. retro → .ai/ts-project-planner/retrospectives/<release>-retro.md
5. carry deferred → plan.json next release
6. suggest: "Run /ts-discover status — check ready items for next iter"

---

## WRITE OWNERSHIP

| artifact | ts-project-planner | ts-deliver-router |
|---|---|---|
| discovery.json | **Full R/W** | APPEND-ONLY (--from-router, new entries only) |
| plan.json | **Full R/W** | — |
| iteration.json | **W** (all fields) | W (status/branch/score/shipped_at/active_epic) |
| risks.md | **W** | R (G1) |
| decisions/ | R/W | R/W |
| ts-deliver-router/* | R (iteration only) | **W** |
| ts-project-planner/* | **W** | — |

---

## ts-deliver-router WRITES BACK (iteration.json only)
epics[active].status=done, branch, mutation_score, shipped_at
active_epic=null
Nothing else.

---

## FEEDBACK HOOK
ts-deliver-router → /ts-discover idea --from-router when Think/Build surfaces
unknown meeting (a)/(b)/(c). Creates discovery.json entry linked via source_epic.
Non-blocking. If unavailable → logged, phase continues.

## G1 ENRICHMENT
ts-deliver-router reads .ai/risks.md at Review G1.
Unresolved --from-router ideas linked to active epic → surfaced. Advisory.

---

## SKILLS USED
ts-event-storming-facilitator → Layer D+0: domain → epic boundaries
first-principles-agent        → Layer D: challenge framing, assumptions
council-advisor               → Layer D: evaluate H-risk assumptions
tows-strategy-analyst         → Layer D: strategic fit
critical-thinker              → Layer 1: challenge epic sequencing
ts-deliver-router             → Layer 2: per-epic spine
ts-acpl                       → Layer D: problem-frame-map
Atlassian Rovo MCP            → Layer 0+1: Epics/Sprints/issues/retros
GitHub MCP                    → Layer 1: milestones, release tags, branches

## REFS
references/workspace-spec.md       → .ai/ layout + schemas + R/W matrix
references/iteration-schema.md     → iteration.json field reference + example
references/work-unit-profiles.md   → registry profiles per work unit type
references/discovery-kanban.md     → stage criteria, WIP, stale, dedup
