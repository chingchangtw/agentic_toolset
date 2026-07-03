# Strategy: Framework Authoring + Dogfooding in One Repo

## Context

The repo authors an agentic development framework (skills, hooks, scaffold) under `src/`, distributed to end-user projects via a release package. The author also dogfoods the framework inside the same repo. Two chronic problems: (1) dogfood deployment mutates non-`src` folders and dirties git; (2) the release package is poorly encapsulated. This is a strategy proposal (no code changes yet).

## Core Principle

**`src/` is the only place humans edit. Everything else that mirrors it is a build artifact — generated, gitignored, disposable.**

The moment a copy of a deliverable lives in a git-tracked runtime folder (`.claude/`, `.agents/`), you have two sources of truth and every dogfood deploy becomes a diff bomb. The fix is not better copying discipline; it's making the dogfood target *not tracked at all*.

## Strategy — Six Pillars

### 1. Split runtime dirs into three zones with different git rules

| Zone | Contents | Git |
|------|----------|-----|
| **Source** | `src/skills/`, `src/hook/`, `src/commands/`, `src/scaffold/` | tracked, hand-edited |
| **Dev tooling** | third-party/dev-only skills in `.claude/skills/` (spectra, caveman, …) not authored here | tracked, hand-edited |
| **Dogfood mirror** | the framework's own skills/hooks copied into `.claude/` for self-use | **gitignored, never hand-edited** |

Gitignore is path-specific (one line per deliverable skill/hook dir under `.claude/`), not a blanket `.claude/`. The list of ignored paths is *generated from the release manifest* so it can never drift: a small script emits/refreshes a marked block in `.gitignore`.

### 2. Dogfood through the installer, not by copying

Two dogfood modes, both writing only into gitignored zones:

- **Inner loop (fast):** `npm run dogfood` — sync script reads the release manifest and copies `src/*` → `.claude/*` dogfood paths, deleting stale files first (mirror semantics, not additive copy). Optionally symlink instead of copy for zero-lag editing (verify the harness follows symlinked skill dirs; if yes, symlinks win — edits in `src/` are live instantly and there is literally nothing to sync).
- **Release rehearsal (honest):** `npm run dogfood:release` — build `dist/release.zip`, then run the *actual* `install.sh` against the repo itself. This tests the exact artifact end-users get, including manifest routing and installer bugs. Do this before every release tag.

Rule: if `git status` shows changes after dogfooding, that is a bug in the zoning, fixed by adjusting the generated ignore block — never by committing the mirror.

### 3. Manifest as single contract, always regenerated

One manifest drives everything: build, install, dogfood sync, gitignore block, uninstall. Never commit a hand-edited or stale manifest as an input to a build — `build` always runs `generate-manifest` first. Anything the manifest doesn't declare doesn't ship and doesn't get dogfood-synced.

### 4. Encapsulated release = allowlist per artifact + version stamp

- **Per-skill allowlist, not blind dir copy.** Convention: a skill ships `SKILL.md` + an explicit `files:` list (in SKILL.md frontmatter or a sidecar `package.json`-style field). Build copies only declared files; scratch dirs (`rawfiles/`, `ideas/`, drafts, `*.original.md`) can live next to the skill in `src/` without ever leaking into the zip. Alternative (cheaper): global exclusion patterns in the build script — acceptable v1, but allowlist is the durable answer because exclusion lists rot.
- **Version stamping.** Embed `package.json` version into the zip's `manifest.json`; installer writes a marker (e.g. `.claude/.toolset-version`) into the target project. Enables: upgrade detection, "what version is installed?", clean reinstall.
- **Install manifest for uninstall/sync.** Installer records every file it wrote. This gives clean uninstall, stale-file deletion on upgrade, and lets the dogfood sync distinguish "framework-owned" from "user-owned" files in `.claude/`.
- **Build verification gate.** After zipping, assert: no undeclared files in zip, size ceiling, every manifest entry present. `verify-install.mjs`-style parity check runs in CI on every release.

