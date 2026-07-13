# PRD — PLDD: Multi-Scale Pattern-Language-Driven Development

| | |
|---|---|
| Status | PROPOSED — review, cut sections, then split into openspec changes |
| Target repo | `agenticToolset` (src/ deliverable, dogfooded via existing pipeline) |
| Audience | Tony (approve/cut/answer OQs) + future Sonnet-class sessions (execute) |
| Governing constraint | **Add rigour, never add scope.** 7-phase spine, router algorithm, G1/G2, state sovereignty: untouched. All additions = new skills, agents, artifacts, registry rows, schema fields. |
| Format rule | Every shipped PLDD artifact obeys the dual-file invariant (SKILL.md + SKILL_caveman.md) and the Sonnet-runnability rule (§3.1). |

---

## 1. WHY (problem statement)

Evidence from current design, not theory:

1. **Enforcement gap.** The hub constrains *workflow* (phases, gates, state) but not *code shape*. Nothing today mechanically stops an AI from putting SQL in a domain entity, importing a framework into a use case, or inventing a fourth way to handle errors. `eslint` appears in `package.json` scripts but is not in devDependencies and has no config; no dependency-cruiser exists. Architecture conformance is currently 100% human review — the most expensive, least reliable check.
2. **Requirements→test gap.** `ts-event-storming-facilitator` already produces a machine-readable domain model (`domain_events`, `commands`, `aggregates`, `bounded_contexts`), but nothing compiles it into BDD acceptance scenarios. Scenarios are hand-written in Spectra propose; coverage of the event model is unmeasured.
3. **Weak-model economics.** After this session the hub is operated by Sonnet-class models. A weak model executing a *recipe with red/green checks* outperforms a strong model exercising *judgement without checks*. Today too much conformance lives in judgement.
4. **Review bottleneck.** The human role is "AI output reviewer" — every generated diff needs architectural judgement. Target role: "AI system conductor" — judgement is compiled once into constraints; per-diff review shrinks to what machines can't check.

**Core thesis (the one design idea):** each constraint scale removes a class of hallucination *before generation or at check time*. Five nested scales, each smaller than the last:

```
S1 Requirements  Event Storm → compiled BDD scenarios     kills: wrong feature
S2 Architecture  CA + DDD + light CQRS, machine-enforced  kills: wrong placement/dependency
S3 Agent         role cards with context diets            kills: wrong context → drift
S4 Code          ts-acpl patterns (exists), layer-bound   kills: wrong implementation shape
S5 Contract      DbC pre/post/invariant, test-enforced    kills: wrong local behavior (silent)
```

The solution space that survives all five filters is small enough that a Sonnet-class model lands inside it by default.

---

## 2. North star and non-goals

**North star:** a feature travels event-storm → scenarios → placement → contracts → code with every hop either machine-checked (exit code) or binary-checklisted, so that human attention is spent only on domain decisions and gate sign-offs (G1/G2 stay human at every autonomy level).

**Non-goals (explicit, to protect scope):**
- NG1: No new phases, no router changes, no new top-level gates. PLDD nests inside existing phases exactly like Spectra does.
- NG2: No event sourcing in v1 (deferred — §11).
- NG3: No replacement of ts-acpl. It keeps small-scale ownership; it gains one column (F4).
- NG4: agenticToolset's own `src/` is NOT retrofitted to Clean Architecture — it is a distribution framework, not a layered domain app. PLDD enforcement targets *end-user projects* (scaffold + installed toolset) and the dogfood fixture (OQ-1).
- NG5: No ezSpec port. Spectra/OpenSpec scenario format is the single BDD carrier (per decision 2026-07-07).

---

## 3. Design model

### 3.1 The Sonnet-runnability rule (meta-requirement on ALL PLDD artifacts)

Every normative rule shipped by PLDD MUST declare exactly one `enforcement` class:

| class | meaning | example |
|---|---|---|
| `cmd` | a command whose exit code decides | `npm run arch:check` |
| `schema` | JSON schema validation decides | `exploration_output` schema |
| `checklist` | binary item with a countable criterion | "every command has ≥1 scenario: count them" |
| `template` | fill-in structure with placeholders + self-check footer | pattern card, prompt template |

