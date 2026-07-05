Full task detail (anchors, file contents, edit instructions) lives in
`tasks/dual-track-orchestration-plan.md` — this file is the openspec-tracked
checklist mirror. Mark each item `[x]` only when its Verify command has
actually passed.

## 1. Discovery Sub-Agents (T1-P1)

- [x] 1.1 (T1) Create `src/agents/ts-event-storming-facilitator.md` and
  `src/agents/ts-ddd-tactical-validator.md` per the runbook's full file
  content. Verify: `ls src/agents/ && head -5 src/agents/*.md`

## 2. Packaging Pipeline (T2-P1, T3-P1)

- [x] 2.1 (T2) `scripts/generate-manifest.mjs` scans `src/agents/` →
  `manifest.agents[]`. Verify: `node scripts/generate-manifest.mjs && node -e "const m=require('./scripts/release-manifest.json'); if(m.agents?.length!==2) process.exit(1); console.log('agents ok')"`
- [x] 2.2 (T2) `scripts/build-release.mjs` copies `manifest.agents` into the
  build dir. Verify: `npm run release && unzip -l dist/release.zip | grep 'agents/'`
- [x] 2.3 (T2) `scripts/dogfood.mjs` mirrors `agents[]` (both `mirrorTargets()`
  and `--from-zip`). Verify: `npm run dogfood && ls .claude/agents/`
- [x] 2.4 (T2) `scripts/ring0-check.mjs` extended with an existence-check
  loop over `manifest.agents ?? []` (agents are prompts, not executables —
  no smoke-run). Verify: `npm run ring0` — passes, 2 "agent exists" lines
- [x] 3.1 (T3) `release/install.sh` installs `agents[]` to
  `${PROJECT_CLAUDE_DIR}/agents/`, no-op on manifests missing the key. Verify:
  `TMP=$(mktemp -d) && cd "$TMP" && ZIP_FILE=<REPO_ROOT>/dist/release.zip bash <REPO_ROOT>/release/install.sh && ls .claude/agents/` — confirmed both files
- [x] 3.2 (T3) `release/install.ps1` mirrors the same pattern (foreach over
  `$manifest.agents`, Copy-Item to `$ProjectClaudeDir\agents\$name.md`).
  **Not verified locally** — `pwsh` not installed on this machine; syntax
  matches the existing hooks-loop pattern exactly. CI (ubuntu-latest, has
  pwsh per `verify-install.mjs` docstring) will catch any syntax error.
- [x] 3.3 (T3) `scripts/verify-install.mjs` extended — both inline harnesses
  (bash + pwsh) gained an `AGENTS_DIR` + agents-copy loop, since the file's
  whole purpose (installer parity) would otherwise miss drift in the new
  category. **Verify blocked locally** (pwsh absent) — same caveat as 3.2.

## 3. WORK_TYPE Expansion (T4-P1, T5-P1, T9.5-P2)

- [x] 4.1 (T4) `src/utils/phase-routing.ts` — 9-value union, 6 new spine
  cases. Verify: `npx vitest run src/tests/unit/phase-routing.test.ts` — 9/9 pass
- [x] 5.1 (T5) 18 new iteration-state fixtures (6 types × 3 dials) + 18 names
  in `state-schema.test.ts`'s `FIXTURE_NAMES`. Verify:
  `npx vitest run src/tests/unit/state-schema.test.ts` — 28/28 pass
- [x] 9.5.1 (T9.5) `src/tests/unit/spine-consistency.test.ts` — asserts the 6
  new types' spines match between `phase-routing.ts` and
  `work-unit-profiles.md`. Verify: 6/6 pass

## 4. ts-orchestrate Dual-Track Rewrite (T6-P1, T7-P1)

- [x] 6.1 (T6) `src/skills/ts-orchestrate/SKILL.md` full rewrite — Entry Gate,
  Workflow Routing (9 work types), Gate Rules, Workflow Guidance (14 rows,
  both tracks). Verify: 7/7 both grep counts
- [x] 7.1 (T7) `commands/start.md` full rewrite (9 WORK_TYPE values,
  Discovery-entry branch). Verify: 3 POC occurrences
- [x] 7.2 (T7) `commands/next.md` gate-matrix + spike-Reflect-variant edits,
  no duplicate spine table. Verify: 0 per-type bullets remain

## 5. Hook Discovery Branch + Test-Path Fix (T8-P1)

- [x] 8.1 (T8) `src/hook/inject-workflow-state.sh` — Discovery-branch `[NEXT]`
  case statement (focus-idea priority per D11)
- [x] 8.2 (T8) Fix `.ai`→`.agents` in `hook-output.test.ts` +
  `gate-enforcement.test.ts` (pre-existing breakage, D12)
- [x] 8.3 (T8) 7 new Discovery-branch test cases in `hook-output.test.ts`.
  Verify: 22/22 pass across both files; manual smoke test confirmed
  `[NEXT] Run /ts-discover validate idea-001 ...`

## 6. Discovery Sub-Agent Wiring (T9-P1)

- [x] 9.1 (T9) `references/commands.md` — facilitator required at explore
  exit, validator required at validate/decide build (3 anchored edits)
- [x] 9.2 (T9) `references/discovery-state.md` — schema gains
  `ubiquitous_language_terms[]` + `validation_output.ddd_validation`
- [x] 9.3 (T9) `references/agents.md` — 2 new sub-agent rows
- [x] 9.4 (T9) `references/work-unit-profiles.md` — 6 new profile blocks
  (feature/hotfix/chore/patch/spike/ops), existing epic/refactor/bugfix
  blocks untouched
- [x] 9.5 (T9) `references/commands.md` registry-profile type list extended.
  Verify: ddd_validation=3, ubiquitous_language_terms=1, ts-ddd-tactical-validator=1

## 7. Documentation Cleanup (T10-P2)

- [x] 10.1 (T10) `ts-project-planner/SKILL.md` Workflow Routing section
  slimmed to pointer + Discovery-internal routing
- [x] 10.2 (T10) `ts-deliver-router/references/sub-agents.md` — "shipped"
  status notes on agents #1 and #3. Verify: grep count = 2
- [x] 10.3 (T10) `tasks/ideasToImproveOrchestration.md` — done-markers on the
  2 covered items (preserve unstaged user edits)

## 8. Full Verification + Dogfood (T12-P1)

- [x] 12.1 `npm run type-check && npx vitest run` fully green — 69/69 tests,
  6 files. **Note:** `npm test` is bare `vitest` (watch mode — hangs), used
  `npx vitest run` instead (flagged as a real fix opportunity, see report)
- [x] 12.2 `npm run release && unzip -l dist/release.zip | grep 'agents/'` —
  2 agent files listed
- [x] 12.3 `npm run dogfood && ls .claude/agents/` — 2 files mirrored
- [x] 12.4 Hook smoke test both branches (Delivery `think`, Discovery `ready`)
  — both correct
