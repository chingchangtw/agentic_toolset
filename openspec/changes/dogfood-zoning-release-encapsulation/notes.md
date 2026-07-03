# E2E Verification Notes (task 4.1)

Run date: 2026-07-03, worktree branch `worktree-dogfood-zoning` (macOS, darwin).

| Step | Result |
|------|--------|
| `npm run release` | exit 0 — manifest regenerated, exclusions applied, `releaseVersion` 0.1.2 stamped, `.release-build/` cleaned |
| `npm run pilot` | exit 0 — PILOT PASS, 16 assertions (7 skills, 5 hooks, commands, marker, settings, hook smoke); repo tree untouched |
| `npm run dogfood` | exit 0 — ring0 gate green, mirror synced, zero `.claude/` paths in `git status` |
| `npm run dogfood:bless` | `dist/release-lkg.zip` created |
| `npm run dogfood:restore-lkg` | exit 0 — mirror re-synced from LKG, git still clean |

Environment caveats:
- `pwsh` unavailable locally → `verify-install.mjs` full parity and `.ps1` hook smoke run in CI only (ring0/pilot print loud skips).
- Bare `python3` on this machine is the known broken-arch interpreter; ring0 probes candidates like install.sh does.

Pre-existing test failures (task 4.2): 13 of 28 vitest tests fail identically on tag
`pre-dogfood-zoning` — `src/tests/unit/hook-output.test.ts` and `gate-enforcement.test.ts`
write fixture state to `.ai/` while `inject-workflow-state.sh` reads `.agents/` (stale
tests from a path migration). Not a regression from this change; needs its own fix.

Incidental fix surfaced by ring0: `src/skills/ts-orchestrate/SKILL.md` had no YAML frontmatter (skill undiscoverable by Claude Code); minimal `name`/`description` frontmatter added.