A rule with no enforcement class is a **defect** ("abstract requirement = unwritten text"). This is itself checkable: every rule table ships with an `enforcement` column; a missing value fails review.

### 3.2 What already exists vs. gap (grounding — do not rebuild)

| Scale | Exists today | Gap PLDD fills |
|---|---|---|
| S1 | `ts-event-storming-facilitator` agent → `exploration_output` JSON in `.agents/discovery.json`; Spectra propose scenarios (hand-written) | **Compiler**: exploration_output → scenario skeletons + coverage check (F1) |
| S2 | `problem_frame` + `acpl_pattern_group` in state.json; `ts-ddd-tactical-validator` Mode A/B | **Structural spec + machine guard**: layer map, dependency rules, arch pattern cards (F2) |
| S3 | 2 agents with output contracts + read-only tool frontmatter (house style already right) | **Role-card standard + build-line agents** (F3) |
| S4 | `ts-acpl` 20 patterns / 5 groups, mutation-sensitivity notes, problem-frame map | **Layer binding column** only (F4) |
| S5 | ACPL "Assertion Gate" pattern (per-pattern advice) | **Repo-wide DbC convention**: contracts util + violation-test rule + mutation wiring (F5) |
| — | Registry rows with `<SAST tool>`, `<mutation tool>`, `coverage >= <X>%` placeholders | Fill with real stack (F9) |
| — | SKILL-PATCH-RETRO protocol for skills | Same trigger discipline for patterns (F8) |

### 3.3 Toolset inventory (what ships)

```
src/skills/ts-pl/                    NEW skill — pattern-language owner
  SKILL.md + SKILL_caveman.md        entry, scale index, lazy-load pointers
  references/arch-cards.md           S2 pattern cards (9 cards, v1)
  references/layers-map.md           layers.map.json spec + depcruise generation rule
  references/scenario-compile.md     S1 compile rules
  references/contracts.md            S5 DbC convention + violation-test rule
  references/agent-cards.md          S3 role-card format
  references/templates/              F6 prompt templates (one file per template)
  references/evolution.md            F8 feedback protocol
src/agents/ts-bdd-scenario-writer.md     NEW (F1)
src/agents/ts-arch-guard.md              NEW (F2, Review station)
src/agents/ts-contract-writer.md         NEW (F5, Build station)
src/utils/contracts.ts                   NEW (F5) — require/ensure/invariant
src/scripts/gen-depcruise.mjs            NEW (F2) — layers.map.json → .dependency-cruiser.cjs
src/project_root_structure/.agents/pl/   NEW scaffold seeds: layers.map.json.example,
                                         pattern-feedback.jsonl (empty)
ts-deliver-router registry rows          F9 (append-only; see each feature)
```

Naming: skill = `ts-pl` (short, matches `ts-*` family; "PLDD" reserved for the method name). OQ-6 if you prefer `ts-pldd`.

---

## 4. Features (SDD sections — each independently reviewable/cuttable)

---

### F1 — Scenario Compiler (S1: requirements constraint)

**WHY:** the domain model is already structured JSON; leaving scenario writing free-form throws away that structure and makes coverage unmeasurable. Compiling events→scenarios means a weak model *fills templates* instead of *inventing tests*, and "did we cover the spec?" becomes a count, not an opinion.

**Design:** deterministic skeletons by script, domain detail by agent. A script (`gen-scenarios.mjs`) emits one scenario skeleton per (command, aggregate) pair; the `ts-bdd-scenario-writer` agent fills GIVEN/THEN from ubiquitous language. Split rationale: skeleton generation must be deterministic (weak-model-proof); only the domain prose needs a model.

#### Requirement: exploration_output compiles to scenario skeletons
`src/scripts/gen-scenarios.mjs` SHALL read an `exploration_output` JSON and emit one OpenSpec scenario skeleton per (command, aggregate) pair into the active change's spec delta.

#### Scenario: every command produces a skeleton
- **WHEN** `gen-scenarios.mjs` runs on an exploration_output with N commands
- **THEN** output contains exactly N `#### Scenario:` blocks, each named `<Command> on <Aggregate>`, each with `WHEN <Command>` pre-filled and `GIVEN`/`THEN` as `<FILL: ...>` placeholders

