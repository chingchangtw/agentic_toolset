# Think — Never-Automate List: EPIC-DUAL-TRACK-ORCHESTRATION

Explicit, enumerated irreversible or judgment-required operations for this epic.
No phase of this epic may auto-execute these regardless of DIAL/autonomy level.

1. **G1 / G2 sign-off** — never auto-signed at any autonomy level (hard rule,
   inherited from `ts-deliver-router` core + `ts-orchestrate` Gate Rules).
2. **Hand-editing `scripts/release-manifest.json`** — it is always regenerated
   by `scripts/generate-manifest.mjs`; a stale committed manifest must never
   drive a build (`build-release.mjs`'s own comment). Any task in this epic
   that touches the manifest edits the generator script, never the JSON file.
3. **Force-push / `git reset --hard` / `git checkout --` on this repo** — not
   needed by any task in the runbook; if a STOP-protocol revert is required,
   use `git checkout -- <file>` scoped to files touched by the failing task
   only, never a broad reset.
4. **Deleting or overwriting `discovery.json` / `iteration.json` entries** —
   audit guarantee: no entry ever deleted. Corrections are additive (new
   `notes` text, status transitions), never silent overwrites of history.
5. **`npm run release` publishing / pushing a git tag / uploading to GitHub
   Releases** — this epic only builds `dist/release.zip` locally for
   verification (T12); actual publication is a separate, human-approved step
   outside this epic's scope.
6. **Installing the built zip into any project other than a disposable
   `mktemp -d` sandbox** — T3/T12 verification never runs `install.sh`
   against this repo's own `.claude/` or the user's real `~/.claude/`
   directly; only `npm run dogfood` (which is scoped by
   `assertInsideClaude()` in `dogfood.mjs`) touches this repo's own
   `.claude/` tree.
7. **Silently "fixing" the out-of-scope items from the framing artifact's
   Non-goals section** — `sec-review`/`G2` key mismatch, `work-unit-profiles.md`
   refactor-spine contradiction, `registry.json` gate-phase tags, unbuilt
   `ts-spec-validator`/`ts-mutation-analyst`. Noticing these does not
   authorize touching them in this epic.
8. **Widening scope mid-task past what a task's Verify command checks** — the
   runbook's STOP protocol (§2.4) applies: 2 failed verifies on the same task
   → revert that task's partial edits, log to Blockers, escalate to the human.
   Never push through by expanding the task's file list.

## Recovery path (for every irreversible-adjacent operation above)

- Manifest/build/dogfood mistakes: `npm run dogfood -- --rollback` restores
  `.claude/` from the pre-sync snapshot at `.claude/.dogfood-prev/`.
- Any committed change: `git revert` (never `git reset --hard` on shared
  history) per this epic's commit plan (§4 of the runbook — 6 discrete
  commits, one logical change each).
- Discovery/iteration JSON corruption: both files are tracked in git
  (`.agents/discovery.json`, `.agents/iteration.json` per `git status` at
  epic-start) — `git diff`/`git checkout -- <path>` recovers the last
  committed state if a hand-edit goes wrong mid-epic.
