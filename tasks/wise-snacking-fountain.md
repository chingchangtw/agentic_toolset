# Plan — Backfill ts-deliver-router (PRIMARY) from tasks/ variant (SECONDARY)

## Context

Two copies of `ts-deliver-router` diverged:

- **PRIMARY** `src/skills/ts-deliver-router/SKILL.md` — lean progressive-disclosure
  router. Core SKILL.md = index + algorithm; detail lazy-loads from `modules/`
  via a LOAD INDEX table. 3 primitives: **DIAL · CHECKS REGISTRY · DRY-RUN**.
  Registry is a static template split into `modules/registry/registry-<phase>.md`.
- **SECONDARY** `tasks/ts-deliver-router/SKILL.md` — monolithic SKILL.md +
  `references/`. 3 primitives: **DIAL · CHECKS REGISTRY · PROJECT REGISTRY**
  (per-project, versioned `registry.json` with tiers + lifecycle stages),
  plus init/refine/status commands, 4 sub-agent build specs, GitHub MCP +
  Atlassian Rovo traceability, full STRIDE/OWASP checklists, per-phase exit
  contracts, setup-gap install guides, and deep ACPL integration.

Goal: bring missing SECONDARY capability into PRIMARY **without** touching
PRIMARY's frontmatter, section order, or header hierarchy, and **without**
bloating SKILL.md — anything beyond a couple of lines becomes a new file
reachable through the LOAD INDEX. This is a plan only.

**Convention (per user direction):** PRIMARY adopts the `references/` directory
for these additions. All proposed NEW files live under
`src/skills/ts-deliver-router/references/` (filename parity with SECONDARY where
applicable). LOAD INDEX rows point to `references/<file>.md`. Existing PRIMARY
content under `modules/` (state.md, security-gates.md, phases.md, registry/) is
left in place; only the new capability files use `references/`. Filename parity
with SECONDARY makes the backfill auditable side-by-side.

## Decisions (locked)
- **Convention: `references/`.** New files go under `references/`, not `modules/`.
- **PROJECT REGISTRY: ADOPT.** DRY-RUN stays the named 3rd primitive; PROJECT
  REGISTRY ships as `references/` files reached via CHECKS REGISTRY. No structure change.
- **ACPL: ADOPT** as `references/acpl-integration.md` + `ts-acpl` rec rows.
- **GitHub MCP: ADOPT** as `references/github-mcp.md` + rec rows. **Atlassian Rovo: SKIP**
  — keep PRIMARY's existing scope-out.
- **Workspace contract: ADOPT** as `references/workspace.md`.

All gap rows below are confirmed except Atlassian Rovo (SKIP).

## 1. Gap summary table