#### Scenario: every domain event is asserted somewhere
- **WHEN** scenario filling is complete and the coverage check runs
- **THEN** every entry in `domain_events[]` appears in at least one THEN clause, else the check prints the missing events and exits non-zero

#### Scenario: hotspots become open questions, never silent
- **WHEN** exploration_output contains unresolved hotspot/assumption entries
- **THEN** each is emitted as an `## Open Questions` bullet in the change proposal (enforcement: `cmd` — compiler does it; absence of section with nonempty assumptions fails)

**Where it nests:** Plan phase, inside Spectra `propose` (scenarios are delivery artifacts; `.agents/discovery.json` stays planner-owned — preserves single decision authority). Registry row (registry-plan): `| pl-scenario-compile | always | epic with exploration_output | ts-pl references/scenario-compile.md | - |`

**Verification (weak-model executable):** run compiler on the fixture exploration_output in `test-fixtures/`; count blocks; run coverage check; vitest unit tests for the script.

**Cut-line:** cutting F1 removes the script + agent + registry row. Nothing else depends on it (F2–F9 operate on hand-written scenarios too).

---

### F2 — Architecture Pattern Language + Machine Guard (S2: large-scale constraint)

**WHY:** architecture violations are the highest-cost hallucinations (they metastasize through every later diff) and today are caught only by human eyes. A dependency rule that a linter enforces converts your Clean Architecture knowledge from judgement (re-spent every review) into a red/green check (spent once, here).

**Design — two halves:**

(a) **Machine guard.** `layers.map.json` declares layers, the src-glob for each, and allowed dependency directions. `gen-depcruise.mjs` compiles it to a dependency-cruiser config. One npm script: `arch:check`.

```json
// .agents/pl/layers.map.json (per end-user project; example values)
{
  "layers": {
    "domain":      { "glob": "src/domain/**",      "may_import": [] },
    "application": { "glob": "src/application/**", "may_import": ["domain"] },
    "adapters":    { "glob": "src/adapters/**",    "may_import": ["application", "domain"] },
    "infra":       { "glob": "src/infra/**",       "may_import": ["adapters", "application", "domain"] }
  },
  "cqrs": { "commands": "src/application/commands/**", "queries": "src/application/queries/**",
            "rule": "queries may not import commands; commands may not import queries" },
  "contexts": [ { "name": "billing", "glob": "src/**/billing/**" } ]
}
```

Enforcement: `cmd` — `npm run arch:check` exits non-zero on any forbidden import. A weak model cannot argue with an exit code.

(b) **Pattern cards** (`references/arch-cards.md`) — v1 set of 9, CA + DDD + light CQRS (decision 2026-07-07; deeper options recorded in §11):

| # | Card | Layer | Kills which hallucination |
|---|---|---|---|
| A1 | Aggregate | domain | invariants scattered across services |
| A2 | Value Object (binds ACPL card) | domain | primitive obsession, invalid state |
| A3 | Domain Event | domain | implicit side-channel coupling |
| A4 | Repository Port | application (interface) / infra (impl) | domain importing persistence |
| A5 | Use Case / Command Handler | application/commands | business logic in controllers |
| A6 | Query Handler + Read Model | application/queries | queries mutating state |
| A7 | Anti-Corruption Layer | adapters | external models leaking into domain |
| A8 | Composition Root | infra | `new` scattered everywhere, hidden deps |
| A9 | Presenter/Output Port | adapters | use case knowing about HTTP/UI |

Card format (fixed — enforcement: `template`): `Intent (1 line) · Placement (layer + path glob) · Structure (TS skeleton ≤20 lines) · Naming rule · Forbidden imports (must echo layers.map) · Contract hooks (which @pre/@post it carries) · Test template · Mutation-sensitivity note · Anti-example (1 wrong version + why arch:check catches it)`. The anti-example field is mandatory: weak models learn faster from one negative example than three positive ones.

#### Requirement: dependency rules are generated, not hand-written
`gen-depcruise.mjs` SHALL generate the dependency-cruiser config solely from `layers.map.json`; hand-editing the generated file is forbidden (header comment states this; file is gitignored in end-user projects and regenerated).

