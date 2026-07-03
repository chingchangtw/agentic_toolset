# TODOS

## Next: Two-Epic Implementation Plan

### Context
- Doc 1 (`ctony-master-design-20260630-114813.md`): APPROVED
- Doc 2 (`ctony-master-design-20260630-121345.md`): APPROVED
- CEO Review: complete (issues_open → all resolved via decisions D1-D5)
- Eng Review: CLEARED (commit 718779b, SCOPE_REDUCED to Slice 1 first)
- Gstack tasks:
  - `~/.gstack/projects/chingchangtw-agentic_toolset/tasks-eng-review-*.jsonl` (T1-T5, Slice 1)
  - `~/.gstack/projects/chingchangtw-agentic_toolset/tasks-ceo-review-20260630-125437.jsonl` (T1-T12, full)

---

## Epic 1 — inject-workflow-state-hook ✓ DONE (commit 52a0a28, 2026-06-30)

**Type:** refactor  
**Scope:** 5 files (Slice 1)  
**Spectra change:** `openspec/changes/archive/2026-06-30-inject-workflow-state-hook/`

### Tasks
- [x] T1 (P1) `src/hook/inject-workflow-state.sh` — bash hook
  - Reads `iteration.json` (active_epic, dial, active_phase) + `ts-deliver-router/state.json` (current_phase)
  - Lowercase case match: `think|plan|build|review|test|ship|reflect`
  - Default case: `echo "[NEXT] Unknown phase: $PHASE — check state.json"`
  - PROJ from `$CLAUDE_PROJECT_DIR` fallback `$(pwd)`
  - Silent-on-error for jq failures (D4)
  - Do NOT echo `iteration.json.epics[].notes` (injection hardening)

- [x] T2 (P1) `src/tests/unit/hook-output.test.ts` + `src/tests/fixtures/`
  - Fixture JSON files in `src/tests/fixtures/phases/*.json` (one per phase)
  - `src/tests/fixtures/iteration-active.json` — `{ active_epic, dial }`
  - ESM path: `import.meta.url` + `fileURLToPath` for fixture resolution
  - 9 test cases: all phases, empty state, unknown phase warning, active_epic=null, CLAUDE_PROJECT_DIR used
  - D4 silent-on-error: document as comment, NOT a failing assertion

- [x] T3 (P1) `src/skills/ts-project-planner/references/iteration-schema.md`
  - Add 5 fields: `active_phase`, `active_idea`, `dial`, `epic_dial_overrides`, `resume_log`
  - Owner: ts-orchestrate (command surface, not state owner)
  - Update `writer_lock` description to cover new fields

- [x] T4 (P2) `release/install.sh`
  - Add `PROJECT_HOOKS_DIR="${PROJECT_CLAUDE_DIR}/hooks"`
  - Copy `inject-workflow-state.sh` + `chmod +x` → PROJECT_HOOKS_DIR
  - Idempotent UserPromptSubmit registration: `bash "$CLAUDE_PROJECT_DIR/.claude/hooks/inject-workflow-state.sh"`
  - statusLine hooks stay in `~/.claude/hooks/` (global — statusLine is single global string)
  - Do NOT break existing global hook registrations

- [x] T5 (P2) `scripts/build-release.mjs`
  - Add `'inject-workflow-state.sh'` to hook file allowlist at line 72

### Key Architecture Decisions (locked)
- Hook goes to `<PROJECT>/.claude/hooks/` (per-project) — not `~/.claude/hooks/`
- statusLine bridge stays global (`~/.claude/hooks/`) — cannot be per-project
- install.sh needs both `HOOKS_DIR` (global) and `PROJECT_HOOKS_DIR` (per-project)
- Fixtures in `src/tests/fixtures/` (JSON files, not inline)
- Unknown phase → emit `[NEXT] Unknown phase: $PHASE — check state.json` warning

### Run sequence
```
/spectra-propose    # scope = Epic 1, points at Doc 1 Layer 2 + T1-T5
/ts-iteration start # creates iteration.json with Epic 1 + Epic 2 queued
/ts-deliver init    # starts Epic 1 (Think→Plan→Build→Review→Ship→Reflect)
```

---

## Epic 2 — orchestration-test-harness

**Type:** epic (full 7-phase + Spectra BDD)  
**Scope:** Slice 2 — full test harness + ts-orchestrate command layer  
**Spectra change:** `openspec/changes/orchestration-test-harness/`  
**Status:** queued — starts after Epic 1 ships

### Tasks (from CEO review T1-T12, deferred from Slice 1)
- [ ] `src/utils/phase-routing.ts` — `getPhaseList(epicType)` + `phase-routing.test.ts`
- [ ] `src/tests/unit/state-schema.test.ts` — REQUIRED-field list + validates all fixtures (Criterion #3)
- [ ] `src/tests/unit/gate-enforcement.test.ts` — 3 hook-testable edge cases from edge-tests.md
- [ ] `scripts/run-scenario.sh` — TAP runner + single-source FIXTURE_MAP
- [ ] `tests/orchestration/fixtures/iteration-state/` — 9 iteration.json fixtures (bugfix/refactor/epic × HIGH/MID/LOW)
- [ ] `tests/orchestration/scenarios/S1-S9.md` — BDD scenario specs with strict `assert:` blocks
- [ ] `tests/orchestration/scenarios/S10-S12.md` — resume-incoherent, feedback-loop, gate-bypass
- [ ] `src/skills/ts-orchestrate/SKILL.md` + 3 commands (start, status, next)
- [ ] `src/skills/ts-deliver-router/references/registry-lean.md` — Think→Build→Ship for bugfix
- [ ] `.github/workflows/test.yml` — npm test + S1-S9 scenario runner on PR to master
- [ ] CLAUDE.md workflow routing table (Layer 1)
- [ ] T12: harden hook — echo only enum/id fields (no free-text notes — prompt injection)

### Run sequence
```
/spectra-propose    # scope = Epic 2, points at Doc 1 Layer 3 + Doc 2 full harness
# after Epic 1 ships:
/ts-deliver init    # starts Epic 2 (full 7-phase)
```

---

## Design Docs (on disk, both APPROVED)
```
~/.gstack/projects/chingchangtw-agentic_toolset/ctony-master-design-20260630-114813.md  ← Doc 1
~/.gstack/projects/chingchangtw-agentic_toolset/ctony-master-design-20260630-121345.md  ← Doc 2
```
