# Iter4 Retro — EPIC-PLDD-ENFORCEMENT-KERNEL (Phase A)

Epic-level retro, not an iteration close. Iter4 has 2 epics
(EPIC-PLDD-ENFORCEMENT-KERNEL, EPIC-PLDD-CONSUMER-ADAPTERS); only the first
is done. This retro covers Phase A only; a full Iter4 retro follows once
Phase B (consumer adapters) ships.

## Summary

Think→Plan→Build phases were already complete going into this session (G1
signed off 2026-07-13, 13/13 build tasks done). This session ran
Test→Ship→Reflect: fixed a mutation-sandbox config bug, drove mutation score
from 57.50% (measured against the wrong config) to 86.22% across 5 kernel
files, found and fixed a real glob-matching defect, signed G2, opened and
merged PR #7 into master.

## What shipped

Phase-A pattern-language enforcement kernel:
- `src/scripts/pl-arch-check.mjs` — layer-manifest architecture/import
  boundary checker
- `src/scripts/pl-contract-check.mjs` — contract-declaration/violation-test
  identity checker
- `src/scripts/pl-scope-guard.mjs` — Phase-A implementation-path scope guard
- `src/scripts/gen-scenarios.mjs` — BDD scenario generator + event-coverage
  checker
- `src/skills/ts-pl/` skill wiring, `src/utils/contracts.ts` runtime
  contract helpers, golden fixtures under `src/tests/fixtures/pl-sample-app/`

Merged to master via PR #7, commit `42572ec`.

## Gate outcomes

- **G1** (threat-model, end of Think): signed off by ctony, 2026-07-13.
  Approval scoped explicitly to Phase-A planning only.
- **G2** (sec-review, start of Ship): signed off by ctony, 2026-07-19.
  8/8 checklist items — mutation score ≥85% (86.22% overall; per-file
  pl-scope-guard.mjs 100%, contracts.ts 100%, pl-contract-check.mjs 86.81%,
  pl-arch-check.mjs 85.44%, gen-scenarios.mjs 85.12%), survivors reviewed,
  dependency rescan clean (0 vulns), human sign-off.

## What worked

- Treating the mutation-score gate as a real quality bar, not a checkbox:
  the first Stryker run this session used the wrong top-level
  `stryker.conf.json` (57.50%) instead of the epic-scoped
  `stryker.phase-a.conf.json` (85% threshold) — caught before signing G2,
  not after.
- Writing tests to actually kill survivors (not just chase the number)
  surfaced a real production defect: `compileGlob`'s mid-path `**` segment
  could never match any file at any directory depth, because the segment
  join inserted a redundant `/` after the `**` expansion. Fixed and
  reverified (commit `744a254`) rather than left as a documented "known
  behavior."
- Root-causing survivor patterns instead of chasing individual mutants:
  most survivors in each file were the CLI entrypoint's
  `if (import.meta.url === pathToFileURL(process.argv[1]).href)` guard,
  which `spawnSync`-based subprocess tests structurally cannot kill
  (Stryker's vitest-runner activates mutants via an in-process namespace,
  invisible to a spawned child process). Switching those tests to
  in-process dynamic `import()` with controlled `process.argv` fixed the
  whole class at once across all 3 CLI scripts.

## What was hard / notable risk

- **Merge conflict on landing**: master had a stale `.agents/` snapshot
  (commit `edff5e7`, "track dev-tooling files") that predated this branch's
  later work, causing add/add conflicts on `state.json`, `history.jsonl`,
  and `discovery.json`. Verified content-by-content that the branch's
  version was a strict superset in all three cases before resolving via
  `checkout --ours` — no silent data loss, but worth flagging: `.agents/`
  being tracked in git at all creates this class of conflict on long-lived
  branches. Consider whether router state should stay gitignored and be
  reconciled another way, or whether branches should rebase more frequently.
- PR merge required explicit human confirmation past Claude Code's
  "merge without review" auto-mode guard (self-authored PR, no GitHub-side
  approval) — correctly blocked twice on ambiguous phrasing ("merge the
  PR" / "yes, merge it") until the human merged it directly via the GitHub
  UI. Working as intended, not a bug.

## Follow-ups (non-blocking)

- 109 remaining mutation survivors in `pl-arch-check.mjs` (mostly deep
  lexer/tokenizer internal boundary arithmetic and genuinely-equivalent
  sort-comparator removals) — file already clears 85%, not required to
  chase further.
- `.claude/skills/*` mirrors under `.github/skills/` were not touched this
  session (unclear if they're a manual mirror or should be
  build-generated) — worth clarifying ownership before the next epic edits
  `src/skills/ts-deliver-router/`.
- EPIC-PLDD-CONSUMER-ADAPTERS (Phase B) is next in queue, depends on this
  epic (satisfied). Not started this session.