#### Scenario: forbidden import fails the build
- **WHEN** a file matching `domain` glob imports from a file matching `infra` glob and `npm run arch:check` runs
- **THEN** exit code is non-zero and output names the offending file pair and the violated rule id

#### Scenario: CQRS split is enforced
- **WHEN** any module under `queries/**` imports from `commands/**` (or vice versa)
- **THEN** `arch:check` fails with rule id `cqrs-split`

#### Scenario: guard runs at Build and Review
- **WHEN** the Build or Review phase checklist executes for work_type epic/refactor
- **THEN** registry rows `pl-arch-check (always, cmd)` appear and a failing arch:check blocks the checklist item (registry-build + registry-review append-only rows)

**Verification:** fixture project in `test-fixtures/pl-sample-app/` with one deliberate violation per rule class; vitest asserts gen-depcruise output; dogfood run must show red then green after fix.

**Cut-line:** cards (b) can ship without guard (a) or vice versa, but (a) without (b) is the better half — keep (a) if forced to choose.

---

### F3 — Agent Role Cards (S3: mid-scale constraint)

**WHY:** hallucination scales with irrelevant context. An agent that can read everything will eventually justify anything. Your two existing agents already demonstrate the correct form (JSON output contract, read-only tools, "caller writes state") — F3 turns that house style into a standard and staffs the build line with it.

**Role-card standard** (enforcement: `template` + `schema` on outputs). Frontmatter + five fixed sections:

```markdown
---
name: ts-<role>
description: <1 line: when invoked, what it returns>
tools: <minimum set — read-only unless the role's ONE job is writing>
---
## Charter        — ONE sentence, one responsibility. Two sentences = two agents.
## Context diet   — explicit allow-list of read globs; everything else is out of bounds
## Output contract — exactly one fenced JSON block, schema inline, "caller merges/writes"
## Forbidden      — enumerated actions (e.g. "never edits state.json", "never signs gates")
## Escalation     — the ONE condition under which it stops and returns partial + reason
```

**v1 roster (new agents):** `ts-bdd-scenario-writer` (F1), `ts-arch-guard` (Review: runs arch:check, maps violations to card ids + fix pointer), `ts-contract-writer` (F5: given a scenario + placement, emits contract block + violation tests). **Retrofit:** the 2 existing agents get the five sections (content mostly exists; this is formatting, not behavior change).

#### Scenario: context diet is declared and minimal
- **WHEN** any `src/agents/*.md` is reviewed
- **THEN** it contains all five sections and its Context diet lists concrete globs (checklist: 5 sections present — countable)

#### Scenario: outputs validate against schema
- **WHEN** an agent returns its JSON block during dogfood
- **THEN** the caller validates it against the inline schema before merging; invalid → re-prompt once with the validation error, then stop and surface (never merge unvalidated)

**Verification:** existing orchestration-test-harness pattern — scenario-runner fixtures per agent.

**Cut-line:** independent. Cutting F3 leaves new agents as free-form like today's.

---

### F4 — ACPL Layer Binding (S4: small-scale constraint — extension only)

**WHY:** ts-acpl answers "how to shape this code"; F2 answers "where code lives". Binding them closes the gap where a perfectly-shaped Policy Object lands in the wrong layer.

#### Requirement: every ACPL pattern declares placement
`ts-acpl/references/patterns.md` SHALL gain one column `Layer` per pattern (values from layers.map vocabulary: domain/application/adapters/infra/any), and `problem-frame-map.md` SHALL note that pattern selection output includes the target layer.

#### Scenario: pattern application names its layer
- **WHEN** Build applies an ACPL pattern to satisfy a scenario
- **THEN** the placement plan row (F7) records `pattern id + layer` and `arch:check` confirms the file path matches that layer's glob

**Both SKILL.md and SKILL_caveman.md updated in the same change (dual-file invariant).** No pattern content changes. Cut-line: trivial, but F7's placement plan degrades without it.

---

### F5 — Design by Contract (S5: micro-scale constraint)

**WHY:** contracts convert *silent* wrong behavior into *loud* failure at the exact line where the assumption broke — the cheapest possible debugging for a weak model, and the direct implementation of your existing "Fail loud" principle. They also raise mutation kill rates mechanically: a mutant that violates a postcondition dies without anyone writing a targeted test.

