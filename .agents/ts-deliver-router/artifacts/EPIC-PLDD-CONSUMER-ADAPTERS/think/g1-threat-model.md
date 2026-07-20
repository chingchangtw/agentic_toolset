# G1 threat-model — EPIC-PLDD-CONSUMER-ADAPTERS (incl. dogfood activation)

## STRIDE per data flow

**Flow 1: fixture install** (adapter generator → isolated fixture dir)
- Spoofing: n/a, no auth boundary.
- Tampering: generator writes only inside a temp fixture path; guarded by same
  path-containment logic pattern as Phase A's `pl-scope-guard.mjs`.
- Repudiation: generated-file manifest lists every write, timestamped.
- Info disclosure: fixture dirs are throwaway, no secrets involved.
- DoS: n/a, single-shot script.
- Elevation of privilege: n/a, no privilege boundary crossed.

**Flow 2: dogfood install** (adapter generator → live agenticToolset tree:
`.agents/`, `.claude/hooks/`, router registries)
- Spoofing: n/a.
- Tampering: **primary risk.** Generator can overwrite live router state, hooks,
  registries used by every future session in this repo. Mitigation: pre-install
  snapshot of every target path; manifest enumerates every planned write before
  any write happens; apply is atomic per-file (write tmp → rename, same pattern
  the router itself uses for state.json).
- Repudiation: manifest + git diff on the activation branch is the audit trail.
- Info disclosure: none — no new data collected/stored.
- DoS: a broken hook (e.g. malformed shell) could block every future
  `UserPromptSubmit` in this repo until fixed. Mitigation: hook changes tested in
  isolation (dry invocation) before being wired live; rollback script restores
  pre-install snapshot.
- Elevation of privilege: dogfood activation is the first PLDD write outside
  `src/*` — treat it as a privilege boundary crossing even though there's no
  literal auth system. Mitigation: gated by this G1 + a separate G1 addendum
  specifically for the activation step at Plan-exit, per work-unit-profiles.md
  elevated-scrutiny pattern already used for the Iter3 installer epic.

## Privacy data inventory
None. No user data, PII, or secrets collected/stored/transmitted by either
sub-deliverable. Consumer adapters generate config/scaffold files only.

## Authentication/authorization model
N/A — local dev tooling, no network-facing auth surface. "Authorization" here is
process-level: only the dogfood-activation step (a distinct, explicitly-invoked
command) is permitted to write outside `src/*`; the scope guard should be extended
to allow-list that one entry point rather than removed.

## Never-automate list
See `never_automate.md` (this dir).

## Blast-radius bounds
- Fixture sub-deliverable: bounded to a throwaway temp directory. Zero blast
  radius on the real repo.
- Dogfood sub-deliverable: bounded to the explicit target set enumerated in the
  manifest (`.agents/ts-deliver-router/registry.json`, `state.json`, `.claude/
  hooks/*`, router config) — nothing outside that set is touched. Rate limit:
  single manual invocation per activation attempt, no auto-retry-on-failure.

## Recovery path
- Fixture install: delete the fixture dir. Nothing else affected.
- Dogfood install: rollback script restores every manifested path from the
  pre-install snapshot; verified by an empty diff in Build before this epic can
  exit Review. If rollback itself fails, the pre-install snapshot still exists on
  disk (not deleted until rollback is verified), so manual restore is always
  possible as a last resort.

## Open items carried into Plan
- Exact allowlist mechanism for `pl-scope-guard.mjs` (extend vs. bypass) — decide
  in Plan, not here.
- Whether activation runs as a Spectra-tracked task with its own scenario, or as
  a manual Build-phase checklist item — decide in Plan.

## Sign-off
- [x] Human sign-off: signed_by=ctony, signed_at=2026-07-20T02:35:00+08:00
