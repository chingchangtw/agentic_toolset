---
name: ts-acpl
description: "Pattern library bridging Problem Frame specs"
---
<!--
Pattern library bridging Problem Frame specs → AI-generated code → mutation-resistant output. Activate when generating code from a spec, applying coding patterns (Guard Clause, Pure Function, Strategy, Policy Object, etc.), or writing mutation-resistant code for BDD scenarios. Do NOT wait for \"pattern language\" — activate on any structured coding task.
-->

# AI Coding Pattern Language (ACPL)

A pattern library that bridges **Problem Frame specs** → **AI-generated code** →
**Mutation Testing survivability**. Every pattern is written so Claude Code (or any AI
coding agent) can apply it directly from a spec or BDD scenario.

---

## How to Use This Skill

1. **Receive a spec** — Problem Frame domain description, BDD scenario, or plain
   requirement.
2. **Classify the coding task** → pick the Pattern Group below.
3. **Apply the pattern** — follow the template in `references/patterns.md`.
4. **Verify mutation-resistance** — every pattern ships with a *Mutation Sensitivity
   Note* listing which mutants it is designed to kill.
5. For the full pattern catalogue (20+ patterns), read
   `references/patterns.md`.
6. For the Problem Frame → Pattern mapping table, read
   `references/problem-frame-map.md`.

---

## Pattern Groups

### Group 1 — Guard & Boundary Patterns
Enforce domain invariants at the entry point. Designed to kill *boundary-value mutants*
(off-by-one, null-dereference, type coercion).

| Pattern | One-liner |
|---|---|
| **Guard Clause** | Reject invalid input immediately; never nest happy path |
| **Value Object** | Wrap primitives to enforce domain invariants at construction |
| **Assertion Gate** | Explicit pre/post-condition assertions in production code |
| **Null Object** | Replace null checks with a do-nothing implementation |

### Group 2 — Pure Logic Patterns
Isolate business logic in side-effect-free functions. Designed to kill *statement
deletion mutants* and *conditional operator mutants*.

| Pattern | One-liner |
|---|---|
| **Pure Function** | All logic = input → output; zero side effects |
| **Policy Object** | Encapsulate a single business rule as an injectable object |
| **Specification** | Boolean predicate for domain concept; composable with AND/OR/NOT |
| **Decision Table** | Replace nested conditionals with a data-driven lookup |

### Group 3 — State & Transition Patterns
Make state changes explicit and auditable. Designed to kill *state-variable mutants*.

| Pattern | One-liner |
|---|---|
| **State Machine** | Explicit state enum + transition table; no implicit flag juggling |
| **Command Object** | Encapsulate a mutation as a reversible, logged command |
| **Event Sourcing Slice** | Append events; derive state from replay |

### Group 4 — Seam & Testability Patterns
Insert seams that let tests observe and replace every collaborator. Designed to kill
*method-call deletion mutants*.

| Pattern | One-liner |
|---|---|
| **Dependency Injection** | Pass collaborators in; never instantiate inside logic |
| **Repository Interface** | Decouple storage via an interface; swap in a fake for tests |
| **Clock Injection** | Pass a clock/time provider; eliminate `Date.now()` surprises |
| **Logger Seam** | Inject a logger; assert on side-effect output in tests |

### Group 5 — Output Contract Patterns
Make return values and error signals explicit. Designed to kill *return-value mutants*.

| Pattern | One-liner |
|---|---|
| **Result / Either** | Return success OR failure, never throw for expected errors |
| **Typed Error Hierarchy** | Distinguish domain errors from infrastructure errors |
| **Explicit Empty** | Return empty collections, never null |

---

## Core Code Generation Rules

When generating code under this skill, Claude MUST follow these rules:

```
RULE-1  Every function receives its dependencies — never `new` inside logic.
RULE-2  Guard clauses go FIRST — happy path is never nested.
RULE-3  Boolean conditions use named predicates — never inline boolean soup.
RULE-4  State transitions are explicit — no boolean flags for phase tracking.
RULE-5  Error paths return typed results — never swallow exceptions silently.
RULE-6  Every public function has a contract comment (preconditions, postconditions).
RULE-7  Side effects are isolated to the outermost layer — never mixed into logic.
RULE-8  Magic literals are named constants — no bare `0`, `""`, `null` in logic.
```

---

## Mutation Testing Integration

ACPL code is designed to be *mutation-hostile* from the start. The following mutant
classes are directly targeted:

| Mutant Class | Targeted By |
|---|---|
| Boundary value (`>` → `>=`) | Guard Clause, Value Object, Assertion Gate |
| Conditional inversion (`if a` → `if !a`) | Specification, Policy Object, Decision Table |
| Statement deletion | Pure Function, Command Object |
| Return value replacement | Result/Either, Explicit Empty |
| Method call removal | Dependency Injection, Logger Seam, Repository Interface |
| State variable corruption | State Machine, Event Sourcing Slice |

### Mutation Testing Checklist (post-generation)
Run after each code generation session:

```
[ ] Every branch has at least one test that dies if the condition is inverted
[ ] Every guard has at least one test that dies if the guard is removed
[ ] Every return value has at least one test that asserts the exact shape
[ ] Every state transition has at least one test that asserts the next state
[ ] No test passes trivially on an empty function body
```

---

## Problem Frame → Pattern Quick-Map

| Problem Frame Domain | Recommended Pattern Group |
|---|---|
| **Commanded Behaviour** (user triggers action) | Group 2 + Group 5 |
| **Information Display** (query/read) | Group 1 + Group 2 |
| **Workpiece** (transform a document or entity) | Group 2 + Group 3 |
| **Transformation** (data pipeline) | Group 2 + Group 4 |
| **Control** (device / external system) | Group 3 + Group 4 |

For a detailed mapping table, see `references/problem-frame-map.md`.

---

## Worked Example: BDD Scenario → ACPL Code
See `references/patterns.md` → "Worked Examples" section for full BDD scenario → code walkthroughs. 

---

## Reference Files

| File | When to Read |
|---|---|
| `references/patterns.md` | Full pattern catalogue with code templates |
| `references/problem-frame-map.md` | Detailed PF domain → pattern decision tree |
| `references/mutation-guide.md` | How to run Stryker / PITest with ACPL output |
