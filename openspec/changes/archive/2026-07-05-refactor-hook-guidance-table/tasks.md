# Tasks — refactor-hook-guidance-table

- [x] T1 Rewrite `src/hook/inject-workflow-state.sh` per design.md target script
      (transcription — the full script is in design.md, verbatim).
      Verify: `bash -n src/hook/inject-workflow-state.sh` — passed.
- [x] T2 Regression: `npx vitest run src/tests/unit/hook-output.test.ts
      src/tests/unit/gate-enforcement.test.ts` — all 24 pass, ZERO test edits
      (confirmed via `git diff --stat src/tests/` empty). Full suite 74/74,
      `npm run type-check` clean.
- [x] T3 Manual smokes: 22 scenarios captured pre-refactor (7 delivery phases,
      unknown phase, reflect×spike/non-spike, ship×G2 pending/signed, dry-run,
      schema mismatch, 5 Discovery focus cases, malformed/missing files, empty
      project), byte-diffed identical post-refactor — 0 diffs, 0 stderr.
      `npm run pilot` PASS, `npm run dogfood` re-synced, mirror diff-confirmed
      identical to src/.
- [x] T4 Commit: `refactor(hook): restructure inject-workflow-state.sh as
      guidance-table transcription` (02d6e88) — single commit, hook file only.
