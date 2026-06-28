---
name: ts-deliver-router
description: "6-phase flow (Think→Plan→Build→Review→Test→Ship→Reflect) with Spectra BDD skills (discuss/propose/apply/ingest/archive) nested inside specific phases. "
---
<!--
Thin coordinator over verified state with 6-phase flow (Think→Plan→
  Build→Review→Test→Ship→Reflect) with Spectra BDD skills (discuss/propose/apply/
  ingest/archive) nested inside specific phases. `.ai/ts-deliver-router/state.json` as truth, 
  enforces named security-gate checklists, and
  routes via various primitives. Activate when user works with agents and asks "what next", "which skill",
  "where am I", "what phase", "run the checks", "simulate this", "dry-run on/off",
  or starts/resumes a project. Not for one-off lookups
-->

## On First Use 
See 'reference/on-first-use.md' for first-use initialization steps.

---

# ts-deliver-router (core)

Thin coordinator. Reads `.ai/ts-deliver-router/state.json` as truth (NEVER infers phase from artifacts),
runs registry checks for current phase, blocks on named security gates before anything
irreversible. Always-loaded core; everything else lazy-loads per LOAD INDEX.

## Model
- Spine = gstack 7 phases (FIXED): Think→Plan→Build→Review→Test→Ship→Reflect.
- BDD = Spectra nested: discuss(Think), propose(Plan), apply(Build), archive(Ship);
  ingest = cross-cutting sub-loop (not a phase).
- Hub = Claude Code (orchestrate/judge/gates). Muscle = Copilot/Gemini (cheap impl/docs/git).
  Never run competing spine.
- 3 PRIMITIVES: DIAL · CHECKS REGISTRY · DRY-RUN (detail in modules).

## LOAD INDEX (lazy — load only what current step needs)
| Need | Module |
|---|---|
| read/verify/write state, schema, staleness, exit contract | `references/state.md` |
| exiting Think (G1) or entering Ship (G2); any sign-off | `references/security-gates.md` |
| phase map, skills+artifacts per phase, ingest, refactor | `references/phases.md` |
| DIAL behavior / check types / add-recipe / exclusions | `registry/registry-index.md` |
| checks for current phase P | `registry/registry-index.md` + `registry/registry-<P>.md` |
| min-schema per artifact, debug mis-route, edge tests | `references/edge-tests.md` |
| project-level check activation tiers and thresholds | `references/project-registry.md` |
| full project registry schema and registry.log format | `registry/registry-schema.md` |
| `/ts-deliver:init`, `/ts-deliver:refine`, `/ts-deliver:status`, `/ts-deliver:jump` command contracts | `references/commands.md` |
| detailed gate checklists and sign-off record shapes | `references/gate-checklists.md` |
| setup guidance for pending-setup tools | `references/setup-gaps.md` |
| phase-by-phase ACPL integration and mutation loop | `references/acpl-integration.md` |
| GitHub MCP traceability operations by phase | `references/github-mcp.md` |
| sub-agent build specs | `references/sub-agents.md` |
| full phase-exit examples aligned to state schema v1 | `references/phase-exit-contracts.md` |
| shared `.ai/` workspace contract and cross-skill boundaries | `references/workspace.md` |
| on first use initialization steps | `references/on-first-use.md` |

On "what's next": load state.md first, then registry-index.md + registry-<phase>.md for active phase.
Do not load all registry-phase files at once.

## PRIMITIVE INTERFACES
- **DIAL** — HIGH(auto) / MID(recommend, DEFAULT) / LOW(suggest). Read `.ai/ts-deliver-router/autonomy`;
  ask+save on first use. Gates ALWAYS pause for human even in HIGH; HIGH never auto-signs.
  Switch: "go auto" / "recommend" / "suggestions only".
- **CHECKS REGISTRY** — one row per check (always/gate/rec). Add activity = append 1 row
  to matching `registry-<phase>.md`; never edit spine or router.
  DIAL + types + recipe → `registry/registry-index.md`. Rows → `registry/registry-<phase>.md`.
  Project-specific check activation/tier/threshold model → `references/project-registry.md`.
- **DRY-RUN** — session-scoped, defaults OFF, NOT persisted. ON: prefix all output `[DRY-RUN]`,
  state.json read-only, side effects announced, sign-offs refused.
  Switch: "dry-run on/off" / "dry-run" / "simulate this".
- **REGISTRY EXTENSIONS** — `.ai/ts-deliver-router/registry.json` MAY include an `extensions`
  object. Supported extension: `"extensions": { "agent_scaffold": false }` (default).
  If `extensions.agent_scaffold = true`, load `references/agent-scaffold.md` before executing
  any phase. Full schema → `references/registry-schema.md`.

## Router algorithm
0 if dry-run: read-only, announce side effects, block sign-offs.
1 autonomy = read `.ai/ts-deliver-router/autonomy` || ask.
2 state = read `.ai/ts-deliver-router/state.json` ONLY. Do NOT read `history.jsonl`. fail/stale → STOP.
3 P = current_phase. verify artifacts.
  if P == Think: check unknowns for hook criteria (a) blocks G1/G2, (b) affects >1 epic, (c) new external dep. If met, call `/ts-discover idea --from-router` (non-blocking).
4 consult registry for P: run always, suggest rec.
  if P == Build: check unknowns surfaced in always-checks against same hook criteria.
5 before exit P: all gates signed; G1/G2 require 100% check + human.
6 on exit: (a) atomic state write (write tmp → rename, slim format — no phase_history/ingest_log); (b) append phase_exit event to history.jsonl (non-fatal: warn on failure, do not abort).
7 where am i: show bracketed flow + active checks.
8 honor switches.
**RULE: never infer phase from artifacts. state.json is truth. Unsure → manual review.**

## Hard safety (in core — never deferred to save tokens)
- G1 (end of Think) and G2 (start of Ship) BLOCK at every autonomy level.
  100% checklist + human sign-off required. HIGH never auto-signs. Dry-run cannot sign.
- Dry-run cannot bypass min-schema; cannot persist.

## Quick reference
commands: `/ts-deliver:init` / `/ts-deliver:refine` / `/ts-deliver:status` / `/ts-deliver:jump` (colon syntax, Claude Code slash commands).
where am i / empty → bracketed flow + phase skills + active checks (step 7).
autonomy → "go auto" / "recommend" / "suggestions only".
dry-run → "dry-run on/off" / "dry-run" / "simulate this".
add check → 1 row in registry-<phase>.md (+ registry-index.md for context).
greenfield: think→plan→build→review→test→ship→reflect.
refactor: map→reverse-spec→plan→…
spec change mid-flow → INGEST sub-loop → Plan delta.
G1/G2: 100% checklist + human sign-off; HIGH never auto-signs.

## Maintenance
Review spine + registry + state schema + gate checklists monthly.
Reflect (phase 7) refinements feed directly into registry.

"Ask me clarifying questions first."