**Design:** one tiny util, one convention, one test rule.

```ts
// src/utils/contracts.ts (complete v1 API — nothing more)
export class ContractViolation extends Error {
  constructor(kind: "pre" | "post" | "invariant", msg: string) {
    super(`[contract:${kind}] ${msg}`); this.name = "ContractViolation";
  }
}
const on = () => process.env.CONTRACTS_OFF !== "1";          // default ON, incl. prod (Fail loud)
export function requires(cond: boolean, msg: string): asserts cond {
  if (on() && !cond) throw new ContractViolation("pre", msg);
}
export function ensures(cond: boolean, msg: string): void {
  if (on() && !cond) throw new ContractViolation("post", msg);
}
export function invariant(cond: boolean, msg: string): void {
  if (on() && !cond) throw new ContractViolation("invariant", msg);
}
```

**Convention (enforcement: `checklist`, countable):** every exported function/method in `domain/**` and `application/**` carries ≥1 `requires` for each argument with a domain constraint, and aggregates call `invariant` in every state-changing method. **Test rule:** every `requires` in a diff has a matching violation test (`expect(...).toThrow(ContractViolation)`); the count of `requires` in the diff ≤ count of new violation tests.

#### Scenario: precondition violation is loud in every environment
- **WHEN** code calls a function violating a `requires` and `CONTRACTS_OFF` is unset
- **THEN** `ContractViolation` is thrown (not logged, not swallowed) — including production builds

#### Scenario: contracts kill mutants
- **WHEN** `npm run mutation` (Stryker — already configured) runs on a module with contract blocks
- **THEN** mutants that break pre/post conditions are killed by violation tests; the module's mutation score counts toward the F9 threshold

#### Scenario: violation-test parity is checked in Build exit
- **WHEN** Build exit checklist runs
- **THEN** item "`requires` count in diff ≤ new violation-test count" is answered with the two numbers (grep-countable), mismatch = unchecked item

**Relationship to ACPL Assertion Gate:** the card stays; `references/contracts.md` becomes its canonical implementation and the card gains a pointer. Cut-line: independent of all others; cheapest feature in the PRD.

---

### F6 — Prompt Template Library (patterns as commands · 模式的指令化)

**WHY:** a weak model given a blank page designs; given a template it fills. Templates are where the four constraint scales get *composed into one instruction* — the template names the pattern card, the layer, the contract hooks, and the self-check, so the model never has to remember the system, only follow the sheet.

**Template format (fixed — enforcement: `template`):** `references/templates/<verb>-<noun>.md`

```markdown
# TPL: add-use-case
INPUT: scenario id, aggregate, command          ← caller fills
LOAD: arch card A5, ACPL patterns <from acpl_pattern_group>, layers.map
STEPS:
  1. Create file at <application/commands/ glob per A5.Placement> named <Command>Handler.ts
  2. Copy A5.Structure skeleton; rename per A5.Naming
  3. Insert contract block per F5 convention (requires per arg; ensures on result)
  4. Write violation tests + scenario test FIRST (must fail)
  5. Implement until green
SELF-CHECK (all must pass before reporting done):
  [ ] npm run arch:check → exit 0
  [ ] new violation tests ≥ requires count in diff
  [ ] scenario test green; was red at step 4
  [ ] npm run type-check → exit 0
OUTPUT: file list + check results table (4 rows, pass/fail)
```

**v1 set (8 templates):** add-aggregate, add-value-object, add-use-case, add-query-handler, add-repository-port, add-repository-impl, add-domain-event, add-acl-adapter. One template per arch card that generates code (A1–A9 minus composition-root/presenter, which are wire-up steps inside other templates).

#### Scenario: template output is self-verified
- **WHEN** any template is executed by any model
- **THEN** the report ends with the SELF-CHECK table; any unchecked row means status is "blocked: <row>", never "done"

**Cut-line:** independent; without F6, Build still works from cards directly (slower, more drift).

---

### F7 — Production Line (Build-phase station loop · 生產線)

