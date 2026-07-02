## Context

Release packaging logic lives in three independent places: `scripts/build-release.mjs`, `release/install.sh`, and `release/install.ps1`. All three independently enumerate which skills and hooks to include and where to install them. A structural change (e.g., the `ondemand/` skill tier) must be manually applied to all three — the ondemand bug confirmed this is fragile.

The solution is a single declarative manifest at `scripts/release-manifest.json` — co-located with the build scripts that produce and consume it — that all three scripts read. A generator script (`generate-manifest.mjs`) synthesizes the manifest from `src/` at release time; it is idempotent and preserves any hand-authored metadata.

**Constraints:**
- No new end-user runtime dependencies: `python3` already used in `install.sh`; PowerShell `ConvertFrom-Json` already used in `install.ps1`; neither `jq` nor Node is available on user machines
- `npm run release` is the single command users run — `generate-manifest` must chain into it transparently
- Manifest format must be parseable by both `python3 -c "import json"` and PowerShell `ConvertFrom-Json` (standard JSON, no comments, no trailing commas)

## Goals / Non-Goals

**Goals:**
- Single source of truth for what gets packaged and where it installs
- Generator auto-discovers skills and hooks by scanning `src/` — no manual list maintenance
- `build-release.mjs` reads manifest instead of enumerating skill dirs itself
- Both install scripts read manifest instead of hardcoding install logic
- `npm run release` chains `generate-manifest && build-release`
- CI parity check catches installer drift before release

**Non-Goals:**
- Does not change what gets installed on user machines
- Does not add install-time network calls or version resolution
- `verify-install.mjs` checks structural parity only — not hook registration or settings patching
- Does not replace the zip-based distribution format

## Decisions

### Manifest format: flat arrays of typed entries

```json
{
  "version": "1",
  "skills": [
    { "name": "ts-deliver-router", "src": "src/skills/ts-deliver-router", "dest": "skills/ts-deliver-router" },
    { "name": "ts-project-init-advisor", "src": "src/skills/ondemand/ts-project-init-advisor", "dest": "skills/ondemand/ts-project-init-advisor" }
  ],
  "hooks": [
    { "name": "ts-session-guard.py", "src": "src/hook/ts-session-guard.py", "dest": "hook/ts-session-guard.py", "scope": "user" },
    { "name": "inject-workflow-state.sh", "src": "src/hook/inject-workflow-state.sh", "dest": "hook/inject-workflow-state.sh", "scope": "project" }
  ]
}
```

**Why `dest` mirrors the zip-internal path (not the final install path):** The build script owns the zip layout; the install scripts map `dest` → final directory. This decouples manifest from per-OS install roots.

**Why `scope` field on hooks:** `user` hooks install to `~/.claude/hooks/`; `project` hooks install to `[project]/.claude/hooks/`. The generator defaults to `user` for all hooks except `inject-workflow-state.sh` (which is `project`). Install scripts read `scope` to route each hook — eliminates the current hardcoded routing in all three files.

**Alternatives considered:** Nested object keyed by skill name — rejected because flat arrays serialize more predictably across Python/PowerShell JSON parsers and diff better in git.

### Generator strategy: scan-then-merge

`generate-manifest.mjs` scans `src/skills/` (recursing into `ondemand/`) and `src/hook/` to build a candidate manifest, then merges with any existing `scripts/release-manifest.json` to preserve `scope` values already set. Entries no longer present in `src/` are dropped.

**Why merge instead of overwrite:** `scope` on hooks is not derivable from file path alone; the generator must preserve it across re-runs.

**Why drop removed entries:** Stale entries in the manifest would cause build failures (missing source) — silent omission is more dangerous than an explicit scan.

### build-release.mjs: read manifest, remove skill enumeration loop

Current `copySkillsDir` recursive function is replaced by a manifest read + loop over `manifest.skills`. Each entry is validated (SKILL.md present) then copied to `BUILD/<entry.dest>`. Hook entries are looped similarly, replacing the hardcoded allowlist.

**Why remove copySkillsDir entirely (not adapt it):** The `ondemand` recursion logic is what failed. Manifest-driven iteration is flat and explicit — no recursion, no special-casing.

### install.sh: replace skill/hook loops with manifest-driven loops

