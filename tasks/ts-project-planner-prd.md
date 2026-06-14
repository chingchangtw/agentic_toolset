# ts-project-planner — New Skill PRD
**Format:** gstack THINK → Spectra PLAN / BUILD / REVIEW → Spectra TEST → SHIP → REFLECT
**Type:** New Development (whole-new skill — supersedes prior `project-planner` design)
**Skill:** `ts-project-planner`
**Date:** 2026-06-14
**Status:** Ready for Build
**Rename reference:** `RENAME-MAP.md`

---

## THINK *(gstack — problem reframe)*

### What problem exists?

The prior `project-planner` design had two layers — decomposition (`/project plan`)
and iteration orchestration (`/iteration *`). Both assumed the epic backlog was
*already known* at planning time. For a giant greenfield project (a new ERP),
that assumption is false. You don't know yet whether "Manufacturing module"
should be one epic, three epics, or deferred for two iterations — that's exactly
what **Product Discovery** (Aktia / dual-track agile) exists to determine.

```
Giant project (new ERP)
  Layer D — Discovery   ← MISSING. Idea → Explore → Validate → Ready
  Layer 0 — Backlog     ← existed, but assumed input was already validated
  Layer 1 — Delivery    ← existed, runs ts-deliver-router per epic
```

Without Layer D, every module starts life as a fully-formed epic with assumed
scope. Discovery — the cheap, fast, kill-early learning loop — never happens.
The expensive thing (Build) absorbs all the uncertainty that Discovery should
have absorbed cheaply.

### What this skill does

**Layer D — Discovery** *(new)*
`/ts-discover idea` → `explore` → `validate` → `decide` (build / kill /
keep-learning / reduce-scope). Produces a Ready-for-Delivery buffer
(`.ai/discovery.json`, `status=ready`).

**Layer 0 — Backlog** *(renamed, role clarified)*
`/ts-project plan --new` seeds Discovery with candidate ideas (not epics).
`/ts-project plan --sync` pulls `status=ready` items from `discovery.json`
into `plan.json` as epics, grouped into releases.

**Layer 1 — Delivery** *(renamed, unchanged behavior)*
`/ts-iteration start/next/close` — sequences epics, calls `ts-deliver-router`
per work unit, tracks completion.

### Two tracks, one team, continuous flow

Per Aktia: discovery and delivery are not sequential phases — they run
**continuously and in parallel**, at different cadences. While Release N is in
Delivery, Release N+1's candidate modules are in Discovery. A feedback hook from
`ts-deliver-router` (Think/Build surfacing an unknown) re-enters Discovery as
a new idea — closing the loop.

### What this skill does NOT do

- Does not run any `ts-deliver-router` phase itself
- Does not require every module to complete Discovery before any Delivery starts
- Does not enforce a fixed cadence on Discovery (irregular cycles, by design)
- Does not write code
- Does not replace Jira — reads/writes it via Atlassian Rovo MCP

### Forcing questions

**Q: Why fold Discovery into this skill rather than a separate `ts-discovery` skill?**
Discovery's output (`status=ready` items) feeds directly into this skill's
existing `plan.json`/`iteration.json` machinery. Splitting them would require
the same cross-skill `writer_lock` coordination this design already uses
between `ts-project-planner` and `ts-deliver-router` — adding a third party
multiplies that complexity for no behavioral gain. One skill, two tracks,
shared workspace.

**Q: Why a buffer (`discovery.json`) instead of writing straight to `plan.json`?**
Per Aktia: discovery work is "messy, often non-linear, can go backwards." If
Discovery wrote directly to `plan.json`, every false start would pollute the
delivery backlog. The buffer lets ideas be killed, reduced, or sent back to
`keep-learning` with zero blast radius on `plan.json`. Only `status=ready`
crosses the buffer boundary.

