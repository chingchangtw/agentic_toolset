# ACPL Integration Guide

How the `ts-acpl` skill integrates into each
ts-deliver-router phase.

---

## Think — Problem Frame Classification

**ACPL entry point:** `references/problem-frame-map.md`

At the end of Think, the router records `acpl_pattern_group` in `state.json`.
This value flows into Build as the pattern selection starting point.

```
PF classified as "Commanded Behaviour"
→ state.artifacts.acpl_pattern_group = "G2+G5"
→ Build phase opens with: "Pattern groups G2 (Pure Logic) + G5 (Output Contract) active"
```

**Trigger signal from spec:**
Any of these phrases in the domain description → check `problem-frame-map.md`:
"user triggers", "display", "edit/create", "convert/transform", "control/manage"

---

## Plan — Pattern Group Confirmation

During Spectra `propose`, the router surfaces the recommended pattern group and
invites adjustment before scenarios are written.

```
Router: "ACPL recommendation for this feature:
  Problem Frame: Commanded Behaviour
  Pattern groups: G2 (Pure Function, Policy Object, Specification) + G5 (Result/Either)
  Confirm or override before writing scenarios?"
```

This means BDD scenarios can be written *knowing* which patterns will implement them,
so the Then clauses naturally assert typed Results, named predicates, etc.

---

## Build — Primary Coding Discipline

**ACPL is the primary skill for all code generation in Build.**

Before generating any function or class:
1. Check `state.artifacts.acpl_pattern_group`
2. Apply the 8 Core Generation Rules (RULE-1 through RULE-8)
3. Select the specific pattern from `references/patterns.md`
4. Generate code skeleton with mutation targets noted inline

**8 Rules as Claude Code project instructions snippet:**
```
## ACPL Code Generation Rules (enforced in Build)
R1: Inject deps — never `new` inside logic
R2: Guards first — happy path never nested
R3: Named predicates — no inline boolean soup
R4: Explicit state — no boolean flags for phases
R5: Typed Result — never swallow exceptions
R6: Contract comment per public function
R7: Side effects outermost only
R8: Named constants — no bare literals
```

---

## Review — Pattern Coverage Verification

Before G1 sign-off, the router checks:

```
ACPL Pattern Coverage:
[ ] All public functions have contract comments (R6)
[ ] No `new` inside business logic (R1)
[ ] No inline boolean expressions (R3)
[ ] All error paths return Result/Either (R5)
[ ] State changes via explicit State Machine (R4)
[ ] No bare null returns (Explicit Empty pattern)

For each pattern applied, verify the Mutation Sensitivity Note requirements:
[ ] Guard Clause: boundary test exists (e.g. input=0 test)
[ ] Value Object: invalid-input tests exist
[ ] State Machine: illegal-transition test exists
[ ] Result/Either: error-path assertion exists
```

The `ts-ddd-tactical-validator` sub-agent (if active) supplements this with DDD
alignment checks.

---

## Test — Mutation Sensitivity Verification

The `ts-mutation-analyst` sub-agent reads the Stryker/PITest/mutmut report and maps
each surviving mutant back to a missing ACPL pattern test:

```
Surviving mutant: src/domain/IssueKey.ts:14 — boundary on regex
→ Pattern: Guard Clause
→ Missing test: IssueKey.create("INVALID") returns Err(ValidationError)
→ Add to spec: Given invalid issue key format, When create called, Then ValidationError returned
```

This creates a direct feedback loop:
**Surviving mutant → ACPL pattern → missing Spectra scenario → fix in Test phase**

---

## Reflect — Pattern Library Update

After each cycle, the Reflect phase prompts:

```
ACPL retrospective:
- Which patterns were applied this cycle? [list from Build phase state]
- Which patterns had surviving mutants? [from ts-mutation-analyst report]
- Any new domain patterns discovered that should be added to references/patterns.md?
- Should the Problem Frame classification be updated for next cycle?
```

If new patterns are discovered, `/skill-creator` is triggered to formalize them
into `references/patterns.md` following the standard 6-section format:
Intent / Structure / Code Template / Test Strategy / Mutation Sensitivity Note.

---

## ACPL + Spectra Scenario Alignment

The strongest combination: write Spectra scenarios *using* ACPL pattern vocabulary.

**Weak scenario (pattern-agnostic):**
```gherkin
Given an invalid request
When processed
Then an error occurs
```

**Strong scenario (ACPL-aligned):**
```gherkin
Given a bulk Jira request with issue key "INVALID KEY FORMAT"
When the BulkExecutor processes the request list
Then the executor returns Err(ValidationError) for that entry
  And the error.code equals "VALIDATION_ERROR"
  And the remaining valid entries are processed
```

The strong version:
- Names the Result/Either shape (`Err(ValidationError)`)
- Names the error code (typed error hierarchy)
- Asserts partial success (Explicit Empty — remaining entries processed)
- Kills: return-value mutant, error-type mutant, statement-deletion mutant

**Rule of thumb:** Every Then clause should be assertable at the type level.
If a Then clause could be satisfied by an empty function body, rewrite it.
