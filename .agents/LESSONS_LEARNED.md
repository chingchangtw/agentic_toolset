# LESSONS_LEARNED.md

## How to use
Record only durable lessons that will improve future work in this repository.
Do not log temporary chatter.
Prefer compact entries.

---

## Entry Template

### [YYYY-MM-DD] Short title
- Context:
- Mistake or friction:
- Missed signal:
- Better rule:
- Reusable fix:
- Should we create a script, template, test, or agent?:

---

## Lessons

### [2026-04-28] Clarify data contract before coding
- Context: API integration task
- Mistake or friction: Started implementation before confirming response shape.
- Missed signal: Endpoint behavior and sample payload were not explicit.
- Better rule: Require sample payloads or schema before implementing transformations.
- Reusable fix: Add an API contract checklist template.
- Should we create a script, template, test, or agent?: Create an API contract reviewer agent.

### [2026-07-03] Installer scripts must never trust a bare interpreter name on PATH
- Context: A user's `UserPromptSubmit` hook failed with an opaque "Failed with non-blocking status code: No stderr output" error. Root cause: a broken/mismatched-arch `python3` earlier on PATH (stale x86_64 miniconda under Rosetta) got SIGKILL'd instantly with no stdout/stderr when `release/install.sh` invoked it.
- Mistake or friction: `install.sh` wrote `f"python3 {hooks_dir}/ts-session-guard.py"` into `settings.json` — trusting bare `python3` resolution via the end user's PATH instead of pinning the interpreter that actually ran the installer. This same bare-name pattern was present at 6 separate call sites in the same file (manifest-parsing heredocs, hook command, statusLine bridge, and a runtime-generated wrapper script), not just the one that surfaced.
- Missed signal: The installer's own idempotency check compared the exact command string, not script identity — so a prior partial fix and the bare-`python3` entry silently coexisted as duplicate hook registrations instead of one being corrected. "✓ Done" printed at install time; the actual failure only appeared later, in an unrelated-looking hook-error banner, with zero trace back to the installer.
- Better rule: Any script that writes a `command:` string into another tool's config (settings.json hooks, statusLine, generated wrapper scripts) must resolve and pin an absolute, verified-working interpreter path at generation time — never re-embed a bare command name and rely on the *target* machine's PATH to resolve it the same way the *build* machine's did. Idempotency/dedup checks on generated config must match by stable identity (script path/filename), never by exact string, or interpreter-path fixes create duplicates instead of updates.
- Reusable fix: `install.sh` now probes `python3` / `/usr/bin/python3` / `/usr/local/bin/python3` / `python` in order, verifies each with `"${candidate}" -c ""` before trusting it, and fails loud if none work. All 6 call sites route through the resolved `PYTHON_BIN`; the hook command itself pins `sys.executable` at generation time. Idempotency check now matches on `"ts-session-guard.py" in command` rather than exact string equality. Verified end-to-end against a clean `$HOME` with the first PATH entry shadowed by a `kill -9 $$` stand-in for `python3` — confirmed the probe correctly fails over and the resulting `settings.json` points at the working interpreter. Fixed in commit `0be12c0`, released as `v0.1.5`.
- Should we create a script, template, test, or agent?: Add a regression check to the release pipeline (or a pre-tag checklist item) that runs `install.sh` against a `$HOME` with a broken interpreter shadowing PATH, so this class of bug can't silently reintroduce itself on the next installer edit.