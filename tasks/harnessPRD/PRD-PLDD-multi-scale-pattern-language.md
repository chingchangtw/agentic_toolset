# PRD — PLDD: Multi-Scale Pattern-Language-Driven Development

| | |
|---|---|
| Status | THINK — PRD reversed/reviewed, Spectra artifacts valid, G1 technical re-audit complete; human sign-off pending |
| Target repo | `agenticToolset` (src/ deliverable, dogfooded via existing pipeline) |
| Audience | Tony (approve/cut/answer OQs) + future Sonnet-class sessions (execute) |
| Governing constraint | **Add rigour, never add scope.** Dual-track topology, 7-phase spine, router algorithm, G1/G2, and state sovereignty remain untouched. Phase A and Phase B modify only `src/*`; live-project activation requires separate Dogfood Activation approval. |
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

**Selected architecture:** an enforcement kernel is the source of executable truth. Cards, agents, templates, and production-line guidance are replaceable clients of that kernel. Host-specific Codex and Claude Code adapters may display state and invoke portable commands, but may not contain unique PLDD rules.

---

## 2. North star and non-goals

**North star:** a feature travels event-storm → scenarios → placement → contracts → code with every hop either machine-checked (exit code) or binary-checklisted, so that human attention is spent only on domain decisions and gate sign-offs (G1/G2 stay human at every autonomy level).

**Non-goals (explicit, to protect scope):**
- NG1: No new phases, no router changes, no new top-level gates. PLDD nests inside existing phases exactly like Spectra does.
- NG2: No event sourcing in v1 (deferred — §11).
- NG3: No replacement of ts-acpl. It keeps small-scale ownership; it gains one column (F4).
- NG4: agenticToolset's own `src/` is NOT retrofitted to Clean Architecture — it is a distribution framework, not a layered domain app. Phase A/B checks target isolated end-user-project fixtures; live agenticToolset enforcement belongs only to approved Phase C.
- NG5: No ezSpec port. Spectra/OpenSpec scenario format is the single BDD carrier (per decision 2026-07-07).
- NG6: No changes to live `.agents/*`, root `package.json`, lockfile, hooks, router, or project configuration in Phase A or Phase B.
- NG7: No PLDD activation against `agenticToolset` before explicit human approval at the Dogfood Activation Gate.
- NG8: No persistent F7 station state in v1. PLACE→CONTRACT→RED→BUILD→GUARD begins as a Build checklist.

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

### 3.3 Toolset inventory by rollout boundary

```
PHASE A — portable kernel, src/* only
src/skills/ts-pl/                    NEW minimal kernel-facing skill
  SKILL.md + SKILL_caveman.md        entry, scale index, lazy-load pointers
  references/layers-map.md           layers.map.json spec + depcruise generation rule
  references/scenario-compile.md     S1 compile rules
  references/contracts.md            S5 DbC convention + violation-test rule
src/utils/contracts.ts                   NEW (F5) — requires/ensures/invariant with stable contract ids
src/scripts/pl-arch-check.mjs            NEW (F2) — zero-dependency portable guard (Phase A)
src/scripts/pl-contract-check.mjs        NEW (F5) — contract-id ↔ violation-test parity
src/scripts/gen-scenarios.mjs            NEW (F1) — ownership relations → scenario skeletons
src/tests/fixtures/pl-sample-app/        NEW isolated fixture

PHASE B — inactive consumer clients, src/* only
src/skills/ts-pl/references/arch-cards.md
src/skills/ts-pl/references/agent-cards.md
src/skills/ts-pl/references/templates/
src/skills/ts-pl/references/evolution.md
src/agents/ts-bdd-scenario-writer.md
src/agents/ts-arch-guard.md
src/agents/ts-contract-writer.md
src/scripts/gen-depcruise.mjs            optional consumer adapter
src/project_root_structure/.agents/pl/   NEW scaffold seeds: layers.map.json.example,
                                         pattern-feedback.jsonl (empty)

PHASE C — approval required
generated live registry rows, hooks/config activation, and agenticToolset dogfood wiring
```

Naming: skill = `ts-pl` (short, matches `ts-*` family; "PLDD" reserved for the method name).

### 3.4 Enforcement-kernel architecture

```text
Discovery model ──scenario compiler──> OpenSpec scenarios
Layer manifest  ──architecture check─> stable diagnostics + exit code
Contract ids    ──parity check───────> missing violation-test ids
All results     ──registry adapter───> existing phase check result
```

Canonical sources:

| Concern | Canonical source | Generated/consumer views |
|---|---|---|
| Layer placement and imports | `layers.map.json` | dependency-cruiser config, card rule references, diagnostics |
| Requirement coverage | `exploration_output` command→aggregate and event relations | OpenSpec scenario skeletons |
| Local behavioral obligations | stable contract ids in code | violation-test parity report |
| Workflow activation | existing phase registries | Codex/Claude host guidance |

Rules SHALL NOT be restated independently across cards, templates, agents, and host adapters. Those artifacts reference canonical rule ids.

### 3.5 Codex and Claude Code compatibility

Portable core consists of cross-platform Node commands, JSON/JSONL schemas, OpenSpec artifacts, stable diagnostics, and decisive exit codes. Phase A produces normalized golden fixture outputs. Phase B Claude Code and Codex adapters MUST invoke that core and reproduce the same rule ids and exit codes.

---

## 4. Features (SDD sections — each independently reviewable/cuttable)

---

### F1 — Scenario Compiler (S1: requirements constraint)

**WHY:** the domain model is already structured JSON; leaving scenario writing free-form throws away that structure and makes coverage unmeasurable. Compiling events→scenarios means a weak model *fills templates* instead of *inventing tests*, and "did we cover the spec?" becomes a count, not an opinion.

**Design:** deterministic skeletons by script, domain detail by agent. Discovery output SHALL represent each command with exactly one target aggregate and its emitted events. A script (`gen-scenarios.mjs`) emits one scenario skeleton per command; the `ts-bdd-scenario-writer` agent fills GIVEN/THEN from ubiquitous language. Split rationale: skeleton generation must be deterministic (weak-model-proof); only domain prose needs a model.

Compatibility shape: existing `domain_events[]`, `commands[]`, and `aggregates[]` string arrays remain unchanged in type and purpose. New ownership is additive and versioned:

```json
{
  "ownership_relations_v1": [
    { "command": "RunArchitectureCheck", "aggregate": "EnforcementKernel", "event": "ArchitectureCheckCompleted" }
  ],
  "external_adapters_v1": [
    { "bounded_context": "Consumer Integration", "external_system": "Codex", "boundary": "HostAdapter" }
  ]
}
```

Each relation references names present in the legacy arrays. Every command and event appears in exactly one relation. Unknown relationship versions fail closed; legacy consumers may ignore versioned fields.

#### Requirement: exploration_output compiles to scenario skeletons
`src/scripts/gen-scenarios.mjs` SHALL read an `exploration_output` JSON and emit one OpenSpec scenario skeleton per command into the active change's spec delta. Each command SHALL declare exactly one target aggregate; zero or multiple targets fail compilation with rule id `PL-SCENARIO-COMMAND-TARGET`.

#### Scenario: every command produces a skeleton
- **WHEN** `gen-scenarios.mjs` runs on an exploration_output with N commands
- **THEN** output contains exactly N `#### Scenario:` blocks, each named `<Command> on <Aggregate>`, each with `WHEN <Command>` pre-filled and `GIVEN`/`THEN` as `<FILL: ...>` placeholders

#### Scenario: ambiguous command ownership fails compilation
- **WHEN** a command declares zero or more than one target aggregate
- **THEN** compilation exits non-zero, names the command, and reports `PL-SCENARIO-COMMAND-TARGET`

#### Scenario: every domain event is asserted somewhere
- **WHEN** scenario filling is complete and the coverage check runs
- **THEN** every entry in `domain_events[]` appears in at least one THEN clause, else the check prints the missing events and exits non-zero

#### Scenario: hotspots become open questions, never silent
- **WHEN** exploration_output contains unresolved hotspot/assumption entries
- **THEN** each is emitted as an `## Open Questions` bullet in the change proposal (enforcement: `cmd` — compiler does it; absence of section with nonempty assumptions fails)

**Where it nests:** Plan phase, inside Spectra `propose` (scenarios are delivery artifacts; `.agents/discovery.json` stays planner-owned — preserves single decision authority). Registry row (registry-plan): `| pl-scenario-compile | always | epic with exploration_output | ts-pl references/scenario-compile.md | - |`

**Verification (weak-model executable):** run compiler on fixture exploration output under `src/tests/fixtures/`; count blocks; run coverage check; use existing test tooling for the script.

**Cut-line:** cutting F1 removes the script + agent + registry row. Nothing else depends on it (F2–F9 operate on hand-written scenarios too).

---

### F2 — Architecture Pattern Language + Machine Guard (S2: large-scale constraint)

