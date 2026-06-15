# ts-deliver-router — New Skill PRD
**Format:** gstack THINK → Spectra PLAN / BUILD / REVIEW → Spectra TEST → SHIP → REFLECT
**Type:** New Development
**Skill:** `ts-deliver-router`
**Date:** 2026-06-14
**Status:** Implemented — this PRD documents the as-built design
**Companion docs:** `Ideas.md` (design rationale), `ts-project-planner-prd.md`
(Layer 2 caller), `ts-acpl-prd.md` (Build discipline)

---

## THINK *(gstack — problem framing)*

### What problem does this skill solve?

Agentic coding agents are powerful but directionless without a fixed process.
Left alone, an agent will happily skip Review, ship without tests, or "infer"
that a half-written spec is good enough to build from. `ts-deliver-router` is
a **thin coordinator over verified state** — it does not write code, it routes,
verifies, gates, and dispatches.

### Core identity

- **Spine (fixed):** gstack 7 phases — Think→Plan→Build→Review→Test→Ship→Reflect.
- **BDD discipline (nested):** Spectra `discuss`(Think)/`propose`(Plan)/
  `apply`(Build)/`archive`(Ship); `ingest` = cross-cutting sub-loop, not a phase.
- **Hub/muscle split:** Claude Code orchestrates, judges, runs gates.
  Copilot/Gemini do cheap implementation, docs, git mechanics.
- **State as truth:** `.ai/ts-deliver-router/state.json`, written by each
  phase on exit. **Never inferred from artifacts.** Missing/stale/invalid →
  "phase unclear, manual review" + reason, STOP.

### Three primitives + one hook

| | Purpose | Stored in |
|---|---|---|
| **DIAL** | Autonomy: HIGH(auto)/MID(recommend, default)/LOW(suggest) | `.ai/ts-deliver-router/autonomy` |
| **CHECKS REGISTRY** | Template catalogue: always/gate/rec per phase | `SKILL.md` table |
| **PROJECT REGISTRY** | Per-project live tool collection + gate config | `.ai/ts-deliver-router/registry.json` |
| **Discovery Feedback Hook** *(not a primitive — one hook)* | Push unresolved unknowns to `ts-project-planner`'s Discovery track | `/ts-discover idea --from-router` |

### Two named security gates

**G1 — threat-model** (end of Think): STRIDE per data flow, OWASP-relevant
items, Semgrep zero high/critical, Trivy secrets clean, privacy inventory.
**G2 — sec-review** (start of Ship... in this build, mutation gate at Test):
mutation score ≥ registry threshold, Trivy re-run clean. Both **block at every
autonomy level. HIGH never auto-signs.**

### Forcing questions

**Q: Why "thin coordinator" rather than an agent that just does the work?**
Because the failure mode that motivated this design was an agent silently
"inferring" a half-written spec was complete enough to proceed. A thin
coordinator that can only say "verified" or "manual review, here's why" cannot
have that failure mode — it has nothing to infer with.

**Q: Why does Build's discipline (ts-acpl) live in a separate skill rather
than being inlined here?**
Separation of concerns mirrors the Core 4: the *spine* (this skill) is
invariant across projects; the *coding discipline* (ts-acpl) is a pattern
library that could in principle be swapped (different pattern language for a
different paradigm) without touching the spine. In practice ts-acpl is
"always active" — but architecturally it's a dependency, not baked in.

**Q: Why does the Discovery Feedback Hook live here rather than
ts-project-planner polling this skill's state?**
Polling would require `ts-project-planner` to inspect this skill's internal
phase state continuously — it currently only reads specific `state.json`
fields at write-back time (mutation_score, shipped_at). A push-based hook from
*inside* Think/Build, at the moment the unknown is surfaced, keeps that
boundary intact and the signal timely.

### Design document output

