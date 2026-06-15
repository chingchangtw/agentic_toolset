# ts-acpl — New Skill PRD
**Format:** gstack THINK → Spectra PLAN / BUILD / REVIEW → Spectra TEST → SHIP → REFLECT
**Type:** New Development
**Skill:** `ts-acpl` (AI Coding Pattern Language)
**Date:** 2026-06-14
**Status:** Implemented — this PRD documents the as-built design
**Companion docs:** `Ideas.md` (design rationale, §8), `ts-deliver-router-prd.md`
(Build-phase caller, Test-phase consumer)

---

## THINK *(gstack — problem framing)*

### What problem does this skill solve?

AI agents generate code that *passes line coverage* but dies easily under
mutation testing — boundary conditions off by one, conditionals invertible
with no test noticing, return values that could be anything and nothing would
fail. The gap isn't "the code is wrong"; it's that **the code was never
written with a kill-list in mind**. `ts-acpl` is a pattern library that closes
that gap at generation time: every pattern ships with a *Mutation Sensitivity
Note* — the specific mutant classes it's designed to kill — so code is
mutation-resistant *from the first generation*, not patched after a Stryker
run reveals gaps.

### Core identity

`ts-acpl` bridges three things that are normally disconnected:

```
Problem Frame spec / BDD scenario
        │
        ▼  (Problem Frame → Pattern Group quick-map)
20 patterns across 5 groups
        │
        ▼  (8 core generation rules, always applied)
Generated code
        │
        ▼  (Mutation Sensitivity Notes predict what Stryker/PITest will test)
Mutation testing result
```

### The 5 pattern groups

| Group | Focus | Kills |
|---|---|---|
| **1 — Guard & Boundary** (Guard Clause, Value Object, Assertion Gate, Null Object) | Enforce invariants at entry | Boundary-value mutants (off-by-one, null-deref, type coercion) |
| **2 — Pure Logic** (Pure Function, Policy Object, Specification, Decision Table) | Side-effect-free business logic | Statement-deletion, conditional-operator mutants |
| **3 — State & Transition** (State Machine, Command Object, Event Sourcing Slice) | Explicit, auditable state changes | State-variable mutants |
| **4 — Seam & Testability** (Dependency Injection, Repository Interface, Clock Injection, Logger Seam) | Replaceable collaborators | Method-call-deletion mutants |
| **5 — Output Contract** (Result/Either, Typed Error Hierarchy, Explicit Empty) | Explicit return/error signals | Return-value mutants |

Plus 2 DDD/external-API bonus patterns: **Aggregate Root**, **Anti-Corruption
Layer**.

### The 8 core generation rules

```
RULE-1  Every function receives its dependencies — never `new` inside logic.
RULE-2  Guard clauses go FIRST — happy path is never nested.
RULE-3  Boolean conditions use named predicates — never inline boolean soup.
RULE-4  State transitions are explicit — no boolean flags for phase tracking.
RULE-5  Error paths return typed results — never swallow exceptions silently.
RULE-6  Every public function has a contract comment (pre/postconditions).
RULE-7  Side effects are isolated to the outermost layer.
RULE-8  Magic literals are named constants.
```

These apply to **all** code generated under this skill, regardless of which
pattern group is in play — they're the floor, not a menu item.

### Forcing questions

**Q: Why a pattern *library* rather than just "write clean code" instructions?**
"Write clean code" is unfalsifiable — an agent can claim compliance without a
checkable artifact. A named pattern is checkable: either the function takes
its dependencies via constructor injection (Dependency Injection) or it
doesn't. Patterns convert a style preference into a structural fact that
mutation testing can verify.