**Q: What's the minimum viable Discovery loop?**
`/ts-discover idea` → `explore` → `decide build` (skip `validate` for
low-uncertainty ideas — Aktia explicitly allows this: "some items might go
straight into the backlog if uncertainty is low"). `validate` is mandatory only
when `riskiest_assumptions` contains an `H`-risk item.

**Q: How does feedback from `ts-deliver-router` re-enter Discovery?**
`/ts-discover idea --from-router` — called when Think or Build surfaces an
unresolved assumption that blocks a gate or affects scope. Creates a
`discovery.json` entry linked to the active epic via `source_epic`. Deduped by
title similarity against existing ideas before creation.

**Q: What prevents Discovery from running forever on one idea?**
A `keep-learning` counter. After 3 `keep-learning` decisions on the same idea,
`/ts-discover status` flags it `stale` and surfaces it for human decision —
force a build/kill/reduce-scope choice.

### Design document output

```
New skill:       ts-project-planner (3 layers: Discovery / Backlog / Delivery)
New artifact:    .ai/discovery.json (Ready-for-Delivery buffer)
New commands:    /ts-discover idea|explore|validate|decide|status
                 /ts-discover idea --from-router (feedback hook target)
Renamed cmds:    /ts-project plan[--new|--sync]|status|refine
                 /ts-iteration start|next|status|close
Renamed dirs:    .ai/ts-project-planner/ (was .ai/project-planner/)
Write ownership: ts-project-planner owns discovery.json + plan.json (full)
                 ts-deliver-router may APPEND to discovery.json only via
                   --from-router hook (append-only, dedup-checked)
WIP limit:       max 3 ideas concurrently in exploring+validating combined
Stale rule:      3x keep-learning on one idea → flagged stale, forces decision
```

---

## PLAN *(Spectra — scenarios as spec)*

### Feature: Discovery Loop

```gherkin
Feature: /ts-discover idea seeds the discovery backlog

  Scenario: New project seeds multiple ideas via --new
    Given user runs /ts-project plan --new "ERP for 200-employee manufacturer —
      Finance, Procurement, Inventory, HR/Payroll, Sales, Manufacturing"
    When the command completes
    Then .ai/discovery.json is created with 6 entries, status=idea each
    And each entry has a title matching one named module
    And .ai/project-planner/plan.json is NOT yet written (no ready items exist)

  Scenario: Single idea added ad-hoc
    Given .ai/discovery.json already exists
    When user runs /ts-discover idea "Self-service password reset portal"
    Then a new entry is appended with status=idea
    And the entry has a generated id following the existing id sequence

Feature: /ts-discover explore — Problem Understanding + Solution Exploration

  Scenario: Explore an idea with event storming
    Given idea-001 "General Ledger module" has status=idea
    When user runs /ts-discover explore idea-001
    Then ts-event-storming-facilitator runs, producing:
      | field            | example                                  |
      | domain_events    | JournalEntryPosted, PeriodClosed         |
      | aggregates       | Account, JournalEntry, FiscalPeriod      |
      | acpl_pattern_group | G2+G3                                   |
    And ts-acpl is consulted via problem-frame-map for the pattern group
    And first-principles-agent challenges the framing, producing riskiest_assumptions
    And idea-001.status becomes "exploring"
    And idea-001.exploration_output is populated

  Scenario: Low-uncertainty idea skips validation
    Given idea-008 "Add CSV export to existing report" has status=exploring
    And exploration_output.riskiest_assumptions has zero H-risk items
    When user runs /ts-discover decide idea-008 build
    Then validation is not required
    And idea-008.status becomes "ready"
    And a note records "validation skipped — low uncertainty"

Feature: /ts-discover validate — Validation

  Scenario: Validate an idea with H-risk assumptions
    Given idea-001 has riskiest_assumptions including
      { "assumption": "Multi-currency required from day 1", "risk": "H" }
    When user runs /ts-discover validate idea-001
    Then council-advisor evaluates the H-risk assumption
    And tows-strategy-analyst assesses strategic fit
    And idea-001.validation_output is populated with feasibility + rationale
    And idea-001.status becomes "validating"

Feature: /ts-discover decide — Decision Point

  Scenario: decide build creates ready epic(s)
    Given idea-001a "GL Core (single-currency)" has status=validating
    And validation_output.feasibility = "feasible"
    When user runs /ts-discover decide idea-001a build
    Then idea-001a.status becomes "ready"
    And idea-001a.ready_epics = ["EPIC-GL-CORE"]
    And the epic is NOT yet in plan.json (awaits /ts-project plan --sync)

  Scenario: decide kill writes an ADR
    Given idea-006 "Manufacturing/Production" has status=validating
    And validation_output.feasibility = "infeasible — depends on unstable Inventory model"
    When user runs /ts-discover decide idea-006 kill
    Then idea-006.status becomes "killed"
    And .ai/decisions/ADR-NNN.md is created documenting the kill rationale
    And the entry remains in discovery.json for audit (not deleted)

  Scenario: decide reduce-scope splits an idea
    Given idea-001 "General Ledger module" has status=validating
    And validation_output recommends splitting multi-currency from core
    When user runs /ts-discover decide idea-001 reduce-scope
    Then idea-001.status becomes "reduce-scope"
    And two new entries are created:
      | id        | title                  | status |
      | idea-001a | GL Core (single-currency) | idea |
      | idea-001b | GL Multi-currency          | idea |
    And idea-001.notes records "split into idea-001a, idea-001b"

  Scenario: decide keep-learning loops back
    Given idea-006 has status=validating
    And the team is not yet ready to decide
    When user runs /ts-discover decide idea-006 keep-learning
    Then idea-006.status returns to "exploring"
    And idea-006.keep_learning_count increments from 0 to 1
    And idea-006 remains in the discovery backlog for the next round

  Scenario: Stale idea forces a decision
    Given idea-006.keep_learning_count = 3
    When user runs /ts-discover status
    Then idea-006 is flagged "stale — 3x keep-learning, decision required"
    And router suggests: "Re-run /ts-discover validate with updated assumptions,
      or /ts-discover decide idea-006 [build|kill|reduce-scope]"

Feature: /ts-discover status — Visualization

  Scenario: Kanban view of discovery backlog
    Given discovery.json has entries in various states
    When user runs /ts-discover status
    Then output groups entries by status:
      """
      idea (2):       idea-004 HR/Payroll, idea-005 Sales Order Mgmt
      exploring (1):  idea-006 Manufacturing (stale — 3x keep-learning)
      validating (0)
      ready (3):      idea-001a GL-Core, idea-002 Procurement, idea-003 Inventory
      killed (0)
      WIP: 1/3 (exploring+validating)
      """

Feature: Feedback hook from ts-deliver-router

  Scenario: Build phase surfaces an unknown
    Given EPIC-GL-CORE is active in ts-deliver-router Build phase
    And Build encounters "tax calculation requires external API — reliability unknown"
    When ts-deliver-router calls /ts-discover idea --from-router
      with source_epic="EPIC-GL-CORE", description="Tax API integration reliability"
    Then a new entry idea-007 is created with status=idea
    And idea-007.source_epic = "EPIC-GL-CORE"
    And a dedup check confirms no existing idea has a similar title
    And idea-007 appears in the next /ts-discover status output

  Scenario: Dedup prevents duplicate feedback ideas
    Given idea-007 "Tax API integration reliability" already exists with status=idea
    And ts-deliver-router calls /ts-discover idea --from-router
      with description="Tax API reliability concerns" (similar title)
    When the dedup check runs
    Then no new entry is created
    And idea-007.notes appends "duplicate feedback received from EPIC-GL-CORE on <date>"
```

### Feature: Backlog Sync — Ready Buffer to Delivery

```gherkin
Feature: /ts-project plan --sync pulls ready items into the backlog

  Scenario: Sync with ready items available
    Given discovery.json has 3 entries with status=ready:
      idea-001a (EPIC-GL-CORE), idea-002 (EPIC-PROCUREMENT-CORE, depends_on EPIC-GL-CORE),
      idea-003 (EPIC-INVENTORY-CORE, depends_on EPIC-GL-CORE)
    When user runs /ts-project plan --sync
    Then plan.json is updated with a new release "MVP" containing all 3 epics
    And each epic's depends_on is carried from the discovery entry
    And the synced discovery entries are marked synced_to_plan=true

  Scenario: Sync with no ready items
    Given discovery.json has zero entries with status=ready
    When user runs /ts-project plan --sync
    Then router returns "No ready items in discovery backlog"
    And suggests "Run /ts-discover explore on the oldest 'idea' status entry"
    And plan.json is not modified
```

### Feature: Iteration Orchestration (renamed, behavior unchanged from prior design)

```gherkin
Feature: /ts-iteration commands drive ts-deliver-router per epic

  Scenario: /ts-iteration start sequences by dependency
    Given plan.json release "MVP" has epics EPIC-GL-CORE (no deps),
      EPIC-PROCUREMENT-CORE and EPIC-INVENTORY-CORE (both depend_on EPIC-GL-CORE)
    When user runs /ts-iteration start MVP
    Then .ai/iteration.json is written with epics ordered:
      [EPIC-GL-CORE, EPIC-PROCUREMENT-CORE, EPIC-INVENTORY-CORE]
    And all epics status=queued, active_epic=null
    And GitHub MCP creates milestone "MVP"

  Scenario: /ts-iteration next calls ts-deliver-router with pre-filled context
    Given EPIC-GL-CORE is the first queued epic
    And discovery.json idea-001a has exploration_output.acpl_pattern_group = "G2+G3"
    When user runs /ts-iteration next
    Then iteration.json.active_epic = "EPIC-GL-CORE", status = active
    And /ts-router init is called with:
      | param              | value                    |
      | type               | epic                     |
      | acpl_pattern_group | G2+G3                    |
      | branch_name        | feat/gl-core             |
      | risks_file         | .ai/risks.md             |
      | phase_activation   | all 7 phases             |

  Scenario: Write-back respects field ownership
    Given EPIC-GL-CORE completes Ship in ts-deliver-router
    When ts-deliver-router writes back to iteration.json
    Then only status, branch, mutation_score, shipped_at, active_epic are modified
    And iteration.json.release_goal is unchanged
    And iteration.json.epics[EPIC-GL-CORE].title is unchanged

  Scenario: /ts-iteration close carries deferred epics and triggers next Discovery sync
    Given all MVP epics are status=done
    When user runs /ts-iteration close
    Then GitHub MCP creates release tag v0.1.0-mvp
    And retro written to .ai/ts-project-planner/retrospectives/MVP-retro.md
    And router suggests "Run /ts-discover status — Discovery has been running in
      parallel; check for new ready items for Iter2"
```

---

## BUILD *(Spectra — implementation contracts)*

```gherkin
Feature: Skill package structure

  Scenario: Required files exist
    Given the ts-project-planner.skill zip is extracted
    Then the following files exist:
      | file                                          |
      | SKILL.md                                      |
      | SKILL_caveman.md                              |
      | README.md                                     |
      | references/workspace-spec.md                  |
      | references/iteration-schema.md                |
      | references/work-unit-profiles.md               |
      | references/discovery-kanban.md                |

  Scenario: discovery-kanban.md defines stage criteria
    Given references/discovery-kanban.md
    Then it defines entry/exit criteria for: idea, exploring, validating, ready, killed
    And it defines the WIP limit (3 concurrent exploring+validating)
    And it defines the stale rule (3x keep-learning)
    And it defines the dedup algorithm for --from-router ideas (title similarity threshold)

Feature: discovery.json schema and write ownership

  Scenario: Schema includes feedback-hook fields
    Given .ai/discovery.json schema in workspace-spec.md
    Then each idea entry includes: id, title, status, source_epic (nullable),
      keep_learning_count, riskiest_assumptions[], exploration_output,
      validation_output, decision, ready_epics[], synced_to_plan, notes

  Scenario: Write ownership matrix updated
    Given references/workspace-spec.md cross-skill read/write matrix
    Then ts-project-planner has full read/write on discovery.json
    And ts-deliver-router has APPEND-ONLY access to discovery.json,
      restricted to creating new entries via --from-router with source_epic set
    And ts-deliver-router cannot modify status, decision, or ready_epics
      on any existing discovery.json entry

Feature: Renamed directories

  Scenario: Private state directory renamed
    Given the prior project-planner used .ai/project-planner/
    When ts-project-planner is installed
    Then private state is written to .ai/ts-project-planner/
    And plan.json lives at .ai/ts-project-planner/plan.json
    And retrospectives/ lives at .ai/ts-project-planner/retrospectives/
```

---

## REVIEW *(Spectra — risk scenarios)*

```gherkin
Feature: Discovery loop risk coverage

  Scenario: WIP limit blocks new exploration
    Given 3 ideas already have status in {exploring, validating} combined
    When user runs /ts-discover explore idea-009
    Then router returns "WIP limit reached (3/3) — finish or defer an in-flight idea first"
    And idea-009.status remains "idea"

  Scenario: Feedback hook does not spam discovery with low-value ideas
    Given Build phase surfaces a minor implementation detail (not a scope-affecting unknown)
    When ts-deliver-router evaluates whether to call --from-router
    Then the hook fires ONLY if the unknown:
      - blocks a gate (G1/G2), OR
      - affects more than one epic's scope, OR
      - introduces a new external dependency
    And minor implementation details are logged in state.json notes instead,
      not surfaced to Discovery

  Scenario: Delivery queue starves gracefully
    Given /ts-iteration start was run with zero epics in the release
    When user runs /ts-iteration start MVP
    Then router returns "No epics found for release MVP — run /ts-project plan --sync first"
    And suggests checking /ts-discover status for ready items

  Scenario: Reduce-scope does not lose audit trail
    Given idea-001 is split via reduce-scope into idea-001a and idea-001b
    When user runs /ts-discover status
    Then idea-001 still appears with status=reduce-scope (not deleted)
    And idea-001.notes links forward to idea-001a and idea-001b
    And idea-001a/b.notes link backward to idea-001 as origin
```

---

## TEST *(Spectra apply — archive scenarios)*

All scenarios from PLAN, BUILD, and REVIEW constitute the test suite. Archive at
Test phase entry — no post-archive edits.

**Mutation targets:**

| Component | Target | Tool |
|---|---|---|
| Discovery state machine (idea→exploring→validating→ready/killed/reduce-scope) | 100% | One test per valid + invalid transition |
| WIP limit enforcement | 100% | Boundary test at 2/3, 3/3, 4/3 |
| Stale detection (keep_learning_count) | 100% | Test at count=2, 3, 4 |
| Dedup algorithm for --from-router | ≥ 85% | Stryker — title similarity edge cases |
| discovery.json → plan.json sync (--sync) | ≥ 85% | Stryker |
| Write-ownership enforcement (ts-deliver-router append-only on discovery.json) | 100% | Assert no field other than new-entry-creation is touched |

---

## SHIP

```bash
# 1. Install (fresh skill — no prior version to migrate)
unzip ts-project-planner.skill -d ~/.claude/skills/ts-project-planner/

# 2. Prerequisite: ts-deliver-router installed (see its change PRD)
/ts-router init   # creates .ai/WORKSPACE.md if not present

# 3. Start discovery for a new giant project
/ts-project plan --new "<vision>"

# 4. Run discovery loop on highest-uncertainty ideas first
/ts-discover explore idea-001
/ts-discover validate idea-001
/ts-discover decide idea-001 [build|kill|keep-learning|reduce-scope]

# 5. Sync ready items and start first release
/ts-project plan --sync
/ts-iteration start MVP
/ts-iteration next   # loop until queue empty
/ts-iteration close
```

**Release checklist:**
```
[x] SKILL.md ↔ SKILL_caveman.md content-consistent
[x] discovery-kanban.md defines all stage criteria, WIP limit, stale rule, dedup
[x] workspace-spec.md updated: discovery.json schema + write-ownership matrix
[x] iteration-schema.md and work-unit-profiles.md carried forward (renamed paths)
[x] All commands and paths follow RENAME-MAP.md
[x] ts-deliver-router listed as prerequisite with feedback-hook contract referenced
[x] No hardcoded project names or secrets in any file
```

---

## REFLECT

### Design decisions

| Decision | Alternatives considered | Chosen because |
|---|---|---|
| Discovery folded into ts-project-planner, not a separate skill | Separate `ts-discovery` skill | Discovery's output feeds this skill's existing plan.json/iteration.json directly — splitting adds a third cross-skill coordination party for no behavioral gain |
| `discovery.json` as a buffer, not direct writes to `plan.json` | Direct writes | Discovery is non-linear and reversible (Aktia); buffer isolates false starts from the delivery backlog |
| `validate` optional for low-uncertainty ideas | Always required | Aktia explicitly allows low-uncertainty items to skip discovery rigor — forcing validation on everything adds cost without reducing risk |
| WIP limit = 3 (exploring+validating combined) | Unlimited / per-stage limits | Keeps discovery focused; matches "lots of discovery loops should fit in a sprint" — 3 concurrent is a reasonable solo/small-team ceiling |
| Feedback hook gated by 3 criteria (gate-blocking / multi-epic / new dependency) | Hook fires on any "unknown" | Unfiltered hook would flood discovery.json with implementation noise, defeating its signal value |
| ts-deliver-router has append-only access to discovery.json | Full read/write | Prevents the per-epic engine from altering project-level decisions (kill/build/reduce-scope) — preserves single point of decision authority |

### Known limitations carried forward

1. **Stale rule (3x keep-learning) is a heuristic** — some legitimately hard
   problems may need more learning loops. The human can always override by
   forcing a decision; the flag is advisory, not blocking.
2. **WIP limit is global, not per-team** — for a solo developer this is
   correct; a multi-person team may want per-person WIP limits. Deferred.
3. **Dedup is title-similarity based** — may produce false positives (genuinely
   different ideas with similar titles merge) or false negatives (same idea,
   very different phrasing). A semantic similarity check is a future
   improvement.
4. **No cross-release Discovery view** — `/ts-discover status` shows the whole
   backlog regardless of which release items are destined for. As the backlog
   grows, a per-release filter may become necessary.
5. **`ts-event-storming-facilitator` remains pending-setup** — Discovery's
   `explore` stage degrades to first-principles-agent only if the ES sub-agent
   isn't built yet. `exploration_output.domain_events/aggregates` will be
   empty in that case; `acpl_pattern_group` falls back to manual classification
   via `ts-acpl`'s `problem-frame-map.md`.