```
Spine:        gstack 7 phases (fixed)
BDD:          Spectra nested (discuss/propose/apply/ingest/archive)
Hub/muscle:   Claude Code / Copilot+Gemini
State:        .ai/ts-deliver-router/state.json (truth, never inferred)
Primitives:   DIAL, CHECKS REGISTRY, PROJECT REGISTRY
Hook:         Discovery Feedback Hook (Think+Build, gated a/b/c, non-blocking)
Gates:        G1 (Think exit, STRIDE+OWASP), G2 (Test, mutation threshold)
Sub-agents:   ts-event-storming-facilitator, ts-spec-validator,
              ts-ddd-tactical-validator, ts-mutation-analyst
MCPs:         Atlassian Rovo, code-review-graph (required), GitHub MCP
Plugins:      Semgrep (SAST), Trivy (dep/secrets), Stryker/PITest/mutmut (mutation)
Workspace:    .ai/ (shared root) + .ai/ts-deliver-router/ (private)
```

---

## PLAN *(Spectra — scenarios as spec)*

### Feature: State as Truth

```gherkin
Feature: Router reads state.json as the only source of truth

  Scenario: Missing state.json
    Given .ai/ts-deliver-router/state.json does not exist
    When user asks "what next?"
    Then router responds "phase unclear, manual review — state.json missing.
      Run /ts-router init."
    And no phase is inferred from artifacts

  Scenario: Stale state.json
    Given .ai/ts-deliver-router/state.json declares current_phase=plan with
      artifact spec/scenarios.md
    And spec/scenarios.md's mtime is newer than state.json's mtime
    When user asks "what next?"
    Then router responds "phase unclear, manual review — scenarios.md was
      modified after state.json was last written"
    And STOPS without advancing

  Scenario: Half-written spec (the motivating bug)
    Given state.json declares current_phase=plan, artifacts.plan.complete=true
    And spec/scenarios.md has 3 of 5 scenarios missing a `Then` clause
    When user asks "what next?"
    Then minimum-schema verification on scenarios.md fails
    And router responds "phase unclear, manual review — scenarios.md missing
      Then in scenario-3, scenario-4, scenario-5"
    And does NOT advance to Build
```

### Feature: DIAL (Autonomy)

```gherkin
Feature: DIAL governs how much the router does without asking

  Scenario: First use — DIAL not yet set
    Given .ai/ts-deliver-router/autonomy does not exist
    When /ts-router init runs
    Then router asks "Autonomy level? HIGH (auto) / MID (recommend, default) /
      LOW (suggest)"
    And writes the answer to .ai/ts-deliver-router/autonomy

  Scenario: HIGH mode still pauses for security gates
    Given autonomy=HIGH
    And current_phase=think, all G1 checklist items pass
    When router reaches phase exit
    Then router presents the G1 checklist results
    And explicitly asks for human sign-off
    And does NOT auto-sign, regardless of HIGH

  Scenario: MID mode recommends and waits
    Given autonomy=MID (default)
    And current_phase=build, CHECKS REGISTRY has a `rec` check (mutation
      pre-check on a high-risk module)
    When router consults CHECKS REGISTRY
    Then router surfaces the rec check with a recommendation
    And waits for human approval before running it
```

### Feature: CHECKS REGISTRY

```gherkin
Feature: Checks are typed always/gate/rec, attached per phase

  Scenario: always check runs without blocking
    Given current_phase=build
    And registry.json has a row {phase: build, type: always, tool: Semgrep}
    When router consults CHECKS REGISTRY for build
    Then Semgrep runs
    And its result is recorded but does not block phase progression

  Scenario: gate check blocks phase exit until passed
    Given current_phase=build
    And registry.json has a row {phase: build, type: gate, check: "tdd-coverage
      >= 75%"}
    And current coverage = 68%
    When router attempts phase exit
    Then exit is blocked
    And router reports "Build exit blocked: coverage 68% < threshold 75%"

  Scenario: Adding a new check is one row, no spine change
    Given the operator wants to add a new `rec` check "accessibility audit" to
      the review phase
    When the operator appends one row to registry.json:
      {phase: review, type: rec, tool: addyosmani/agent-skills a11y-audit}
    Then no change to SKILL.md, SKILL_caveman.md, or the router algorithm is
      required
    And the new check is surfaced at the next Review phase per DIAL level
```

### Feature: PROJECT REGISTRY