`install.sh` currently loops `skills/*/` and special-cases `ondemand`. Replace with: extract manifest from zip, parse with `python3`, loop `manifest.skills`, copy `dest` → mapped install path.

**Python parsing is already used** in `install.sh` for settings patching — no new dependency.

Hook routing replaces the current hardcoded `scope` assumption: loop `manifest.hooks`, check `scope` field, route to `~/.claude/hooks/` (user) or `[project]/.claude/hooks/` (project).

### install.ps1: same logic via ConvertFrom-Json

PowerShell `ConvertFrom-Json` already used in the file for settings merging. Same loop structure as `install.sh`: read manifest from extracted zip, iterate skills and hooks, route by `scope`.

### verify-install.mjs: mock-zip structural parity check

Runs `install.sh` (bash) and `install.ps1` (pwsh) against a synthesized mock directory matching the manifest's zip layout, captures the output directory tree from each, diffs them. Fails if trees differ.

**CI target:** Added to `.github/workflows/test.yml` as a post-build step (requires zip to be built first).

## Implementation Contract

**Behavior:**
- `npm run release` generates `scripts/release-manifest.json` then builds `dist/release.zip`. No intermediate user step required.
- `node scripts/generate-manifest.mjs` is idempotent: running twice produces the same manifest; `scope` values already in the file are preserved.
- After install, `ts-project-init-advisor` (an ondemand skill) lands at `[project]/.claude/skills/ondemand/ts-project-init-advisor/` — not at `[project]/.claude/skills/ts-project-init-advisor/`.
- After install, `inject-workflow-state.sh` lands at `[project]/.claude/hooks/` (project scope); all other hooks land at `~/.claude/hooks/` (user scope).

**Manifest shape (contract):**
```
{
  "version": "1",
  "skills": [{ "name": string, "src": string, "dest": string }],
  "hooks":  [{ "name": string, "src": string, "dest": string, "scope": "user" | "project" }]
}
```
- `src`: relative to project root
- `dest`: relative to zip root (matches path inside `release.zip`)

**Failure modes:**
- `generate-manifest.mjs`: if `src/skills/` or `src/hook/` missing → exits non-zero with message
- `build-release.mjs`: if `scripts/release-manifest.json` absent → exits non-zero ("scripts/release-manifest.json not found — run generate-manifest first")
- `build-release.mjs`: if manifest entry `src` path missing → SKIP with warning (existing behavior preserved for missing hooks)
- `install.sh` / `install.ps1`: manifest embedded in zip as `manifest.json` at zip root; if absent → fall back to current behavior (backward compat for old zips)

**Acceptance criteria:**
- `npm run release` runs without error; `dist/release.zip` contains `manifest.json`
- `node scripts/verify-install.mjs` exits 0 (install.sh and install.ps1 produce identical trees)
- `ts-project-init-advisor` installs to `ondemand/` subdir in both sh and ps1 paths
- Adding a new skill to `src/skills/` and re-running `npm run release` includes it in the zip without touching any script
- CI: `test.yml` runs `verify-install.mjs` and fails if it exits non-zero

**Scope boundaries:**
- In scope: manifest generation, build and install script refactor, parity CI check
- Out of scope: settings.json patching logic (untouched), scaffold installation, hook registration, zip format change

## Risks / Trade-offs

- [Risk] Old zips without `manifest.json` break if fallback is not implemented → Mitigation: install scripts check for manifest presence, fall back to current logic if absent
- [Risk] `verify-install.mjs` requires both `bash` and `pwsh` on CI runner → Mitigation: GitHub-hosted runners (ubuntu-latest) have both; document requirement in verify script header
- [Risk] Generator drops a hook `scope` if manifest is deleted and regenerated → Mitigation: generator assigns deterministic defaults (`inject-workflow-state.sh` → project, all others → user); defaults are correct for current hook set

## Migration Plan

1. Run `node scripts/generate-manifest.mjs` once to produce `scripts/release-manifest.json` — commit it
2. Update `build-release.mjs` to read manifest (remove `copySkillsDir`)
3. Update `install.sh` and `install.ps1` to read manifest
4. Update `package.json` `release` script
5. Add `verify-install.mjs` and wire into CI
6. Smoke-test: `npm run release`, inspect zip contents, confirm ondemand path

Rollback: revert 4 modified files; `scripts/release-manifest.json` and two new scripts are additive and harmless if left in place.
