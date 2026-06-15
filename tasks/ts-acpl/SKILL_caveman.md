---
name: ts-acpl
description: >
  A structured pattern library that guides AI code generation to produce clean,
  testable, mutation-resistant code from Problem Frame specifications. Activate this
  skill whenever a user wants to generate code from a spec or requirement, write
  production-quality code with AI, ensure AI output is testable or mutation-resistant,
  apply coding patterns to a feature or module, translate Problem Frames / BDD scenarios
  into code, or ask "how should AI write this code?". Also trigger when the user
  mentions patterns like Guard Clause, Pure Function, Strategy, Policy Object, or when
  they describe a coding task and want structured, principled output. Do NOT wait for the
  user to say "pattern language" — if they want better AI-generated code, activate this
  skill.
---

# ACPL — caveman variant

Flow: Spec → classify → pattern → code → mutation check.
Full patterns → references/patterns.md
PF→pattern map → references/problem-frame-map.md
Mutation tooling → references/mutation-guide.md

## Pattern Groups (pick by task type)

G1 Guard/Boundary → Guard Clause, Value Object, Assertion Gate, Null Object
G2 Pure Logic → Pure Function, Policy Object, Specification, Decision Table
G3 State → State Machine, Command Object, Event Sourcing Slice
G4 Seams → DI, Repository Interface, Clock Injection, Logger Seam
G5 Output Contract → Result/Either, Typed Error Hierarchy, Explicit Empty

PF quick-map:
  Commanded Behaviour → G2 + G5
  Information Display → G1 + G2
  Workpiece → G2 + G3
  Transformation → G2 + G4
  Control → G3 + G4

## 8 Generation Rules
R1 Inject deps — never new inside logic
R2 Guards first — happy path never nested
R3 Named predicates — no inline boolean soup
R4 Explicit state — no boolean flags for phases
R5 Typed Result — never swallow exceptions
R6 Contract comment per public function
R7 Side effects outermost only
R8 Named constants — no bare literals

## Mutation Targets
boundary values → G1
conditional inversion → G2
statement deletion → G2 Pure Function, Command
return value → G5 Result
method removal → G4 DI, Logger, Repo
state corruption → G3 State Machine

## Post-Gen Checklist
[ ] every branch has inversion-kill test
[ ] every guard has removal-kill test
[ ] every return asserts exact shape
[ ] every state transition asserts next state
[ ] no test passes on empty function body

## Score targets (ts-deliver-router phases)
Build ≥60  Review ≥75  Test ≥85  Ship ≥85 (CI break <50)