```gherkin
Feature: /ts-router init creates the live per-project registry

  Scenario: Init interview
    Given no .ai/ts-deliver-router/registry.json exists
    When /ts-router init runs
    Then router asks: project type / stack / external systems / frontend? /
      lifecycle stage (spike/active/stabilizing/maintenance)
    And proposes a default tool collection based on lifecycle stage
    And asks: mutation threshold? security gates required?
    And writes registry.json with the confirmed collection + thresholds
    And confirms "N tools active, 2 gates, mutation target X%"

  Scenario: /ts-router refine at Reflect
    Given a cycle has completed (epic shipped, registry.json exists)
    When /ts-router refine runs (always-auto at Reflect)
    Then router reports: tools used / unused / gate pass-rates / pending-setup
      items
    And prompts: promote optional→active? retire unused? resolve
      pending-setup? adjust mutation threshold?
    And writes registry.json (refinement_count++)
    And appends {date, changes[], rationale} to registry.log
```

### Feature: Discovery Feedback Hook

```gherkin
Feature: Think/Build push unresolved unknowns to Discovery

  Scenario: Think surfaces a multi-epic domain assumption
    Given current_phase=think for active epic EPIC-GL-CORE
    And ts-event-storming-facilitator's exploration surfaces "Multi-currency
      required from day 1" with no prior validation record
    And this assumption would affect EPIC-PROCUREMENT-CORE's scope too
      (criterion b: >1 epic)
    When Think phase evaluates the Discovery Feedback Hook gating criteria
    Then /ts-discover idea --from-router is called with
      description="Multi-currency required from day 1",
      source_epic="EPIC-GL-CORE"
    And Think phase continues regardless of the call's outcome

  Scenario: Build surfaces a new external dependency
    Given current_phase=build for active epic EPIC-GL-CORE
    And implementation requires a third-party tax API not previously in scope
      (criterion c)
    When Build's always-checks evaluate the hook gating criteria
    Then /ts-discover idea --from-router is called with
      description="Tax API integration reliability", source_epic="EPIC-GL-CORE"

  Scenario: Minor detail does NOT fire the hook
    Given current_phase=build
    And implementation reveals a naming inconsistency in an existing internal
      module — single-epic, no gate impact, no new dependency
    When Build's always-checks evaluate the hook gating criteria
    Then none of (a)/(b)/(c) are met
    And /ts-discover idea --from-router is NOT called
    And the detail is recorded in state.json.notes instead

  Scenario: Hook call fails — non-blocking
    Given ts-project-planner is not installed
    When the Discovery Feedback Hook fires
    Then the failure is logged in state.json.notes as "discovery hook
      unavailable — ts-project-planner not detected"
    And Think/Build phase progression continues normally
    And this is NOT treated as a gate failure

  Scenario: G1 surfaces (advisory) a linked Discovery item
    Given idea-007 (source_epic=EPIC-GL-CORE, "Tax API reliability") has
      status=idea in .ai/discovery.json
    And current_phase=review, evaluating G1 for EPIC-GL-CORE
    When the G1 checklist runs
    Then router surfaces "idea-007 is unresolved in Discovery and linked to
      this epic — resolve via /ts-discover, or accept the risk in
      state.gates.G1.notes"
    And G1 is NOT hard-blocked by this — human may proceed either way
```

### Feature: Phase Map (7 phases, GitHub MCP per phase)

