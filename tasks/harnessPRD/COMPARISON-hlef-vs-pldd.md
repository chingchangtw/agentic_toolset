# HLEF vs PLDD — Comparison & Sequencing Recommendation

**Date:** 2026-07-07
**Inputs:** `tasks/PRD-harness-loop-engineering.md` (v1.4) · `tasks/PRD-PLDD-multi-scale-pattern-language.md` (PROPOSED)
**Status:** Recommendation — awaiting Tony's review

---

## Verdict

Not competitors — different altitude. **PLDD constrains the work product** (what code gets
generated, where, with what checks); **HLEF constrains the worker** (how agent runs operate:
guardrails, HITL, incidents, scheduled loops). Complementary layers, but three real overlaps
need dedup before either ships.

---

## Side-by-side

| | HLEF v1.4 | PLDD |
|---|---|---|
| Ships as | `ts-hlef` skill + 2 hooks | `ts-pl` skill + 3 agents + 2 scripts + contracts util |
| Layer | Runtime ops: work packages, guardrails, HITL, incident SOP, scheduled loops | Artifact quality: scenarios, arch placement, contracts, templates |
| Problem killed | Vibe coding, self-approval, amnesiac loop, comprehension debt | Wrong placement, silent wrong behavior, unmeasured coverage, review bottleneck |
| Enforcement style | Mixed — hooks for Tier 0/1, but much prose/SOP/template | Hard-line: every rule needs `cmd`/`schema`/`checklist`/`template` class or it's a defect |
| Human machinery | Adds HITL nodes, Rule of Two, timeouts, sign-offs | Explicitly zero new human gates |
| Shape | Course-driven (P1–P8 practices, syllabus traceability) | Production-driven (dogfood on Atlassian pilot, metrics, cut-lines per feature) |
| Concrete code deliverables | 2 hook scripts; rest is markdown | `gen-scenarios.mjs`, `gen-depcruise.mjs`, `contracts.ts`, eslint/depcruise actually installed |
| Maturity | v1.4, polished, 6 sprints | PROPOSED, ends "run `/spectra-propose` R0" |

---

## The 3 collisions

### 1. Constraint ladder duplicated
HLEF Feature 1.3 (Requirements / Large / Mid / Small / Micro ladder) IS PLDD's entire S1–S5
thesis, sketched in one table. If both ship as written, the repo carries two divergent copies
of the same pattern language.

**Fix:** HLEF 1.3 becomes a pointer to `ts-pl`; PLDD owns the ladder.

### 2. Two evolution loops, same protocol
HLEF Module 4 (`evolution-log.md`, error taxonomy E1–E7, anti-dogma "2+ independent
occurrences") vs PLDD F8 (`pattern-feedback.jsonl`, `recurrence_key` 2nd-occurrence
escalation). Identical reflex, two files, two formats, two taxonomies.

**Fix:** one shared feedback store, or an explicit split — F8 owns pattern-scale errors,
Module 4 owns agent-behavior errors, each cross-referencing the other.

### 3. Two "define an agent" formats
HLEF work-package schema (`role` / `capabilities` / `prohibited_actions` / `output_contract` /
`escalation_trigger`) ≈ PLDD F3 role card (`Charter` / `Context diet` / `Output contract` /
`Forbidden` / `Escalation`). Near field-for-field match.

**Fix:** one canonical field set — role card as authoring format, work package as runtime
instantiation, with an explicit field mapping.

### Smaller duplications
- HLEF 5.3 deterministic-gates philosophy = PLDD 3.1 Sonnet-runnability rule, stated twice
  (PLDD's version is more operational — four named enforcement classes).
- Both register generator-evaluator / independent verification as an `always` CHECKS REGISTRY
  row — should be one row, not two.

---

## Unique, no overlap

**HLEF only:**
- Module 2: HITL nodes, incident SOP, Rule of Two (lethal-trifecta prevention)
- Module 5 loop engineering: scheduling/cron, worktree handoff, persistence, `[LOOP STATE]` hook
- Orchestration pattern library: debate / committee (high-stakes patterns)
- Comprehension-debt protocol (daily sample reading, demo-velocity metric)
- Retry ceiling / circuit breakers on gate failure

**PLDD only:**
- Scenario compiler off event-storm output (F1)
- Machine arch guard: `layers.map.json` → dependency-cruiser (F2)
- DbC contracts util + violation-test parity rule (F5)
- Prompt template library (F6)
- Build-phase production line with stations (F7)
- Registry placeholder fill: mutation/coverage thresholds (F9)

---

## Recommendation

**PLDD first.**

1. **R0+R1 now** (arch:check + contracts): cheap, concrete, immediately changes daily reality,
   and builds the deterministic-gate machinery HLEF Module 5 would consume as its gate scripts.
2. **Slim HLEF before implementing**: keep its unique core (Module 2 + Module 5); Modules
   1/3/4 shrink to thin wrappers over ts-pl + F3 + F8.
3. **Resolve the 3 collisions above** as edits to the HLEF PRD (it is the earlier document;
   PLDD reads like the later, more disciplined distillation — grounds every feature in what
   exists (§3.2), self-applies its own enforcement rule, has per-feature cut-lines).

HLEF's course framing (P1–P8 practices) is its distinct value, not its infrastructure —
preserve the practices, delegate the machinery.

---

## Next actions (pending approval)

- [ ] Answer PLDD OQ-1..OQ-8 (recommended defaults are in that PRD §10)
- [ ] `/spectra-propose` PLDD R0 (`pl-enforcement-base`)
- [ ] Patch HLEF PRD: 1.3 → pointer, Module 4 → split/merge with F8, work-package ↔ role-card field map
- [ ] Decide HLEF fate: slim to Modules 2+5, or park until PLDD R3 lands
