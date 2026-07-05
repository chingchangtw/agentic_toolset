# Reflect — golden-agent-context-templates

## Epic summary
ts-project-init-advisor gained a golden-file sync/parity-gate/gap-scan pipeline for
the 5 repo-authored agent-context files. 9/9 build tasks complete, archived
2026-07-04, shipped directly to `origin/master` (commits `bb298a1`, `950a9fc`,
`1b395c0`, `f135276`, `46a7952`).

## What went well
- Spec-driven flow (proposal → design → tasks) held up well — task descriptions
  named exact requirements + design decisions + verify commands, made "is this
  task actually done" unambiguous.
- Manual scratch-project verification (scenarios 1–3 for the advisor's gap-scan)
  caught the classification logic working correctly before any code shipped —
  no automated harness exists for a SKILL.md's prose logic, so this was the only
  way to verify it.
- Stryker mutation testing: 100% score (61/61) on first real run once sandbox
  scope was narrowed — the actual source logic (`golden-templates.mjs`,
  `phase-routing.ts`) was well covered by existing/new tests.

## What went sideways (see LESSONS_LEARNED.md for full entries)
- **G2 gate was never formally run before shipping.** stryker/trivy weren't
  installed at Build time; the epic reached Ship via human-approved deviation,
  not gate compliance. Retroactively installed + ran both post-ship. This is
  backwards from the intended flow (gate before ship, not after).
- **Stryker's default sandbox copy crashed on a symlink** under `.claude/skills/`
  when mutate scope wasn't narrowed — cost real debugging time. Root cause:
  the deprecated `files` config silently downgrades to whole-repo `ignorePatterns`
  if not scoped explicitly.
- **Stryker's vitest-runner version had to be pinned below latest** (8.7.1, not
  9.x) because this project pins vitest ^1.0.0 and 9.x needs vitest >=2.0.0.
  This is now a standing constraint on any future vitest upgrade.
- **Backgrounded a bare `vitest` command** (defaults to watch mode, never
  exits) and forgot to kill it after switching to a foreground rerun — sat
  orphaned for the rest of the session until caught by chance.
- **trivy findings accepted, not fixed**: 1 critical + 2 high, all in
  transitive devDependencies (vitest/vite chain), time-bounded acceptance
  ("for now") recorded in `state.json` — not a permanent waiver.

## Registry / tooling changes this epic drove
- `trivy` (v0.72.0, brew) and `stryker` (`@stryker-mutator/core@~8.7.0` +
  `vitest-runner@8.7.1`) moved from `pending-setup` → `active` in
  `registry.json`, both now genuinely runnable (`npm run mutation`,
  `trivy fs --include-dev-deps`).
- `semgrep`, `github-mcp`, and the 3 sub-agent build specs
  (`ts-event-storming-facilitator`, `ts-spec-validator`, `ts-mutation-analyst`)
  remain `pending-setup` — untouched this epic.

## Carry-forward risk
- trivy's 9 dependency vulns remain unresolved, accepted short-term. Revisit
  when either (a) `@stryker-mutator/vitest-runner` ships a version supporting
  vitest >=2.0.0 compatible with a bumped vitest, or (b) the vitest bump is
  independently justified and the stryker pin is re-solved at that time.
- G2 was retroactively satisfied on the mutation-score axis only; OWASP
  checklist and SAST (semgrep) remain unchecked. Not a template for future
  epics — the gate should run *before* Ship, not after.

## Next cycle scope
None declared — no new epic queued at this Reflect.