```gherkin
Feature: Each phase has skills, gates, and GitHub MCP operations

  Scenario: Think exit produces domain vocabulary + pattern group
    Given ts-event-storming-facilitator runs a structured ES session
    When Think exits
    Then state.artifacts.domain_vocabulary records domain_events, commands,
      aggregates, bounded_contexts, problem_frame, acpl_pattern_group,
      ubiquitous_language
    And this flows into Plan (commands → scenario seeds) and Build (pattern
      group pre-selected)
    And G1 (STRIDE+OWASP+Semgrep+Trivy+privacy) is signed off by human

  Scenario: Plan exit creates a feature branch
    Given Spectra discuss→propose produced spec/ with Given/When/Then scenarios
    When Plan exits
    Then GitHub MCP create_branch(name="feat/<feature>", from="main") runs
    And state.artifacts.branch records the branch
    And Atlassian Rovo links the branch to the Jira issue

  Scenario: Build exit has committed code, coverage gate green
    Given Spectra apply implemented all scenarios using ts-acpl patterns
    And Semgrep/Trivy always-checks ran
    When Build exits
    Then GitHub MCP push_files committed to state.artifacts.branch with
      conventional-commit messages
    And TDD coverage gate >= threshold is green

  Scenario: Review exit opens a PR with inline findings
    Given code-review-graph ran incrementally during Build
    When Review exits
    Then GitHub MCP create_pull_request(head=branch, base=main) runs
    And create_review_comment posts code-review-graph findings inline
    And G1 is signed off (human)

  Scenario: Test exit updates PR with mutation score, G2 signed
    Given ts-mutation-analyst classified surviving mutants against
      acpl_pattern_group
    When Test exits
    Then GitHub MCP update_pull_request_review posts "Mutation: N% → PASS|FAIL"
    And G2 (mutation >= threshold, human sign-off) is recorded

  Scenario: Ship exit merges and tags a release
    When Ship exits
    Then GitHub MCP merge_pull_request(squash) + create_release(tag,
      body=Spectra changelog) runs
    And Atlassian Rovo transitions the Jira issue → Done

  Scenario: Reflect exit refines the registry
    When Reflect exits
    Then /ts-router refine runs (always-auto)
    And registry.json + registry.log are updated
```

---

## BUILD *(Spectra — implementation contracts)*

```gherkin
Feature: Skill package structure

  Scenario: Required files exist
    Given the ts-deliver-router.skill package is extracted
    Then the following exist:
      | file                                 |
      | SKILL.md                             |
      | SKILL_caveman.md                     |
      | README.md                            |
      | PROJECT_SETUP.md                     |
      | references/registry-schema.md        |
      | references/gate-checklists.md        |
      | references/phase-exit-contracts.md   |
      | references/setup-gaps.md             |
      | references/sub-agents.md             |
      | references/acpl-integration.md       |

  Scenario: SKILL.md and SKILL_caveman.md are content-equivalent
    Given SKILL.md is N words
    Then SKILL_caveman.md is approximately 35-45% of N words
    And both contain: 3 primitives, the Discovery Feedback Hook (with gating
      criteria a/b/c), all 7 phases, G1/G2 checklists, all 4 sub-agents

Feature: Router algorithm

  Scenario: Six-step routing logic
    Given any "what next" / "where am I" / phase-advance request
    Then the router performs, in order:
      1. Read .ai/ts-deliver-router/state.json (missing/stale → STOP)
      2. Read .ai/ts-deliver-router/registry.json (missing → prompt init);
         also read .ai/iteration.json and .ai/risks.md if present
      3. Verify current phase artifacts pass minimum-schema (fail → STOP)
      4. Consult CHECKS REGISTRY (run always, surface rec, enforce gate);
         [Think+Build only] evaluate Discovery Feedback Hook gating
      5. Respect DIAL (default MID)
      6. On phase exit: atomically write state.json (PHASE EXIT CONTRACT)

Feature: Setup gap detection

  Scenario: pending-setup tool relevant to current phase
    Given registry.json has an entry with tier=pending-setup for the current
      phase (e.g. GitHub MCP not configured, Review phase)
    When router routes for that phase
    Then router surfaces: "⚠ Setup gap: GitHub MCP is pending-setup but
      required for Review. Options: 1) resolve now 2) mark optional
      3) continue without (noted in state.json)"
```

---

## REVIEW *(Spectra — risk scenarios)*

```gherkin
Feature: Edge cases the router must catch

  Scenario: Unsigned security gate blocks Ship
    Given current_phase=ship, gates.sec-review.status=pending
    When router attempts phase exit
    Then router blocks: "Ship blocked: sec-review gate not signed"

  Scenario: HIGH auto-sign attempt is refused
    Given autonomy=HIGH, G2 checklist is 100% green
    When router reaches the G2 sign-off step
    Then router still pauses for human signature
    And does not write state.gates.G2.signed_by automatically

  Scenario: Schema version mismatch
    Given state.json.schema_version != "1"
    When router reads state.json
    Then router responds "phase unclear, manual review — schema version
      mismatch"

  Scenario: Discovery hook does not create duplicate ideas on repeated runs
    Given idea-007 (source_epic=EPIC-GL-CORE, "Tax API integration
      reliability") already exists from a prior Build run
    And the same unknown is encountered again in a later Build session
    When the hook fires again
    Then /ts-discover idea --from-router is called again
    And ts-project-planner's dedup check (Jaccard > 0.5) prevents a duplicate
      — this skill performs no dedup of its own

  Scenario: registry.json with legacy ids does not crash status
    Given registry.json contains a collection entry with an outdated tool id
    When /ts-router status runs
    Then router still functions
    And surfaces "registry.json contains legacy ids — run /ts-router refine"
```