| Gap | Found in SECONDARY (location) | Recommended placement in PRIMARY | New/updated reference file | Est. token impact |
|---|---|---|---|---|
| PROJECT REGISTRY (per-project registry.json: tiers active/optional/pending-setup/retired, lifecycle_stage, gate thresholds) | SKILL.md "PRIMITIVE 3" + "Lifecycle stage → default collection" | NEW reference; do NOT add a 4th primitive. One-line pointer under CHECKS REGISTRY interface + 1 LOAD INDEX row | `references/project-registry.md` | SKILL.md +2 lines; file large (~600 tok) |
| registry.json full field schema + worked example + registry.log format | `references/registry-schema.md` | NEW reference, linked only from project-registry.md (not SKILL.md) | `references/registry-schema.md` | file large (~700 tok) |
| Commands `/ts-router init` / `refine` / `status` (interview + refine flow) | SKILL.md "Commands" | NEW reference; 1 LOAD INDEX row. (`dry-run` already in PRIMARY core.) | `references/commands.md` | SKILL.md +1 line; file med (~450 tok) |
| 4 sub-agent build specs (ts-event-storming-facilitator, ts-spec-validator, ts-ddd-tactical-validator, ts-mutation-analyst) | `references/sub-agents.md` | NEW reference; 1 LOAD INDEX row; add 4 `rec` rows to registry-think/plan/review/test | `references/sub-agents.md` | file large (~700 tok); +4 registry rows |
| Per-phase exit-contract JSON (Think→Plan … Reflect→Think) | `references/phase-exit-contracts.md` | NEW reference extending state.md's generic contract; 1 LOAD INDEX row | `references/phase-exit-contracts.md` | file med (~500 tok) |
| Full gate checklists (STRIDE per-flow questions, OWASP Top-10 itemized, ACPL post-gen checklist, sign-off JSON records) | `references/gate-checklists.md` | NEW reference for full detail; `modules/security-gates.md` keeps its terse named checklist and gains a "full detail →" link line | `references/gate-checklists.md` (+1 link line in `modules/security-gates.md`) | file large (~700 tok); +1 line |
| Setup install instructions per tool (GitHub MCP, Semgrep, Trivy, Stryker/PITest/mutmut, code-review-graph) | `references/setup-gaps.md` | NEW reference; referenced by project-registry setup-gap detection | `references/setup-gaps.md` | file med (~550 tok) |
| ACPL integration per phase + 8 generation rules + mutation-sensitivity loop | `references/acpl-integration.md` | NEW reference; 1 LOAD INDEX row; add `ts-acpl` rows to relevant registry-<phase>.md | `references/acpl-integration.md` | file large (~750 tok); +rows |
| GitHub MCP traceability chain (create_branch→push_files→PR→merge→release per phase) | SKILL.md per-phase "GitHub MCP operations" + MCP table | NEW reference; add `rec` rows to registry-plan/build/review/test/ship | `references/github-mcp.md` | file med (~500 tok); +5 rows |
| Atlassian Rovo Jira/Confluence traceability | SKILL.md MCP table + per-phase ops | **SKIP** (confirmed) — PRIMARY scopes this out in registry/index.md ("atlassian-rest-api invoked inside Build work, not a lifecycle gate") | — | — |
| Workspace contract (.ai/WORKSPACE.md, shared domain.json/iteration.json/risks.md, cross-skill read/write matrix, ts-project-planner Discovery track) | SKILL.md "Workspace" + Discovery Feedback Hook section | NEW reference; 1 LOAD INDEX row | `references/workspace.md` | file med (~500 tok) |
| Discovery Feedback Hook detail (call shape, gating a/b/c, dedup ownership, non-blocking logging, what does NOT fire) | SKILL.md "Discovery Feedback Hook" | UPDATE existing `modules/phases.md` (PRIMARY already has the compressed hook in the router algorithm) — small add | `modules/phases.md` (update) | small (~120 tok) |
| Concrete plugin names vs placeholders (Semgrep/Trivy/Stryker) | SKILL.md "External Dependencies / Plugins" | KEEP placeholders in registry rows by design; concrete names live in `references/setup-gaps.md` | (in setup-gaps.md) | — |
| Lifecycle stage → default collection + mutation-target table | SKILL.md table | Fold into `references/project-registry.md` | (in project-registry.md) | — |
| Setup-gap detection in routing | SKILL.md "Setup Gap Detection" | Document in project-registry.md; optional 1 LOAD INDEX note | (in project-registry.md) | — |

## 2. New reference files to create

All under `src/skills/ts-deliver-router/references/`. Each gets a LOAD INDEX row
in SKILL.md unless noted (insertions only — no reorder of existing rows).

1. `references/project-registry.md` — per-project registry.json model: tiers,
   lifecycle stages + default-collection/mutation-target table, gate thresholds,
   setup-gap detection. *Link from:* new one-liner under CHECKS REGISTRY in
   "PRIMITIVE INTERFACES" + new LOAD INDEX row.
2. `references/registry-schema.md` — full registry.json field reference, worked
   example, registry.log format. *Link from:* project-registry.md only (not SKILL.md).
3. `references/commands.md` — `/ts-router init|refine|status` flows. *Link from:*
   new LOAD INDEX row.