**WHY:** end-to-end feature development decomposes into stations so a weak model always knows the *one next action* — the same reason the spine works. This is a sub-loop **inside Build**, exactly as Spectra nests in phases: no spine change, no state.json schema change beyond one field inside the existing `artifacts` map.

**The line (per scenario, smallest work unit):**

```
station 1  PLACE     scenario → placement plan row: {scenario, arch card, layer, acpl patterns}
station 2  CONTRACT  ts-contract-writer → contract block + violation tests (red)
station 3  RED       scenario test skeleton → failing acceptance test
station 4  BUILD     execute matching F6 template → green
station 5  GUARD     arch:check + type-check + violation-test parity (all cmd)
```

Placement plan = table in the change proposal (Plan phase output, one row per scenario — enforcement: `checklist`, "every scenario has a row" is countable). Line position is tracked as `artifacts.pl_station` inside existing state.json artifacts map (additive field; state stays slim and sovereign).

#### Scenario: one scenario in flight at a time
- **WHEN** the Build phase runs with a placement plan of N scenarios
- **THEN** stations 1–5 complete for scenario k before station 1 opens for scenario k+1 (WIP limit 1; the `[WORKFLOW STATE]` hook line shows `pl_station` so every prompt turn knows where it is)

#### Scenario: station 5 failure loops back, never proceeds
- **WHEN** any station-5 check fails
- **THEN** the line returns to the earliest station that owns the failure (arch → 1, contract parity → 2, test red/green → 4) and appends an F8 feedback row; it never advances with a red check

**Cut-line:** F7 depends on F2(a) and F5; cut those and F7 degrades to today's free-form Build.

---

### F8 — Living Pattern Language (evolution loop · 從錯誤到智慧)

**WHY:** your existing SKILL-PATCH-RETRO already encodes the right reflex for *skills*; F8 applies the identical trigger discipline to *patterns*, so the pattern language absorbs every mistake as a rule delta instead of re-paying for it next epic. This is the feature that makes the other seven compound over time — and it directly services your stated weak spots (WHY / reflection / verification) by forcing a root-cause row instead of a silent fix.

**Artifact:** `.agents/pl/pattern-feedback.jsonl` (append-only, one JSON object per line):

```json
{"ts":"2026-07-07T10:00:00Z","epic":"E12","scale":"S2","pattern":"A5|GAP",
 "failure_mode":"query handler imported command model",
 "root_cause":"cqrs-split rule missing queries→domain-write path",
 "correction":"split read model into own dir",
 "rule_delta":"layers.map: added queries may_import [domain-read] only",
 "recurrence_key":"S2:A5:cqrs-import"}
```

**Protocol (mirrors SKILL-PATCH-RETRO):**

| trigger | action | enforcement |
|---|---|---|
| any station-5 failure, review finding, or unexpected AI output | append 1 row | checklist (Reflect: "rows appended ≥ findings count") |
| same `recurrence_key` appears 2nd time | open formal pattern review task in planner retrospective file | cmd — `grep -c` the key; ≥2 → task required |
| monthly refresh (existing cadence) | fold accepted `rule_delta`s into cards/layers.map/templates; both SKILL files same session | checklist |

#### Scenario: second occurrence escalates automatically
- **WHEN** a feedback row is appended whose `recurrence_key` already exists in the file
- **THEN** Reflect exit requires a pattern-review task reference (countable: grep key, count ≥2, task link present)

#### Scenario: rule deltas land in the pattern language, not in chat
- **WHEN** a monthly refresh processes accepted deltas
- **THEN** each delta is traceable: jsonl row → card/map/template diff → both dual-files updated in the same commit

**Cut-line:** independent, cheap (one jsonl + registry rows). If you cut everything else, keep F8 + F5 — they compound.

---

### F9 — Gate & Registry Wiring + Placeholder Fill

**WHY:** PLDD must ride the existing enforcement machinery, not invent parallel machinery. Also: the registry has carried `<mutation tool>`, `<SAST tool>`, `coverage >= <X>%` placeholders for weeks — placeholders are judgement-only rules (Sonnet-runnability defect) and F9 retires the ones this PRD can.

**Registry rows (append-only; full list for the implementing change):**