**WHY:** architecture violations are the highest-cost hallucinations (they metastasize through every later diff) and today are caught only by human eyes. A dependency rule that a linter enforces converts your Clean Architecture knowledge from judgement (re-spent every review) into a red/green check (spent once, here).

**Design — kernel plus adapter:**

(a) **Portable dependency and placement guard.** `layers.map.json` declares layers, source globs, and allowed dependency directions. Phase A ships a zero-new-dependency Node checker with stable JSON diagnostics. Phase B adds an optional dependency-cruiser adapter for end-user projects. One consumer command: `arch:check`.

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

Enforcement: `cmd` — `npm run arch:check` exits non-zero on a forbidden import or a file placed outside its declared layer. This is a dependency-and-placement guard, not proof of full architectural correctness.

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

Card format (fixed — enforcement: `template`): `Intent (1 line) · Placement (layer + path glob) · Structure (TS skeleton ≤20 lines) · Naming rule · Forbidden-import rule ids (references layers.map; never restates rules) · Contract hooks (which @pre/@post it carries) · Test template · Mutation-sensitivity note · Anti-example (1 wrong version + why arch:check catches it)`. The anti-example field is mandatory: weak models learn faster from one negative example than three positive ones.

#### Requirement: dependency rules are generated, not hand-written
The Phase A checker and Phase B `gen-depcruise.mjs` adapter SHALL consume the same `layers.map.json`. Generated dependency-cruiser config is never a second source of truth; hand-editing it is forbidden.

#### Scenario: forbidden import fails the build
- **WHEN** a file matching `domain` glob imports from a file matching `infra` glob and `npm run arch:check` runs
- **THEN** exit code is non-zero and output names the offending file pair and the violated rule id

#### Scenario: CQRS split is enforced
- **WHEN** any module under `queries/**` imports from `commands/**` (or vice versa)
- **THEN** `arch:check` fails with rule id `cqrs-split`

#### Scenario: guard runs at Build and Review
- **WHEN** the Build or Review phase checklist executes for work_type epic/refactor
- **THEN** after Phase C activation, generated registry rows `pl-arch-check (always, cmd)` appear and a failing arch:check blocks the checklist item; Phase A/B fixtures invoke the same command directly without live registry edits

**Verification:** fixture project under `src/tests/fixtures/pl-sample-app/` with one deliberate violation per rule class; existing test tooling asserts portable diagnostics and optional generated adapter output. Phase A/B do not alter root project configuration. Dogfood red/green run occurs only after activation approval.

**Cut-line:** kernel guard ships first. Cards and dependency-cruiser adapter remain independently removable clients.

---

### F3 — Agent Role Cards (S3: mid-scale constraint)

**Rollout:** Phase B only. No Phase A agent is required for kernel correctness.

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

**Rollout:** Phase B only. It consumes Phase A layer rule ids.

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

**Design:** one tiny util, stable contract ids, one test rule.

```ts
// src/utils/contracts.ts (complete v1 API — nothing more)
export class ContractViolation extends Error {
  constructor(kind: "pre" | "post" | "invariant", id: string, msg: string) {
    super(`[contract:${kind}:${id}] ${msg}`); this.name = "ContractViolation";
  }
}
export function requires(cond: boolean, id: string, msg: string): asserts cond {
  if (!cond) throw new ContractViolation("pre", id, msg);
}
export function ensures(cond: boolean, id: string, msg: string): void {
  if (!cond) throw new ContractViolation("post", id, msg);
}
export function invariant(cond: boolean, id: string, msg: string): void {
  if (!cond) throw new ContractViolation("invariant", id, msg);
}
```

**Convention (enforcement: `cmd`):** every exported function/method in `domain/**` and `application/**` carries ≥1 `requires` for each argument with a domain constraint, and aggregates call `invariant` in every state-changing method. Each contract id is stable and unique within the project. Every changed contract id has a matching violation test containing that id. The checker compares identities, not raw counts.

#### Scenario: precondition violation is loud in every environment
- **WHEN** code calls a function violating a `requires`
- **THEN** `ContractViolation` is thrown (not logged, not swallowed) — including production builds

#### Scenario: contracts kill mutants
- **WHEN** `npm run mutation` (Stryker — already configured) runs on a module with contract blocks
- **THEN** mutants that break pre/post conditions are killed by violation tests; the module's mutation score counts toward the F9 threshold

#### Scenario: violation-test identity is checked in Build exit
- **WHEN** Build exit checklist runs
- **THEN** `pl-contract-check` reports every changed contract id missing from violation tests and exits non-zero when any id is unmatched

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
  [ ] every changed contract id appears in a violation test → exit 0
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