4. `references/sub-agents.md` — build specs for the 4 sub-agents. *Link from:* new
   LOAD INDEX row; referenced by the 4 new `rec` registry rows.
5. `references/phase-exit-contracts.md` — per-phase exit JSON (conformed to PRIMARY
   state schema v1). *Link from:* new LOAD INDEX row; cross-link from
   `modules/state.md` "Phase exit contract".
6. `references/gate-checklists.md` — full STRIDE/OWASP/ACPL-post-gen/sign-off detail.
   *Link from:* one "full detail →" line appended in `modules/security-gates.md`.
7. `references/setup-gaps.md` — install instructions per tool. *Link from:*
   project-registry.md setup-gap detection (and/or `modules/registry/index.md`
   placeholder note).
8. `references/acpl-integration.md` — ACPL per-phase + 8 rules + mutation loop.
   *Link from:* new LOAD INDEX row; referenced by new `ts-acpl` registry rows.
9. `references/github-mcp.md` — GitHub MCP op-per-phase chain. *Link from:* new
   `rec` registry rows.
10. `references/workspace.md` — shared `.ai/` layout + cross-skill matrix +
    Discovery-hook linkage. *Link from:* new LOAD INDEX row.

LOAD INDEX rows are appended after the existing rows; the CHECKS-REGISTRY pointer
is a single line inside the existing PRIMITIVE INTERFACES bullet — neither reorders
or rewrites existing content. Result: SKILL.md LOAD INDEX will mix `modules/`
(existing) and `references/` (new) paths — acceptable; both are valid lazy-load targets.

## 3. Risks / open questions

- **Mixed reference dirs.** After this change SKILL.md's LOAD INDEX references both
  `modules/` (existing core) and `references/` (new capability files). Confirmed
  acceptable per user direction; flagged so a future reviewer isn't surprised. A
  later consolidation (move all `modules/` → `references/`) is out of scope here.
- **Primitive identity clash.** SECONDARY's 3rd primitive is PROJECT REGISTRY;
  PRIMARY's is DRY-RUN. Adopting PROJECT REGISTRY must NOT become a 4th primitive
  (that changes structure). Locked: keep DRY-RUN as the named primitive, ship
  PROJECT REGISTRY as `references/` files reachable via CHECKS REGISTRY.
- **Two registry representations.** SECONDARY has one live `registry.json`;
  PRIMARY has a static template across `registry/registry-<phase>.md`. A project
  registry.json would layer *project tiers* on top of the template's *catalogue*.
  Need to define which is source of truth at runtime (proposed: template = catalogue
  of possible checks; registry.json = which are active this project + thresholds).
- **state.json schema mismatch.** PRIMARY state.md is schema_version "1"
  (phase_history, ingest_log, gates.checklist_results). SECONDARY state.json is a
  flatter shape (metrics, scenario_count). phase-exit-contracts.md must conform to
  PRIMARY's v1 schema, not copy SECONDARY's shape verbatim — otherwise edge-tests
  min-schema breaks.
- **Pre-existing PRIMARY inconsistency (out of scope, flagged):** SKILL.md LOAD
  INDEX points to `modules/registry/index.md`, but router step 7 and a stray
  `modules/registry.md` reference the old monolithic registry. Not part of this
  backfill; note for a separate cleanup.
- **Naming collisions:** `references/registry-schema.md` is distinct from the
  existing `modules/registry/` dir — different directory, no collision.
- **Atlassian scope:** confirmed SKIP — explicitly excluded in PRIMARY today.

## 4. Verification (after implementation, separate from this plan)

- LOAD INDEX rows resolve: every new `references/*.md` path exists and is reachable.
- No edit to SKILL.md frontmatter, header set, or section order (diff shows only
  appended LOAD INDEX rows + one CHECKS-REGISTRY pointer line + one
  security-gates link line).
- New registry rows parse as valid table rows in their `registry-<phase>.md`.
- `references/phase-exit-contracts.md` JSON validates against `modules/state.md`
  schema_version "1".
- Token check: SKILL.md core growth ≤ ~10 lines total.