| file | id | type | trigger | skill/cmd | block |
|---|---|---|---|---|---|
| registry-plan | pl-scenario-compile | always | epic w/ exploration_output | ts-pl scenario-compile | - |
| registry-plan | pl-placement-plan | always | epic/refactor | ts-pl (F7 station 1) | - |
| registry-build | pl-arch-check | always | code change | `npm run arch:check` | - |
| registry-build | pl-contract-parity | always | code change | F5 count rule | - |
| registry-build | mutation | **gate** (was rec/placeholder) | before leave Build (epic) | `npm run mutation` ≥ threshold | yes |
| registry-review | pl-arch-guard | always | epic/refactor | ts-arch-guard agent | - |
| registry-review | pl-ddd-validate | rec | epic w/ exploration_output | ts-ddd-tactical-validator Mode B (exists) | - |
| registry-test | pl-scenario-coverage | gate | epic | F1 coverage check exit 0 | yes |
| registry-reflect | pl-feedback | always | any finding | F8 append rule | - |

Mutation threshold: v1 = **60% on changed files** (not whole repo), raised via F8 evolution when data supports it. Coverage placeholder: **80% lines on changed files**. Both are OQ-5 if you want different numbers. Gate accounting, precisely: G1/G2 and human sign-off machinery untouched (NG1); zero new human gates. Registry-level *blocking* rows: `mutation` promoted rec→gate (fills an existing placeholder already on your roadmap — note this edits a row rather than appending, sanctioned by that roadmap item), and `pl-scenario-coverage` appended as a new gate-type row (machine check, same class as the existing `coverage` row).

**Verification:** existing gate-enforcement-tests + lean-phase-registry specs extend with the new rows (same test harness).

---

## 5. Worked example — one feature through all five scales

Domain: timesheet slice of the Atlassian pilot. Command `SubmitTimesheet`, aggregate `Timesheet`, event `TimesheetSubmitted`.

| scale | artifact produced | check that would catch a hallucination |
|---|---|---|
| S1 | compiler emits `#### Scenario: SubmitTimesheet on Timesheet` … `WHEN SubmitTimesheet` `THEN TimesheetSubmitted` | event missing from every THEN → coverage check exits 1 |
| S2 | placement row: A1 Timesheet(domain) + A5 SubmitTimesheetHandler(application/commands) | handler written into `src/adapters/` → arch:check names file + rule |
| S3 | ts-contract-writer invoked with context diet = that scenario + A1/A5 cards only | agent returns JSON without required keys → schema reject, re-prompt once |
| S4 | ACPL Guard Clause + Value Object (`Hours`), layer column = domain | Value Object placed in application → arch:check |
| S5 | `requires(hours.total <= period.capacity, ...)` + `invariant(status transitions per table)` + 2 violation tests | mutant flips `<=` to `<` → violation test kills it; parity count enforced at Build exit |

Total human judgement spent: approving the placement plan row and G1/G2. Everything else was template + exit code.

---

## 6. Rollout — thin slices, each one openspec change

Order optimizes for "enforcement before generation": guards exist before generators rely on them.

| slice | change name | contains | depends on |
|---|---|---|---|
| R0 | `pl-enforcement-base` | eslint actually installed + config; dependency-cruiser + gen-depcruise.mjs; layers.map spec; `arch:check`; fixture app in test-fixtures | — |
| R1 | `pl-contracts` | F5 util + convention + registry rows; fill mutation/coverage placeholders (F9 part) | — |
| R2 | `pl-scenario-compiler` | F1 script + agent + coverage gate | — |
| R3 | `pl-pattern-cards` | ts-pl skill v1 (9 cards) + F4 ACPL column | R0 |
| R4 | `pl-agent-cards` | F3 standard + retrofit 2 + new 3 agents | R2, R3 |
| R5 | `pl-production-line` | F7 stations + F6 templates + state field + hook line | R0, R1, R3 |
| R6 | `pl-evolution` | F8 jsonl + Reflect rows + escalation rule | — (start day 1 informally) |

R0+R1 alone already change daily reality (red/green architecture + loud contracts) even if everything else is cut. Dogfood vehicle per slice: fixture app for R0–R3; Atlassian pilot epic for R4–R6 (OQ-1).

---

## 7. Metrics — "conductor, not reviewer" made measurable