**WHY:** end-to-end feature development decomposes into stations so a weak model always knows the *one next action* — the same reason the spine works. In v1 this is a Phase B checklist **inside Build**, exactly as Spectra nests in phases: no spine change and no router-state field.

**The line (per scenario, smallest work unit):**

```
station 1  PLACE     scenario → placement plan row: {scenario, arch card, layer, acpl patterns}
station 2  CONTRACT  ts-contract-writer → contract block + violation tests (red)
station 3  RED       scenario test skeleton → failing acceptance test
station 4  BUILD     execute matching F6 template → green
station 5  GUARD     arch:check + type-check + violation-test parity (all cmd)
```

Placement plan = table in the change proposal (Plan phase output, one row per scenario — enforcement: `checklist`, "every scenario has a row" is countable). In v1 the stations are a Build checklist artifact; no station field is added to live router state. Persistent resumable station state is deferred until dogfood evidence and separate approval justify it.

#### Scenario: one scenario in flight at a time
- **WHEN** the Build phase runs with a placement plan of N scenarios
- **THEN** stations 1–5 complete for scenario k before station 1 opens for scenario k+1 (WIP limit 1 recorded in the Build checklist)

#### Scenario: station 5 failure loops back, never proceeds
- **WHEN** any station-5 check fails
- **THEN** the line returns to the earliest station that owns the failure (arch → 1, contract parity → 2, test red/green → 4) and appends an F8 feedback row; it never advances with a red check

**Cut-line:** F7 depends on F2(a) and F5. Persistent orchestration remains outside Phase A/B and requires a later approved change.

---

### F8 — Living Pattern Language (evolution loop · 從錯誤到智慧)

**Rollout:** feedback schema/template ships inactive in Phase B; live Reflect registry activation waits for Phase C approval.

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

**Rollout boundary:** Phase B generates inactive registry-row templates under `src/*` and verifies them in fixtures. Phase C, after Dogfood Activation approval, may install those rows into live registries. Phase A does not create or activate registry rows.

**Registry rows (append-only; full list for the implementing change):**

| file | id | type | trigger | skill/cmd | block |
|---|---|---|---|---|---|
| registry-plan | pl-scenario-compile | always | epic w/ exploration_output | ts-pl scenario-compile | - |
| registry-plan | pl-placement-plan | always | epic/refactor | ts-pl (F7 station 1) | - |
| registry-build | pl-arch-check | always | code change | `npm run arch:check` | - |
| registry-build | pl-contract-parity | always | code change | F5 contract-id identity rule | - |
| registry-build | mutation | **gate** (was rec/placeholder) | before leave Build (epic) | `npm run mutation` ≥ threshold | yes |
| registry-review | pl-arch-guard | always | epic/refactor | ts-arch-guard agent | - |
| registry-review | pl-ddd-validate | rec | epic w/ exploration_output | ts-ddd-tactical-validator Mode B (exists) | - |
| registry-test | pl-scenario-coverage | gate | epic | F1 coverage check exit 0 | yes |
| registry-reflect | pl-feedback | always | any finding | F8 append rule | - |

Provisional Phase-C thresholds are **60% mutation** and **80% line coverage** on changed files. They remain inactive until dogfood approval and may change from fixture evidence before activation. G1/G2 and human sign-off machinery stay untouched; zero new human security gates. Machine-blocking registry rows are generated consumer configuration, not Phase-A source-of-truth.

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
| S5 | `requires(hours.total <= period.capacity, "TIMESHEET-HOURS-CAPACITY", ...)` + `invariant(validTransition, "TIMESHEET-STATUS-TRANSITION", ...)` + tests naming both ids | mutant flips `<=` to `<` → violation test kills it; contract-id parity enforced at Build exit |

Total human judgement spent: approving the placement plan row and G1/G2. Everything else was template + exit code.

---

## 6. Rollout — isolation before activation

Order optimizes for executable truth before guidance and requires explicit consent before changing this project.

### Phase A — portable enforcement kernel (`src/*` only)

| slice | contains | forbidden |
|---|---|---|
| A1 | zero-dependency architecture/placement checker, `layers.map` schema, stable diagnostics, planted fixture violations | root dependency/config edits |
| A2 | contract util with stable ids, identity-based violation-test checker | live registry activation |
| A3 | relational discovery shape, scenario compiler, event coverage checker | live Discovery schema migration |

Phase A acceptance: all implementation files changed are below `src/*`; no new npm dependency; repeated fixture runs produce identical normalized rule ids, diagnostics, and exit codes. Host-adapter parity is Phase B acceptance.

### Phase B — consumer-project adapters (`src/*` only)

