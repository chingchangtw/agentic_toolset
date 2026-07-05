## Context

`ts-orchestrate` is meant to be the dual-track (Discovery + Delivery) session
entry point, but its guidance and routing only ever covered the Delivery
7-phase spine. The Discovery track's two DDD helper sub-agents
(`ts-event-storming-facilitator`, `ts-ddd-tactical-validator`) have been
referenced in the planner PRD, `ts-deliver-router` PRD, and
`sub-agents.md` since inception but never built — `/ts-discover explore` and
`validate` run without them, filling `exploration_output`/`ddd_validation` ad
hoc.

Source: `.agents/discovery.json` idea-002. Explore/validate ran without the
(not-yet-built) sub-agents by simulating their role directly — a chicken-and-egg
the Discovery track itself flagged as a residual risk (see idea-002's
`riskiest_assumptions`, both tagged H, both marked `validated: true`).

## Decisions

All 12 decisions below were reached with the human across the Discovery track
and 3 rounds of correction on the guidance/routing table shape. They are
**locked** — this change does not re-open them.

| # | Decision |
|---|---|
| D1 | Two DDD helpers built as **sub-agents** (`.md` prompt files), not skills. `src/agents/` → `<project>/.claude/agents/`. |
| D2 | `ts-event-storming-facilitator` required to exit `/ts-discover explore` (status stays `idea` until `exploration_output` populated). |
| D3 | `ts-ddd-tactical-validator` required before `/ts-discover decide build`. Runs in `validate` when validate runs; `decide` invokes it directly if validate was skipped. FAIL blocks the build decision. |
| D4 | WORK_TYPE set: `FEATURE\|BUGFIX\|HOTFIX\|REFACTOR\|CHORE\|PATCH\|SPIKE\|POC\|OPS`. No `EPIC` (plan slice, not a work type) and no `DISCOVERY` (Discovery entry is via FEATURE-unvalidated / POC). |
| D5 | Spines: feature `Think→Plan→Build→Review→Test→Ship`; bugfix/hotfix `Think→Build→Ship`; chore `Build→Ship`; patch `Build→Test→Ship`; spike `Think→Build→Reflect`; ops `Think→Build→Review→Ship`; refactor/epic unchanged. `poc` has no deliver spine (Discovery-only). |
| D6 | Gates: G1 = feature, refactor, epic (blocks Think→Plan). G2 = epic, ops, and patch-when-security-related (blocks Ship). bugfix/hotfix/chore/spike: none. Never auto-signed. |
| D7 | `ts-orchestrate/SKILL.md` gets TWO tables: **Workflow Guidance** (Track \| Phase/State \| Guidance — per-state, both tracks) and **Workflow Routing** (Work type \| Route — track named inline, states walked one by one). Distinct purposes; not merged. |
| D8 | `ts-project-planner/SKILL.md`'s Workflow Routing section slims to Discovery-internal routing + a pointer to `ts-orchestrate`. Its two hard rules (never `/ts-deliver:init` without `active_epic`; never mark epic done without gate sign-off) move to `ts-orchestrate` as canonical. |
| D9 | Hook keeps executable string copies of guidance (bash cannot import markdown). Lockstep enforced by hook-output tests. Accepted duplication. |
| D10 | `ubiquitous_language_terms[]` added to `exploration_output` schema (facilitator emits, validator consumes). |
| D11 | Hook's Discovery-branch focus-idea heuristic: priority `validating > exploring > idea > ready`, first match wins, one `[NEXT]` line only. |
| D12 | Fix pre-existing `.ai`→`.agents` test breakage in passing (both files touched anyway by other changes in this same PR). |

### Post-review addition: T9.5 spine-consistency test

During this change's own Plan-phase review (`/plan-eng-review`), a gap
surfaced that idea-002's `ddd_validation` had already flagged: no automated
test asserts `phase-routing.ts`'s spines match `work-unit-profiles.md`'s
"Active phases:" lines. Scoped to only the 6 *new* work types
(`feature|hotfix|chore|patch|spike|ops`) — deliberately excluding
`epic|refactor|bugfix`, which already have a known, out-of-scope spine
contradiction between the two files (see Non-Goals).

### Artifact-path namespacing (ts-deliver-router, surfaced during Think phase)

Not part of T1-T12, but discovered while executing this change's own Think
phase: `ts-deliver-router`'s artifact paths (`artifacts/think/framing.md` etc.)
were flat, single-epic paths — the only prior epic to run through Think
(`EPIC-GOLDEN-TEMPLATES`) left files at that flat path, which this change's
Think phase would have silently overwritten. Fixed by namespacing artifacts
under `artifacts/<EPIC_ID>/<phase>/` and documenting it as the standing
convention in `ts-deliver-router/references/workspace.md`. Not gated by G1/G2;
applied directly as an infra correction, out of `tasks/dual-track-orchestration-plan.md`'s
own task list (which never touches `ts-deliver-router` itself).

## Risks / Trade-offs

- **Sub-agent output has no schema validation**, only a non-empty-field gate
  (`exploration_output.domain_events` etc. must be non-empty to exit
  `explore`). A structurally malformed-but-non-empty JSON blob could still
  corrupt `discovery.json`. Accepted for this change; flagged as idea-002
  follow-up #1 for a later hardening pass.
- **Installer overwrite**: the new `.claude/agents/` install section does
  unconditional `cp`, same as the existing skills/hooks sections. If a user
  hand-edits a shipped sub-agent and re-installs, their edit is silently
  clobbered. Accepted as consistent with existing installer behavior
  (reviewed and confirmed during this change's Plan-phase eng review).
- **4-way spine duplication** (`phase-routing.ts`, `SKILL.md`'s Workflow
  Routing table, `work-unit-profiles.md`, hook's bash case statement) has no
  single test asserting all 4 agree — T9.5 covers 2 of the 4 (code vs
  profiles) for the 6 new types only. `SKILL.md`'s prose table and the hook's
  bash strings remain manually kept in lockstep (D9).