**Q: Why is mutation testing the validation signal, not just test coverage?**
Line coverage answers "was this code executed by a test." Mutation testing
answers "would a test *notice* if this code were subtly wrong." The original
motivating problem (AI-generated code that's "covered" but fragile) is a
mutation-testing problem, not a coverage problem — so the pattern library's
success criterion has to be mutation score, and each pattern's documentation
has to say *which* mutants it targets.

**Q: Why does this live in a separate skill from `ts-deliver-router` rather
than being inlined into the Build phase description?**
Separation of concerns mirrors Core 4: the *spine* (`ts-deliver-router`) is
invariant across projects and paradigms; the *coding discipline* (`ts-acpl`)
is, in principle, swappable — a different pattern language for a different
paradigm (e.g. a functional-first or embedded-systems pattern set) could
replace it without touching the spine. In the current Core 4, `ts-acpl` is
"always active," but architecturally it remains a dependency.

**Q: Why include DDD/external-API bonus patterns (Aggregate Root,
Anti-Corruption Layer) outside the 5 groups?**
They don't map cleanly to a single mutant class the way the core 18 do —
Aggregate Root is more about consistency-boundary correctness than a specific
mutation, and Anti-Corruption Layer is about translation-boundary correctness.
Keeping them as labeled "bonus" patterns rather than forcing a 6th group
avoids diluting the mutation-class framing that defines groups 1-5.

### Design document output

```
Identity:        Build-phase coding discipline, part of Core 4
Patterns:        20 total — 18 in 5 mutant-class-aligned groups + 2 DDD/API bonus
Rules:           8 core generation rules, always applied
Entry points:    Problem Frame / BDD scenario → pattern group selection
                 → ts-acpl-disciplined code generation
Integration:     Think (ts-event-storming-facilitator) → acpl_pattern_group
                 → Build (pattern application) → Test (ts-mutation-analyst
                 maps surviving mutants back to missing pattern/test)
Mutation targets:per-stage (spike 60% → maintenance 90%), per
                 ts-deliver-router's lifecycle-stage table
```

---

## PLAN *(Spectra — scenarios as spec)*

### Feature: Problem Frame → Pattern Group Selection

```gherkin
Feature: Classify a Problem Frame and select pattern groups

  Scenario: Commanded Behaviour → Groups 2+5
    Given a spec describes "user submits a bulk request; system processes
      each entry and reports success/failure per entry"
    When ts-acpl classifies this against problem-frame-map.md
    Then the Problem Frame is "Commanded Behaviour"
    And the recommended pattern groups are Group 2 (Pure Logic) + Group 5
      (Output Contract)
    And the decision tree further recommends Result/Either for "return
      success/failure to caller"

  Scenario: Information Display → Groups 1+2
    Given a spec describes "show current account balance, never show null for
      a missing account"
    When ts-acpl classifies this
    Then the Problem Frame is "Information Display"
    And recommended groups are Group 1 (Guard & Boundary) + Group 2 (Pure
      Logic)
    And the decision tree recommends Explicit Empty + Null Object for "output
      must never return null"

  Scenario: Workpiece → Groups 2+3
    Given a spec describes "user edits a draft invoice through multiple save
      states before submission"
    When ts-acpl classifies this
    Then the Problem Frame is "Workpiece"
    And recommended groups are Group 2 (Pure Logic) + Group 3 (State &
      Transition)
    And State Machine is recommended for the draft→submitted lifecycle

  Scenario: acpl_pattern_group flows from Think to Build
    Given ts-event-storming-facilitator (in ts-deliver-router's Think phase)
      classified the epic's Problem Frame and wrote
      state.artifacts.acpl_pattern_group = "G2+G5"
    When Build phase begins
    Then ts-acpl reads state.artifacts.acpl_pattern_group directly
    And does not re-run Problem Frame classification
    And applies Group 2 (Pure Logic) + Group 5 (Output Contract) patterns to
      the scenarios being implemented
```

### Feature: 8 Core Generation Rules Applied

```gherkin
Feature: Every generated function follows the 8 rules regardless of pattern group

  Scenario: Guard clauses precede happy path (RULE-2)
    Given a function validates an IssueKey before processing it
    When ts-acpl generates the function body
    Then the invalid-input check and early return appear before any
      processing logic
    And no processing logic is nested inside an `if (valid)` block

  Scenario: Dependencies are injected, not constructed (RULE-1)
    Given a function needs a Jira API client
    When ts-acpl generates the containing class
    Then the Jira client is a constructor parameter
    And no `new JiraClient(...)` appears inside any method body

  Scenario: Error paths return typed results (RULE-5)
    Given a function can fail validation
    When ts-acpl generates the function signature
    Then the return type is Result<T, ValidationError> (or equivalent typed
      union)
    And no bare `throw` is used for an expected validation failure

  Scenario: Magic literals are named (RULE-8)
    Given a regex validates issue key format
    When ts-acpl generates the validation
    Then the regex is bound to a named constant (e.g. ISSUE_KEY_REGEX)
    And not inlined as a literal inside the conditional
```

### Feature: Mutation Sensitivity Notes Predict Test Gaps

```gherkin
Feature: Each pattern documents which mutants it kills

  Scenario: Guard Clause kills boundary-value mutants
    Given a function uses Guard Clause to reject input where length > 100
    When Stryker mutates `> 100` to `>= 100`
    Then a test asserting the function rejects input of length exactly 101
      (and accepts exactly 100) kills this mutant
    And references/patterns.md documents this as Guard Clause's targeted
      mutant class

  Scenario: Result/Either kills return-value mutants
    Given a function returns Result<IssueKey, ValidationError>
    When Stryker mutates the success branch to return a different shape
    Then a test asserting the exact Ok(IssueKey) shape (not just "truthy")
      kills this mutant
    And references/patterns.md documents this as Result/Either's targeted
      mutant class

  Scenario: Post-generation mutation checklist
    Given code generation for a feature is complete
    When the post-generation checklist runs
    Then it verifies:
      [ ] every branch has a test that dies if the condition is inverted
      [ ] every guard has a test that dies if the guard is removed
      [ ] every return value has a test asserting the exact shape
      [ ] every state transition has a test asserting the next state
      [ ] no test passes trivially on an empty function body
```

### Feature: Integration with ts-deliver-router Test Phase

```gherkin
Feature: ts-mutation-analyst maps surviving mutants back to patterns

  Scenario: Surviving mutant classified and fixed
    Given Stryker reports a surviving mutant: conditional `>` → `>=` in
      IssueKey.create, not killed by any test
    And state.artifacts.acpl_pattern_group = "G1+G2"
    When ts-mutation-analyst (in ts-deliver-router's Test phase) classifies
      this mutant
    Then it maps the mutant class (boundary value) to the responsible pattern
      (Guard Clause / Value Object, both in Group 1)
    And outputs a priority_fix: { location: "IssueKey.create:line 5",
      missing_test: "reject length exactly at boundary", pattern: "Value
      Object", kills: "boundary mutant >  →  >=" }

  Scenario: Mutation score target by lifecycle stage
    Given a project is in lifecycle stage "active"
    When ts-deliver-router's Test phase G2 gate evaluates mutation score
    Then the threshold is 75% (per ts-deliver-router's lifecycle stage →
      default collection table)
    And ts-acpl's mutation-guide.md documents how this threshold maps to
      per-pattern-group expectations
```

### Feature: Worked Example (BDD Scenario → Code)

```gherkin
Feature: A full worked example demonstrates pattern selection end-to-end

  Scenario: Bulk Jira request with one invalid entry
    Given the BDD scenario:
      """
      Given a bulk Jira REST request list with 3 entries
      When one entry has an invalid issue key format
      Then the executor rejects that entry with a typed ValidationError
        And the remaining 2 entries are processed
      """
    When ts-acpl selects patterns
    Then it selects Guard Clause + Value Object (IssueKey.create validates at
      construction), Pure Function (partitionRequests has zero side effects),
      Result/Either (Ok/Err per entry), and Repository Interface
      (BulkExecutor receives JiraClient via DI)
    And the generated code's mutation targets cover: boundary (regex guard),
      statement-deletion (reduce's accumulator), return-value (Result shape),
      method-removal (injected client)
```

---

## BUILD *(Spectra — implementation contracts)*

```gherkin
Feature: Skill package structure

  Scenario: Required files exist
    Given the ts-acpl.skill package is extracted
    Then the following exist:
      | file                                |
      | SKILL.md                            |
      | SKILL_caveman.md                    |
      | README.md                           |
      | references/patterns.md              |
      | references/problem-frame-map.md     |
      | references/mutation-guide.md        |

  Scenario: patterns.md contains all 20 patterns with templates + sensitivity notes
    Given references/patterns.md
    Then it contains a table of contents listing all 20 patterns
    And each pattern has: a code template, a one-line description, and a
      Mutation Sensitivity Note naming its targeted mutant class(es)

  Scenario: problem-frame-map.md contains the full decision tree
    Given references/problem-frame-map.md
    Then it defines the 5 Problem Frames (Commanded Behaviour, Information
      Display, Workpiece, Transformation, Control)
    And provides a decision tree from each frame to specific pattern
      recommendations

  Scenario: mutation-guide.md covers all supported languages
    Given references/mutation-guide.md
    Then it lists mutation tools for TypeScript/JS (Stryker), Java (PITest),
      Python (mutmut), Go (go-mutesting), C# (Stryker.NET)
    And documents the ts-deliver-router phase → mutation score target mapping
      (README.md "Mutation Score Targets" section, kept consistent with
      ts-deliver-router's lifecycle-stage table)

Feature: SKILL.md / SKILL_caveman.md content equivalence

  Scenario: Caveman retains all 5 groups, 8 rules, problem-frame quick-map
    Given SKILL.md documents 5 pattern groups (with per-pattern one-liners),
      8 core rules, mutation testing integration, and the Problem Frame quick-map
    Then SKILL_caveman.md contains the same 5 groups (condensed table), the
      same 8 rules verbatim (they're already terse), the same quick-map
    And SKILL_caveman.md is approximately 30% of SKILL.md's word count
```

---

## REVIEW *(Spectra — risk scenarios)*

```gherkin
Feature: Pattern application risk coverage

  Scenario: Pattern overkill on trivial code
    Given a one-line getter function with no branching, no I/O, no state
    When ts-acpl is consulted for this function
    Then no pattern group is forced onto it — RULE-1 through RULE-8 still
      apply (e.g. it's still a pure function with no hidden `new`), but no
      Guard Clause / State Machine / Repository Interface is fabricated where
      there is no boundary, state, or collaborator to seam
    And references/patterns.md frames patterns as applicable-when-relevant,
      not mandatory-everywhere

  Scenario: Pattern groups can combine without conflict
    Given a feature spans multiple Problem Frame characteristics (e.g. a
      Workpiece with Commanded Behaviour triggers)
    When ts-acpl selects pattern groups
    Then multiple groups can be selected together (e.g. "G2+G3" or "G1+G2+G5")
    And the worked example demonstrates 4 patterns from 3 different groups
      applied to one scenario without conflict

  Scenario: Mutation score target mismatch surfaced, not silently accepted
    Given a project's registry.json mutation threshold is 85% (stabilizing
      stage) but the current epic's actual score is 78%
    When ts-deliver-router's G2 gate evaluates
    Then the gate is RED — ts-acpl does not redefine or lower the threshold;
      ts-mutation-analyst's priority_fixes are the remediation path

  Scenario: Bonus patterns (Aggregate Root, Anti-Corruption Layer) used
    only when DDD/external-API context applies
    Given a feature has no external API boundary and no DDD aggregate
    When ts-acpl selects patterns
    Then Anti-Corruption Layer and Aggregate Root are not forced into the
      selection — they're scoped to their stated contexts (DDD bonus,
      External API bonus) in patterns.md's table of contents
```

---

## TEST *(Spectra apply — archive scenarios)*

All scenarios from PLAN, BUILD, and REVIEW constitute the test suite for this
skill's own guidance correctness. Archived at Test phase entry.

**Mutation targets (for code generated *under* this skill's guidance, as
verified by the worked example and any project adopting it):**

| Component | Target | Verified by |
|---|---|---|
| Guard Clause boundary checks | 100% kill rate on boundary mutants | Stryker/PITest/mutmut per worked example |
| Pure Function statement-deletion resistance | 100% kill rate on deletion mutants | per Mutation Testing Checklist |
| Result/Either return-shape assertions | 100% kill rate on return-value mutants | per Mutation Testing Checklist |
| Dependency Injection seams | 100% kill rate on method-call-removal mutants | per Mutation Testing Checklist |
| State Machine transition assertions | 100% kill rate on state-variable mutants | per Mutation Testing Checklist |

**Meta-target for this skill's own documentation:**

| Check | Target |
|---|---|
| All 20 patterns have a Mutation Sensitivity Note | 100% — checked at BUILD |
| Problem Frame decision tree covers all 5 frames with ≥1 pattern recommendation each | 100% |
| SKILL.md ↔ SKILL_caveman.md content equivalence | ~30% ratio, same groups/rules/quick-map |

---

## SHIP

```bash
# 1. Install (works alongside ts-deliver-router, which activates it during Build)
unzip ts-acpl.skill -d .claude/skills/ts-acpl/

# 2. Used automatically during ts-deliver-router's Build phase:
#    - Think phase already wrote state.artifacts.acpl_pattern_group
#    - Build phase reads it, ts-acpl applies the corresponding pattern groups
#    - Test phase: ts-mutation-analyst maps surviving mutants back to patterns

# 3. Standalone use (no ts-deliver-router):
#    "I have this spec/BDD scenario — what patterns should I use?"
#    → ts-acpl classifies Problem Frame, recommends groups, applies 8 rules
```

**Release checklist:**
```
[x] All 20 patterns documented with templates + Mutation Sensitivity Notes
[x] Problem Frame → Pattern Group quick-map + full decision tree
[x] 8 core generation rules stated verbatim in both SKILL.md and caveman
[x] Worked example (BDD scenario → code) demonstrates multi-group combination
[x] mutation-guide.md covers 5 languages + ts-deliver-router score-target
    cross-reference
[x] SKILL.md ↔ SKILL_caveman.md content-equivalent (~30% ratio)
[x] README.md "Mutation Score Targets" section names ts-deliver-router phases
    consistently with ts-deliver-router-prd.md
```

---

## REFLECT

### Design decisions

| Decision | Alternatives considered | Chosen because |
|---|---|---|
| Pattern library, not "write clean code" prose | General style guide | Patterns are checkable structural facts; style preferences aren't |
| Mutation score as success criterion | Line/branch coverage | The motivating problem (fragile-but-covered code) is specifically a mutation-testing gap |
| Separate skill from ts-deliver-router | Inline Build-phase rules | Mirrors Core 4 separation: spine is invariant, coding discipline is (in principle) swappable |
| 18 patterns in 5 mutant-class-aligned groups + 2 unaligned bonus patterns | Force Aggregate Root / Anti-Corruption Layer into a 6th group | They don't map to a single mutant class the way groups 1-5 do; forcing it would dilute the framing |
| 8 rules apply universally, patterns apply contextually | All patterns mandatory on every function | Pattern overkill on trivial code (e.g. a one-line getter) adds no mutation-resistance value |

### Known limitations

- **Pattern selection currently relies on `ts-event-storming-facilitator`'s**
  **Problem Frame classification** (via `ts-deliver-router`'s Think phase). If
  that sub-agent isn't built yet, `acpl_pattern_group` must be set manually by
  walking `problem-frame-map.md`'s decision tree — functional but not
  automatic.
- **Mutation Sensitivity Notes describe *intended* kill behavior**, not a
  guarantee — actual kill rates depend on the test suite the agent generates
  alongside the pattern-applied code; the post-generation checklist is the
  enforcement mechanism, not the pattern definitions themselves.
- **Language coverage in mutation-guide.md is uneven** — Stryker (TS/JS) and
  PITest (Java) are mature; go-mutesting and Stryker.NET entries are listed
  but less battle-tested in this design's worked examples (all of which are
  TypeScript).
- **No automated check that a project's registry.json mutation threshold
  matches ts-acpl's per-stage expectations** — this is a manual
  cross-reference between `ts-acpl`'s README and `ts-deliver-router`'s
  lifecycle-stage table; a future refinement could have `/ts-router refine`
  validate this automatically.