| slice | contains | activation state |
|---|---|---|
| B1 | scaffold templates for consumer `layers.map`, npm scripts, and registry rows | inactive |
| B2 | optional dependency-cruiser/ESLint adapter generated from canonical manifests | inactive |
| B3 | cards, agent contracts, prompt templates, and Build station checklist referencing kernel rule ids | inactive |
| B4 | installer dry-run and generated-file manifest with rollback plan | fixture only |

Phase B acceptance: installation is exercised only against an isolated fixture. No live project file outside `src/*` changes.

### Dogfood Activation Gate — explicit human approval

After Phase A and Phase B evidence is reviewed, work MUST stop. Separate approval is required before any of these actions:

- edit root `package.json` or lockfile;
- install dependencies into `agenticToolset`;
- modify live `.agents/*`, hooks, registries, router state, or project configuration;
- apply layer rules to current repository;
- run live state/config migrations.

This gate is adoption consent, separate from security gates G1/G2. Approval for implementation does not imply dogfood approval.

### Phase C — approved dogfood activation

Generate configuration into `agenticToolset`, run deliberate red→green violations, measure false positives and workflow impact, and retain rollback through the generated-file manifest. Persistent F7 station state remains a separate proposal even after Phase C.

---

## 7. Metrics — "conductor, not reviewer" made measurable

Baseline captured only after Dogfood Activation approval and before the first Phase-C dogfood run; all metrics remain fixture-only before then:

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
| Fixture ≠ reality | Phase A/B claims stop at deterministic portability; real-project conclusions wait for separately approved Equipment Lending Board validation and Phase-C dogfood evidence |
| layers.map wrong on day 1 | it's per-project data, not code — versioned, evolved via F8 like any rule |
| Weak model skips SELF-CHECK footer | station 5 re-runs the same checks as cmds; template check is belt, registry row is suspenders |
| Scope creep into router/spine | NG1 + this PRD's registry-rows-only wiring; any change touching phase-routing.ts is out of PLDD scope by definition |

---

## 9. Deferred alternatives (recorded per decision 2026-07-07)

- **Full CQRS + Event Sourcing** (option B): adds ES aggregate card, event store port, projection/saga cards, replay tests. Revisit when a pilot feature actually needs audit-grade history; entry = new cards + layers.map entries only, so deferral costs nothing structurally.
- **CA+DDD only** (option C): rejected — the pilot's admin-console reads/writes asymmetry already wants the light CQRS split.
- **ezSpec port**: rejected (decision) — Spectra scenarios remain the carrier; if fluent in-code BDD is ever wanted, it enters as an F6 template change, not a framework adoption.

---

## 10. Decisions and remaining questions

| # | status | decision |
|---|---|---|
| D1 | decided | Use enforcement kernel; cards, agents, templates, and host adapters are clients. |
| D2 | decided | Phase A → Phase B → explicit Dogfood Activation approval → Phase C. |
| D3 | decided | Phase A/B modify only `src/*`; current dual-track configuration remains unchanged. |
| D4 | decided | Scenario compiler is deterministic `.mjs`; each command targets exactly one aggregate through additive `ownership_relations_v1`, preserving legacy arrays. |
| D5 | decided | Contracts are always on in v1 and carry stable ids; parity compares ids, not counts. |
| D6 | decided | F7 begins as Build checklist; no persistent router state. |
| D7 | decided | Skill name is `ts-pl`; PLDD names the method. |
| D8 | decided | Equipment Lending Board is parked separately in `tasks/VALIDATION_PROJECT.md`; it does not authorize dogfood activation. |
| D9 | decided | Add versioned relationship fields beside legacy arrays inside `exploration_output`; current array shapes remain stable and older consumers may ignore additions. |
| OQ-2 | build constraint | Phase A checker SHALL enumerate supported syntax and fail closed on unsupported import forms; exact supported set belongs in Phase A spec before implementation. |
| OQ-3 | later | Mutation 60% and coverage 80% on changed files remain provisional until fixture and dogfood evidence. |

---

## 11. What this PRD deliberately did NOT do

No implementation has started. PRD reverse review removed stale Phase-B/Phase-C instructions from Phase A, count-based contract parity, the persistent-state contradiction, old rollout labels, and premature host-parity claims. `pl-enforcement-kernel-phase-a` now has proposal, design, specification, and 13 verifiable tasks; Spectra analysis is clean and validation passes. G1 technical re-audit remains 6/6, with human sign-off pending before Plan. `$spectra-apply` remains user-invoked, and dogfood activation requires its own later approval.