### 5. Safe dogfooding: verify → pilot → dogfood, always reversible

Fear addressed here: "eating dogfood without verification could destroy the project." Mitigations, in rings:

**Ring 0 — static verification (seconds, every change):**
- Skill lint: SKILL.md frontmatter parses, declared files exist, no cross-skill imports.
- Hook smoke test: run each hook script against fixture stdin (sample UserPromptSubmit payload), assert exit 0 + well-formed output. Hooks are the dangerous part — a broken hook bricks every prompt turn, so they get executable tests, not just packaging checks.
- Build + `verify-install` parity check on the zip.

**Ring 1 — pilot sandbox (minutes, before any self-install):**
- A disposable fixture project (e.g. `test-fixtures/pilot/` — gitignored contents, or a scratch sibling dir). `npm run pilot` = build zip → run real `install.sh` into the fixture → run smoke script there (launch a headless `claude -p "..."` session or at minimum execute the installed hooks against fixture payloads) → report pass/fail. The pilot absorbs any damage; main repo untouched.

**Ring 2 — dogfood into this repo (only after Ring 0+1 green):**
- `npm run dogfood` refuses to run unless Ring 0 checks pass (wired as a pre-step).
- Before overwriting, sync script snapshots the current mirror to `.claude/.dogfood-prev/` (gitignored). `npm run dogfood:rollback` restores it in one command.
- Keep a pinned **last-known-good** zip (`dist/release-lkg.zip`, updated only on explicit `npm run dogfood:bless`). Nuclear recovery: `npm run dogfood:restore-lkg` reinstalls from it.

**Why the blast radius is inherently small once zoning (Pillar 1) lands:**
- The dogfood mirror is generated and gitignored — deleting it loses nothing; `src/` and tracked dev tooling are never written by the sync.
- The sync only touches manifest-declared paths; it structurally cannot clobber `.claude/settings.json`, dev-tooling skills, or `src/`.
- Worst realistic failure = a bad hook making sessions unusable → fix by `dogfood:rollback` from a plain terminal, no Claude session needed.

**Migration itself de-risked:** do the zoning migration on a branch; before `git rm --cached`, tag the current state (`pre-dogfood-zoning`) so the old tracked copies remain recoverable from history forever.

### 6. Separate machine state from repo content

Runtime state files the framework writes (`.agents/*.json`, phase state, history logs) are machine-local: gitignore them, ship a documented schema or `*.example.json` instead. Tracked state files are the other half of the "changes apply to non-src folders" pain — every session dirties them.

## Migration Order (when implemented)

1. Add manifest-driven gitignore block generator; generate ignore entries for dogfood mirror paths + state files.
2. `git rm --cached` the mirrored skill/hook/command copies and state files (ignore entries first, then untrack — order matters or git keeps showing them).
3. Write `scripts/dogfood.mjs` (mirror sync from manifest; `npm run dogfood`).
4. Build hardening: always regenerate manifest, allowlist/exclusions, version stamp, drop dead packaged files, install `commands/`, clean `.release-build/` after zip.
5. Ring 0 checks (skill lint + hook smoke tests) wired as `dogfood` pre-step.
6. Pilot fixture + `npm run pilot` (Ring 1).
7. `dogfood:rollback`, `dogfood:bless` / last-known-good zip, `dogfood:release` wiring.
8. CI: build + verify + pilot + "dogfood leaves git clean" check.

## Verification

- Ring 0: skill lint + hook smoke tests green.
- Ring 1: `npm run pilot` installs into fixture, smoke passes, main repo untouched.
- `npm run dogfood && git status --porcelain` → empty; `dogfood:rollback` restores previous mirror.
- `npm run dogfood:release` → installs from real zip, git still clean, `.claude/.toolset-version` matches `package.json`.
- Unzip `dist/release.zip` → only manifest-declared files, no `rawfiles/`/`ideas/`/drafts.
- Fresh-dir install test → skills/hooks/commands land, settings patched, marker written.