Baseline captured on the first dogfood epic before R4; all computable by a weak model from files:

| metric | source | direction |
|---|---|---|
| machine-caught ratio: violations caught by cmd/schema checks ÷ total findings (incl. human review) | history.jsonl + feedback.jsonl | ↑ toward ≥70% |
| scenario coverage: domain events asserted ÷ total | F1 check output | =100% (gate) |
| mutation score on changed files | Stryker report | ≥60%, ratchet via F8 |
| recurrence rate: feedback rows with duplicate recurrence_key ÷ total | jsonl grep | ↓ toward 0 |
| human review scope: review comments about placement/dependency | review notes | ↓ toward 0 (arch:check owns it) |

---

## 8. Risks

| risk | mitigation |
|---|---|
| Token bloat from cards/templates | caveman dual-files; lazy-load per scale (registry pattern already proven); templates LOAD only named cards |
| False-positive arch rules block legitimate code | escape hatch = F8 feedback row + rule delta, never inline-disable; rule changes go through monthly refresh |
| Fixture ≠ reality (dogfooding a toy) | R4+ dogfoods on the Atlassian pilot epic; fixture is for deterministic tests only |
| layers.map wrong on day 1 | it's per-project data, not code — versioned, evolved via F8 like any rule |
| Weak model skips SELF-CHECK footer | station 5 re-runs the same checks as cmds; template check is belt, registry row is suspenders |
| Scope creep into router/spine | NG1 + this PRD's registry-rows-only wiring; any change touching phase-routing.ts is out of PLDD scope by definition |

---

## 9. Deferred alternatives (recorded per decision 2026-07-07)

- **Full CQRS + Event Sourcing** (option B): adds ES aggregate card, event store port, projection/saga cards, replay tests. Revisit when a pilot feature actually needs audit-grade history; entry = new cards + layers.map entries only, so deferral costs nothing structurally.
- **CA+DDD only** (option C): rejected — the pilot's admin-console reads/writes asymmetry already wants the light CQRS split.
- **ezSpec port**: rejected (decision) — Spectra scenarios remain the carrier; if fluent in-code BDD is ever wanted, it enters as an F6 template change, not a framework adoption.

---

## 10. Open questions (each with my recommended default — answer or override)

| # | question | recommendation & why |
|---|---|---|
| OQ-1 | Dogfood vehicle: fixture app only, or wire PLDD into the **Atlassian pilot** from R4? | Pilot from R4. Fixtures prove determinism; only real domain pressure produces F8 feedback worth folding in. |
| OQ-2 | Scenario compiler: pure procedure doc vs `.mjs` script? | Script. Skeleton generation is exactly the kind of step that must not depend on model quality. |
| OQ-3 | Contracts in production: default ON with `CONTRACTS_OFF` escape, or default OFF? | Default ON (your Fail-loud principle). Perf-critical hot paths opt out per-module, recorded as F8 row. |
| OQ-4 | `layers.map.json` location: `.agents/pl/` (state-ish) vs project root (config-ish)? | `.agents/pl/` — it evolves via F8 like state, and scaffolder already owns `.agents/` seeding. |
| OQ-5 | Thresholds: mutation 60% / coverage 80% on changed files — agree? | Yes as v1; ratchet by F8 data, never by feel. Changed-files scope keeps weak-model runs fast. |
| OQ-6 | Skill name `ts-pl` vs `ts-pldd`? | `ts-pl`. Shorter in every prompt; "pldd" is the method, the skill is the pattern language itself. |
| OQ-7 | New deps (dependency-cruiser, eslint plugins) — run `g0-oss-intake` first? | Yes, standard P1–P7 pass; both are mainstream, expect ADOPT. Budget: one session. |
| OQ-8 | Should `ts-project-init-advisor` learn to detect layers.map + recommend PLDD tier for existing projects? | Yes but as a *later* advisor change (post-R3), one new rubric dimension — keep this PRD's blast radius fixed. |

---

## 11. What this PRD deliberately did NOT do

No implementation was started; no repo files were modified. Every feature above converts to one openspec change with its scenarios already drafted in §4. The intended next step after your review: `/spectra-propose` R0 in the repo, pasting the relevant F-section as the seed.

