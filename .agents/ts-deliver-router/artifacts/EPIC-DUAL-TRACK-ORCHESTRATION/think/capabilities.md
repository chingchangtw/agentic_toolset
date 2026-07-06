# Think — Capabilities Affected: EPIC-DUAL-TRACK-ORCHESTRATION

New/changed capabilities, grouped by the runbook's 4 bounded contexts
(`tasks/dual-track-orchestration-plan.md` §0/§1).

## discovery (ts-project-planner Layer D)

- `references/commands.md` — `explore` gains a required-output gate
  (facilitator must populate `exploration_output` or status stays `idea`);
  `validate` gains a mandatory `ts-ddd-tactical-validator` run; `decide build`
  gains a precondition (`ddd_validation.recommendation != FAIL`).
- `references/discovery-state.md` — schema gains `ubiquitous_language_terms[]`
  and `validation_output.ddd_validation`.
- `references/agents.md` — 2 new sub-agent rows.

## delivery (ts-deliver-router)

- No direct edits to `ts-deliver-router` itself in this epic (confirmed: T1-T12
  never touch `src/skills/ts-deliver-router/SKILL.md`) — only a documentation
  note added to `references/sub-agents.md` marking agents #1 and #3 "shipped".
- `work-unit-profiles.md` (planner-owned, read by `/ts-iteration next` step 4)
  gains 6 new profile blocks (feature/hotfix/chore/patch/spike/ops).

## packaging (release/build scripts) — highest blast-radius area

- `scripts/generate-manifest.mjs` — new `agents[]` scan + manifest field.
- `scripts/build-release.mjs` — new copy section for `manifest.agents`.
- `scripts/dogfood.mjs` — `mirrorTargets()` + `--from-zip` branch both gain
  an agents loop.
- `release/install.sh` (+ `release/install.ps1`, unread until T3 — flagged
  [JUDGE] in the runbook) — new agents-install section, guarded so it's a
  no-op against zips built before this epic (missing `agents` key).
- `scripts/verify-install.mjs` — read-first, extend only if it already
  enumerates categories.

**This is the capability with real external blast radius**: every existing
installed user's `.claude/` tree is a consumer of `release/install.sh`.
The change is additive (new manifest key, new install section) and
explicitly designed to no-op on old zips — but it is still the one part of
this epic that touches something outside this repo's own working tree.

## orchestration (ts-orchestrate)

- `SKILL.md` — full rewrite: Entry Gate (Discovery-entry types now exempt),
  Workflow Routing table (9 work types, replaces old 3-row epic-type table),
  Workflow Guidance table (new — 14 rows, both tracks), Gate Rules table.
- `commands/start.md` — full rewrite: 9 WORK_TYPE values, Discovery-entry
  branch.
- `commands/next.md` — gate-matrix + spike-Reflect-variant edits.
- `src/utils/phase-routing.ts` — full rewrite: 9-value union, 6 new spine
  cases.
- `src/hook/inject-workflow-state.sh` — Discovery-branch `[NEXT]` case
  statement added (bash, `jq`).

## Cross-cutting (not owned by one context)

- 2 new files: `src/agents/ts-event-storming-facilitator.md`,
  `src/agents/ts-ddd-tactical-validator.md`.
- Tests: `phase-routing.test.ts` (+6 cases), `state-schema.test.ts` (+24
  fixture names), 18 new fixture JSON files, `hook-output.test.ts` (path fix +
  7 new Discovery-branch tests), `gate-enforcement.test.ts` (path fix only).
- `openspec/changes/dual-track-orchestration/` — new Spectra change proposal
  (this epic's Plan-phase spec artifact).
