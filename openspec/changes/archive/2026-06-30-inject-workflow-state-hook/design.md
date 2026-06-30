## Context

The agenticToolset ships a 3-layer workflow orchestration system (Discovery → Delivery → 7-phase Spectra spine). Claude's compliance with phase ordering degrades under long context — phases get skipped or forgotten. The root cause is structural: `ts-project-planner` is a passive SKILL.md read once at session start; there is no per-turn enforcement.

This design implements Layer 2 of the fix: a `UserPromptSubmit` hook that reads live state on every prompt turn and injects a `[WORKFLOW STATE]` + `[NEXT]` context block before Claude sees the user's message.

Existing state files:
- `.ai/iteration.json` — written by ts-project-planner, holds active_epic + (after this change) orchestration fields
- `.ai/ts-deliver-router/state.json` — written by ts-deliver-router, holds current_phase

Existing hook dir: `src/hook/` (singular — already bundled by build-release.mjs).

## Goals / Non-Goals

**Goals:**
- Ship `inject-workflow-state.sh` that reads two state files and outputs phase context on every turn
- Ship Vitest unit tests covering all 9 phase outputs, empty state (no output), unknown phase warning, null active_epic, CLAUDE_PROJECT_DIR resolution
- Document 5 new iteration.json orchestration fields in iteration-schema.md
- Update install.sh to copy hook to `<PROJECT>/.claude/hooks/` and register UserPromptSubmit entry idempotently
- Add hook filename to build-release.mjs allowlist

**Non-Goals:**
- `/ts-orchestrate` skill or command stubs (Epic 2)
- BDD scenario test harness (Epic 2)
- `registry-lean.md` lean-phase profile (Epic 2)
- `.ai/ts-orchestrate/state.json` — orchestration fields fold into iteration.json (CEO D3)
- Windows bash support for hook (Linux/macOS only)
- Fail-loud on jq errors — silent-on-error accepted (CEO D4)

## Decisions

### Hook reads iteration.json + ts-deliver-router/state.json (not a single merged file)
Two distinct writers (ts-project-planner and ts-deliver-router) each own one file. The hook reads both independently, not a merged view, to respect the `writer_lock` contract. Merging would require a third writer and risk a 4th overlapping store.

### Hook installs to `<PROJECT>/.claude/hooks/` not `~/.claude/hooks/`
`statusLine` in `~/.claude/settings.json` is a single global string — it cannot reference per-project paths. `inject-workflow-state.sh` uses `$CLAUDE_PROJECT_DIR` at runtime so the per-project install works correctly. Global hooks (ts-session-guard.py, ts-statusline_bridge.py, wrapper) remain in `~/.claude/hooks/`.

### install.sh merges UserPromptSubmit entry idempotently
The existing `settings.json` may already have UserPromptSubmit hooks. install.sh must check for the specific command string before appending, to avoid duplicates on re-install. Uses `jq` merge, not overwrite.

### Hook uses lowercase case match for phase values
`ts-deliver-router/state.json.current_phase` stores lowercase values (`think|plan|build|review|test|ship|reflect`). Case must match exactly. Capitalized case variants are rejected.

### Fixture files are external JSON, not inline test strings
`src/tests/fixtures/phases/*.json` and `src/tests/fixtures/iteration-active.json` — external files allow the runner to use them later in the BDD scenario harness (Epic 2) without duplication. Resolved via `import.meta.url` + `fileURLToPath`.

### Hook reads active_epic from iteration.json.active_epic, not ts-deliver-router/state.json
`ts-deliver-router/state.json` has no `.epic_id` field. `iteration.json.active_epic` is the canonical source (CEO D3 bug fix).

### Do NOT echo iteration.json.epics[].notes in hook output
Free-text `notes` field is a prompt injection surface. Hook outputs only enum/id fields: `active_epic` (id), `current_phase` (enum), `dial` (enum). Injection hardening decision from TODO spec.

## Implementation Contract

### Hook behavior
`src/hook/inject-workflow-state.sh` when invoked via `UserPromptSubmit`:

