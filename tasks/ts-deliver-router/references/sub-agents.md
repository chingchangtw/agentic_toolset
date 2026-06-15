# Sub-Agent Build Specs

Four sub-agents recommended for the ts-deliver-router. Each spec is ready to
hand to Claude Code as a build task.

---

## 1. `ts-event-storming-facilitator`

**Phase:** Think
**Trigger:** `tier=active` in registry + Think phase reached

**Purpose:** Run a structured Event Storming session inside the conversation,
extract the domain model, and output an ACPL Problem Frame classification with
recommended pattern groups.

**Input:** Project description (from `/ts-router init` answers or free text)

**Output:**
```
Domain Events discovered: [list]
Commands identified: [list]
Aggregates: [list]
Bounded Contexts: [list]
Problem Frame classification: <Commanded|Information|Workpiece|Transformation|Control>
Recommended ACPL pattern groups: [G1/G2/G3/G4/G5 combination]
Ubiquitous language terms: [list]
```

**Build instructions:**
```
Create sub-agent file: .claude/agents/ts-event-storming-facilitator.md

System prompt:
  You are an Event Storming facilitator. Given a project description, run a
  structured ES session:
  1. Elicit domain events (orange stickies) — things that happened in past tense
  2. Identify commands (blue stickies) — what triggers each event
  3. Name aggregates (yellow stickies) — what handles each command
  4. Suggest bounded contexts — where language changes meaning
  5. Classify using Michael Jackson's Problem Frames
  6. Map to ACPL pattern groups using references/problem-frame-map.md

  Output as structured markdown. Be concrete — no generic examples.
  Ask one clarifying question at a time if the domain is unclear.
```

---

## 2. `ts-spec-validator`

**Phase:** Plan
**Trigger:** Always at Plan exit (min-schema gate)

**Purpose:** Verify every Spectra scenario in `spec/` meets minimum schema before
the Plan → Build transition is allowed.

**Minimum schema:**
- Feature name present
- Scenario title present
- Given clause present and non-empty
- When clause present and non-empty
- Then clause present and non-empty
- No placeholder text (`<TODO>`, `TBD`, `...`)

**Input:** Path to `spec/` directory

**Output:**
```
Scenarios checked: N
Passed: N
Failed: N
Failures:
  - spec/auth.feature line 12: missing Then clause
  - spec/bulk.feature line 34: placeholder text in When clause
Gate result: PASS | FAIL
```

**Build instructions:**
```
Create sub-agent file: .claude/agents/ts-spec-validator.md

System prompt:
  You are a BDD specification validator. Read all .feature files in the given
  directory. For each scenario, check:
    1. Feature: line present
    2. Scenario: line present
    3. Given ... line present and not empty/placeholder
    4. When ... line present and not empty/placeholder
    5. Then ... line present and not empty/placeholder
  Report each failure with file + line number. Output gate result PASS or FAIL.
  A single failure = FAIL. Do not attempt to fix scenarios — only report.
```

---

## 3. `ts-ddd-tactical-validator`

**Phase:** Review
**Trigger:** `tier=active` in registry + Review phase reached

**Purpose:** Verify that DDD tactical patterns in the codebase align with the
Spectra scenarios and the Event Storming output from Think phase.

**Checks:**
```
[ ] Every Aggregate identified in ES has a corresponding class/struct in code
[ ] Every Aggregate Root enforces its own invariants (no external mutation)
[ ] Every Repository is behind an interface (testable via fake)
[ ] Every Domain Event in ES has a corresponding event type in code
[ ] Bounded Context boundaries respected — no cross-context direct calls
[ ] Ubiquitous Language terms from ES appear in code identifiers
```

**Input:** Codebase path + ES output from Think phase (state.artifacts.domain_vocabulary)

**Output:**
```
Aggregates matched: N/N
Repository interfaces: N/N
Domain Events matched: N/N
Ubiquitous language coverage: N%
Violations:
  - OrderAggregate: state mutated directly from OrderService (not via method)
  - UserRepository: concrete class injected, not interface
Recommendation: PASS | NEEDS ATTENTION | FAIL
```

**Build instructions:**
```
Create sub-agent file: .claude/agents/ts-ddd-tactical-validator.md

System prompt:
  You are a DDD tactical design validator. Given a codebase and an Event Storming
  output, check alignment between the domain model discovered in ES and the
  implementation. Use tree-sitter or grep to scan class/interface definitions.
  Report each violation with file + line. Output a structured summary.
  PASS = all checks green. NEEDS ATTENTION = warnings only. FAIL = violations found.
```

---

## 4. `ts-mutation-analyst`

**Phase:** Test
**Trigger:** `tier=active` in registry + after mutation tool run

**Purpose:** Read the Stryker / PITest / mutmut report, classify each surviving
mutant by type, map it to the missing ACPL pattern or test, and output a
prioritized fix list.

**Surviving mutant classification → ACPL fix:**

| Mutant class | ACPL fix |
|---|---|
| Boundary value (`>` → `>=`) | Add Guard Clause test with boundary value |
| Conditional inversion | Add Specification test with negated input |
| Statement deletion | Add spy test asserting method was called |
| Return value replacement | Add assertion on exact Result/Either shape |
| State variable corruption | Add State Machine transition assertion |

**Input:** Path to mutation report (HTML or JSON)

**Output:**
```
Mutation score: N%
Surviving mutants: N
Priority fixes:
  1. [BOUNDARY] src/domain/IssueKey.ts:14 — add test: IssueKey.create("") returns Err
     Pattern: Guard Clause. Missing test kills: boundary-value mutant on regex guard.
  2. [RETURN VALUE] src/domain/BulkExecutor.ts:42 — add test: assert result.ok === false on API error
     Pattern: Result/Either. Missing test kills: return-value replacement mutant.
  ...
Acceptable survivors: N (logging/cosmetic — documented)
Recommendation: score N% vs threshold N% → PASS | FAIL
```

**Build instructions:**
```
Create sub-agent file: .claude/agents/ts-mutation-analyst.md

System prompt:
  You are a mutation testing analyst. Given a mutation report (Stryker HTML/JSON,
  PITest XML, or mutmut output), parse surviving mutants and classify each by:
    1. Mutant class (boundary/conditional/deletion/return-value/state)
    2. Source location
    3. ACPL pattern responsible
    4. Specific test missing
  Output a prioritized fix list. Distinguish high-priority (logic) from
  acceptable (cosmetic/logging). Compute final score vs registry threshold.
  Output PASS or FAIL.
```
