---
name: ts-deliver-router
description: >
  Thin coordinator over verified state. Drives gstack 7-phase flow (Think→Plan→
  Build→Review→Test→Ship→Reflect) with Spectra BDD skills (discuss/propose/apply/
  ingest/archive) nested inside specific phases. Reads .agents/ts-deliver-router/state.json as truth
  (never infers phase from artifacts), enforces named security-gate checklists, and
  routes via the DIAL, CHECKS REGISTRY, and DRY-RUN primitives. Activate when user
  builds or refactors software with agents and asks "what next", "which skill",
  "where am I", "what phase", "run the checks", "simulate this", "dry-run on/off",
  or starts/resumes a project. Not for one-off lookups.
---

# ts-deliver-router (core)

Thin coordinator. Reads `.agents/ts-deliver-router/state.json` as truth (NEVER infers phase from artifacts),
runs registry checks for the current phase, blocks on named security gates before anything
irreversible. Always-loaded core; everything else lazy-loads per LOAD INDEX.

## Model
- Spine = gstack 7 phases (FIXED): Think→Plan→Build→Review→Test→Ship→Reflect.
- BDD = Spectra nested: discuss(Think), propose(Plan), apply(Build), archive(Ship);
  ingest = cross-cutting sub-loop (not a phase).
- Hub = Claude Code (orchestrate/judge/gates). Muscle = Copilot/Gemini (cheap impl/docs/git).
  Never run a competing spine.
- 3 PRIMITIVES: DIAL · CHECKS REGISTRY · DRY-RUN (detail in modules).

## LOAD INDEX (lazy — load only what current step needs)
| Need | Module |
|---|---|
| read/verify/write state, schema, staleness, exit contract | `references/state.md` |
| exiting Think (G1) or entering Ship (G2); any sign-off | `references/security-gates.md` |
| phase map, skills+artifacts per phase, ingest, refactor | `references/phases.md` |
| DIAL behavior / check types / add-recipe / exclusions | `references/registry/index.md` |
| checks for current phase P | `references/registry/index.md` + `references/registry/registry-<P>.md` |
| min-schema per artifact, debug mis-route, edge tests | `references/edge-tests.md` |
| project-level check activation tiers and thresholds | `references/project-registry.md` |
| full project registry schema and registry.log format | `references/registry-schema.md` |
| `/ts-deliver init|refine|status` command contracts | `references/commands.md` |
| detailed gate checklists and sign-off record shapes | `references/gate-checklists.md` |
| setup guidance for pending-setup tools | `references/setup-gaps.md` |
| phase-by-phase ACPL integration and mutation loop | `references/acpl-integration.md` |
| GitHub MCP traceability operations by phase | `references/github-mcp.md` |
| sub-agent build specs | `references/sub-agents.md` |
| full phase-exit examples aligned to state schema v1 | `references/phase-exit-contracts.md` |
| shared `.agents/` workspace contract and cross-skill boundaries | `references/workspace.md` |

On "what's next": load state.md first, then registry/index.md + registry-<phase>.md for the active phase.
Do not load all registry-phase files at once.

## PRIMITIVE INTERFACES
- **DIAL** — HIGH(auto) / MID(recommend, DEFAULT) / LOW(suggest). Read `.agents/ts-deliver-router/autonomy`;
  ask+save on first use. Gates ALWAYS pause for human even in HIGH; HIGH never auto-signs.
  Switch: "go auto" / "recommend" / "suggestions only".
- **CHECKS REGISTRY** — one row per check (always/gate/rec). Add activity = append 1 row
  to matching `registry-<phase>.md`; never edit spine or router.
  DIAL + types + recipe → `references/registry/index.md`. Rows → `references/registry/registry-<phase>.md`.
  Project-specific check activation/tier/threshold model → `references/project-registry.md`.
- **DRY-RUN** — session-scoped, defaults OFF, NOT persisted. ON: prefix all output `[DRY-RUN]`,
  state.json read-only, side effects announced, sign-offs refused.
  Switch: "dry-run on/off" / "dry-run" / "simulate this".

## Router algorithm
```
on invoke:
0 if dry-run on: prefix [DRY-RUN]; state.json read-only; announce side effects;
   refuse sign-offs; emit DRY-RUN REPORT on session end.        [→ state.md]
1 autonomy = read .agents/ts-deliver-router/autonomy || ask+save (DIAL).
2 state = read .agents/ts-deliver-router/state.json.                              [→ state.md]
   missing|invalid-schema|stale → "phase unclear, manual review" + reason. STOP.
3 P = current_phase. verify artifacts.P pass min-schema.        [→ edge-tests.md]
   any fail → "phase unclear, manual review" + specific failure. STOP.
   if P == Think: evaluate new assumptions against hook criteria (a) blocks G1/G2,
   (b) affects >1 epic scope, (c) new external dep. If met, call `/ts-discover idea --from-router`;
   continue regardless of outcome.
4 consult CHECKS REGISTRY for P: run always, surface rec.       [→ registry/index.md + registry/registry-P.md]
   if P == Build: run same hook gating check for unknowns surfaced in always-checks.
5 before exit P: every gate passed|signed_off;
   security gate: signed_off + 100% checklist; human even in HIGH. [→ security-gates.md]
6 on exit: PHASE EXIT CONTRACT (atomic state.json write).       [→ state.md]
   dry-run → simulate only.
7 WHERE-AM-I (on "where am I", empty input, any status query):  [→ phases.md + registry.md]
   LINE 1  bracketed flow:
           Think → [ Plan ] → Build → Review → Test → Ship → Reflect
   LINE 2  phase primary skills (phases.md Map for P).
   LINE 3  active checks: always-on | gates (status) | rec (surfaced).
   → continue with DIAL-level next-step.
8 honor switch phrases (DIAL or DRY-RUN) before act.
```
**RULE: never infer phase from artifacts. state.json is truth. Unsure → manual review.**

## Hard safety (in core — never deferred to save tokens)
- G1 (end of Think) and G2 (start of Ship) BLOCK at every autonomy level.
  100% checklist + human sign-off required. HIGH never auto-signs. Dry-run cannot sign.
- Dry-run cannot bypass min-schema; cannot persist.

## Quick reference
where am i / empty → bracketed flow + phase skills + active checks (step 7).
autonomy → "go auto" / "recommend" / "suggestions only".
dry-run → "dry-run on/off" / "dry-run" / "simulate this".
add check → 1 row in registry/registry-<phase>.md (+ registry/index.md for context).
greenfield: think→plan→build→review→test→ship→reflect.
refactor: map→reverse-spec→plan→…
spec change mid-flow → INGEST sub-loop → Plan delta.
G1/G2: 100% checklist + human sign-off; HIGH never auto-signs.

## Maintenance
Review spine + registry + state schema + gate checklists monthly.
Reflect (phase 7) refinements feed directly into the registry.