**When ts-deliver-router state exists** (`$PROJ/.ai/ts-deliver-router/state.json`):
```
[WORKFLOW STATE] ts-deliver phase: <phase> | active epic: <id>
[NEXT] <phase-specific command guidance>
```
Phase → NEXT mapping (lowercase match):
- `think` → `Run /ts-deliver:refine after Spectra:discuss + G1 threat-model sign-off`
- `plan` → `Run /ts-deliver:refine after Spectra:propose + design review`
- `build` → `Run /ts-deliver:refine after Spectra:apply + test coverage gate`
- `review` → `Run /ts-deliver:refine after staff-review report`
- `test` → `Run /ts-deliver:refine after acceptance + integration gates`
- `ship` → `Run /ts-deliver:refine after Spectra:archive + G2 sec-review sign-off`
- `reflect` → `Run /ts-iteration:next (or /ts-iteration:close if last epic)`
- unknown → `[NEXT] Unknown phase: $PHASE — check state.json`

**When only iteration.json exists** (discovery mode):
```
[WORKFLOW STATE] Discovery | dial: <dial> | active_epic: <id or none>
```

**When neither file exists:** hook outputs nothing (silent).

**On jq failure / malformed JSON:** hook outputs nothing (silent-on-error, D4).

**CLAUDE_PROJECT_DIR resolution:**
```bash
PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
```

### Test contract
`src/tests/unit/hook-output.test.ts` — 9 test cases via `spawnSync('bash', ['src/hook/inject-workflow-state.sh'], { env: { ...process.env, CLAUDE_PROJECT_DIR: tmpDir } })`:
1. phase=think → stdout contains `[WORKFLOW STATE]` and `Spectra:discuss`
2. phase=plan → stdout contains `Spectra:propose`
3. phase=build → stdout contains `Spectra:apply`
4. phase=review → stdout contains `staff-review`
5. phase=test → stdout contains `acceptance`
6. phase=ship → stdout contains `Spectra:archive`
7. phase=reflect → stdout contains `ts-iteration:next`
8. No state files → stdout is empty string
9. unknown phase → stdout contains `Unknown phase`

Additional cases:
- active_epic=null → stdout contains `active epic: none` (or equivalent)
- CLAUDE_PROJECT_DIR set → hook reads from that directory (not pwd)

D4 silent-on-error behavior documented as comment in test file, NOT a failing assertion.

### install.sh changes
New variable: `PROJECT_HOOKS_DIR="${PROJECT_CLAUDE_DIR}/hooks"`
New install block after existing hooks section:
```bash
echo "→ Installing project hook → ${PROJECT_HOOKS_DIR}/"
mkdir -p "${PROJECT_HOOKS_DIR}"
cp hook/inject-workflow-state.sh "${PROJECT_HOOKS_DIR}/inject-workflow-state.sh"
chmod +x "${PROJECT_HOOKS_DIR}/inject-workflow-state.sh"
```
UserPromptSubmit registration (idempotent):
```bash
HOOK_CMD="bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/inject-workflow-state.sh\""
# merge into PROJECT_CLAUDE_DIR/settings.json if not already present
```

### build-release.mjs change
Add `'inject-workflow-state.sh'` to the hook file array at line ~73 (the `for (const f of [...])` loop).

### iteration-schema.md change
Add 5 fields to top-level fields table:
- `active_phase` — `Discovery|Delivery|null`, owner: ts-orchestrate
- `active_idea` — idea id string or null, owner: ts-orchestrate
- `dial` — `HIGH|MID|LOW`, owner: ts-orchestrate
- `epic_dial_overrides` — object keyed by epic id, owner: ts-orchestrate
- `resume_log` — array of resume events, owner: ts-orchestrate

Update `writer_lock` description: covers active_phase, active_idea, dial, epic_dial_overrides, resume_log in addition to existing fields.

## Risks / Trade-offs

- [Risk] jq not installed on target machine → hook silently outputs nothing, Claude loses workflow context. Accepted per D4. Mitigation: install.sh README note about jq dependency.
- [Risk] Malformed iteration.json → silent context loss. Same mitigation as above.
- [Risk] install.sh idempotent merge corrupts existing settings.json → Mitigation: back up settings.json before patch; use `jq` not sed for JSON manipulation.
- [Risk] Hook outputs nothing if neither state file exists → intended behavior for fresh projects; not a risk.