---

## TEST *(Spectra apply — archive scenarios)*

All scenarios from PLAN, BUILD, and REVIEW constitute the test suite. Archived
at Test phase entry — no post-archive edits.

**Mutation targets:**

| Component | Target | Tool |
|---|---|---|
| State verification (missing/stale/invalid → STOP) | 100% | One test per condition |
| DIAL gate-pause enforcement (HIGH never auto-signs) | 100% | Both gates, both autonomy extremes |
| CHECKS REGISTRY type dispatch (always/gate/rec) | 100% | One per type |
| Discovery Feedback Hook gating (a)/(b)/(c) + "none met" | 100% | 4 tests |
| Hook failure handling (non-blocking) | 100% | Mock unavailable, assert continuation |
| GitHub MCP operation sequencing per phase | ≥ 85% | Stryker |
| Setup gap detection | ≥ 80% | Stryker |

---

## SHIP

```bash
# 1. Install
unzip ts-deliver-router.skill -d .claude/skills/ts-deliver-router/

# 2. First use in a project
/ts-router init
# → interview: project type, stack, lifecycle stage, mutation threshold,
#   security gates → writes .ai/ts-deliver-router/{state,autonomy,registry}.json

# 3. Drive the spine
"what next?"  →  Think (ts-event-storming-facilitator if tier=active)
...
/ts-router refine   # at Reflect, always-auto

# 4. Pre-flight anytime
/ts-router dry-run on
```

**Release checklist:**
```
[x] SKILL.md ↔ SKILL_caveman.md content-equivalent (~36% ratio)
[x] All 7 phases documented with GitHub MCP operations
[x] G1/G2 checklists complete in gate-checklists.md
[x] Discovery Feedback Hook documented with gating criteria + cross-refs
    in Think exit, Build always-checks, and G1 linkage
[x] 4 sub-agent build specs in sub-agents.md
[x] acpl-integration.md cross-references ts-acpl correctly
[x] PROJECT_SETUP.md paste-ready, no stale paths
```

---

## REFLECT

### Design decisions

| Decision | Alternatives considered | Chosen because |
|---|---|---|
| gstack spine, Spectra nested | Spectra-as-spine (original design) | gstack covers Ship/Reflect where governance/release/learning live; Spectra still defines artifacts |
| State as truth, never inferred | Infer phase from artifact presence | Inference's silent-failure mode (half-written spec) was the original motivating bug |
| `ingest` as sub-loop, not a phase | `ingest` as 6th/8th phase | Spec changes are event-triggered, not scheduled |
| Discovery Feedback Hook: push, gated, non-blocking | Poll-based; unfiltered "any unknown" | Preserves read-only boundary; prevents flooding Discovery with noise |
| `ts-deliver-router` append-only on discovery.json | Full read/write | Single point of decision authority stays with human via `/ts-discover decide` |
| Commands stay `/ts-router *` after rename | Rename to `/ts-deliver *` | "router" retained from `ts-deliver-router`; no command rename implied by the descriptive-prefix change |

### Known limitations

- Discovery Feedback Hook gating criteria (a)/(b)/(c) are evaluated by model
  judgment, not a deterministic rule engine — may need refinement after first
  real use, particularly distinguishing "new external dependency" from
  "existing dependency used differently."
- G1's Discovery linkage depends on `ts-project-planner` having processed a
  `--from-router` call before Review begins; if Discovery hasn't yet explored
  the new idea, G1 surfaces it in raw `status=idea` form with no
  `exploration_output`.
- code-graph/dev-graph registry rows (see `Ideas.md` §9) are analyzed but not
  merged — `incr-review` still references code-review-graph, not
  codegraph/Graphify.
- 4 sub-agents are specified (`references/sub-agents.md`) but not yet built as
  `.claude/agents/*.md` files.
