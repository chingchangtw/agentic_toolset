---
name: ts-orchestrate
description: Dual-track orchestrator — session entry point, unified status, gate enforcement. Reads [WORKFLOW STATE] hook context and routes end-user work types across the Discovery and Delivery tracks.
---

# ts-orchestrate

Passive orchestration skill. Reads `[WORKFLOW STATE]` context injected by the hook
(`inject-workflow-state.sh`). Does not read raw state files directly.

## Entry Gate

Applies to **Delivery-entry** work types only (BUGFIX, HOTFIX, REFACTOR, CHORE,
PATCH, SPIKE, OPS, and FEATURE with an already-validated idea).

If hook output shows `active epic: none`:

```
[BLOCKED] No active epic in iteration.json.active_epic.
Options: /ts-project:plan --new  ·  /ts-discover idea "<desc>" (start Discovery)
```

**Discovery-entry is exempt:** `WORK_TYPE=POC`, FEATURE without a validated idea,
and all `/ts-discover *` commands are never blocked by this gate.

**HARD RULE:** Never run `/ts-deliver:init` without an epic in
`iteration.json.active_epic`.

## Workflow Routing

Keyed by the type of work the end-user wants to do. The Route names the track
inline and walks its states one by one.

| Work type | Route |
|---|---|
| Feature | **Discovery:** `/ts-discover idea` → `explore` (event-storming) → `validate` (if H-risk; ddd-validator) → `decide build` → `/ts-project:plan --sync` → `/ts-iteration:start` → `/ts-iteration:next` → **Delivery:** Think → Plan[G1] → Build → Review → Test → Ship. Idea already validated? Enter at `/ts-iteration:next`. |
| Bugfix & Hotfix | **Delivery:** Think → Build → Ship (no gates; HOTFIX = distinct audit tag, expedited) |
| Refactor | **Delivery:** Think → Plan[G1] → Build → Review → Ship → Reflect |
| Chore & Tech debt | **Delivery:** Build → Ship (no gates, no Think; large tech debt → route as Refactor) |
| Patch (dependency/security bump) | **Delivery:** Build → Test → Ship (G2 sec-review when security-related) |
| Spike (timeboxed tech question) | **Delivery:** Think → Build → Reflect → **Discovery:** learning entry written to discovery.json (no Ship) |
| PoC (idea feasibility) | **Discovery only:** `/ts-discover idea` → `explore` (event-storming) → `validate` (throwaway prototype + ddd-validator) → `decide` build/kill/reduce-scope (never ships) |
| Ops/Infra (CI/CD, deploy, config) | **Delivery:** Think → Build → Review → Ship[G2] (infra touches the security surface) |
| *(Epic — plan slice, not a work type)* | Reached via `/ts-iteration:next` on a synced epic: Think → Plan[G1] → Build → Review → Test → Ship[G2] → Reflect |

Spike vs PoC: a Spike answers a technical question inside Delivery and feeds the
learning back; a PoC validates idea feasibility entirely inside Discovery.

After any Delivery completion: `/ts-iteration:next` (or `/ts-iteration:close` if
last epic) → `/ts-discover status` (feedback loop).

## Gate Rules

| Gate | Required for | Blocks |
|---|---|---|
| G1 (threat-model sign-off) | feature, refactor, epic | Think → Plan |
| G2 (sec-review sign-off) | epic, ops, patch (security-related only) | Ship |

Both gates: **NEVER auto-signed at any autonomy level.**

**HARD RULE:** Never mark an epic done without its required gate sign-offs.

## Workflow Guidance (Dual-Track)

Canonical per-state guidance. Routing (above) = which path; Guidance (below) =
what to do inside each state. The hook's `[NEXT]` lines mirror this table.

| Track | Phase/State | Guidance |
|---|---|---|
| Discovery | idea | Run `/ts-discover explore <id>` (WIP limit 3 in exploring+validating) |
| Discovery | exploring | `ts-event-storming-facilitator` output required to exit; then `/ts-discover validate <id>` (mandatory if any H-risk assumption) or `/ts-discover decide <id> build` |
| Discovery | validating | council-advisor + tows-strategy-analyst + `ts-ddd-tactical-validator`; then `/ts-discover decide <id>` |
| Discovery | ready | Run `/ts-project plan --sync` to move epic(s) into the backlog |
| Discovery | keep-learning | Back to exploring, keep_learning_count++; at 3 → forced `/ts-discover decide` |
| Discovery | killed | ADR written; entry retained for audit — no further action |
| Discovery | reduce-scope | Idea split into new `idea` entries; explore each separately |
| Delivery | think | Spectra:discuss + G1 threat-model sign-off (if required) → `/ts-deliver:refine` |
| Delivery | plan | Spectra:propose + design review → `/ts-deliver:refine` |
| Delivery | build | Spectra:apply + test coverage gate → `/ts-deliver:refine` |
| Delivery | review | staff-review report → `/ts-deliver:refine` |
| Delivery | test | acceptance + integration gates → `/ts-deliver:refine` |
| Delivery | ship | Spectra:archive + G2 sec-review sign-off (if required) → `/ts-deliver:refine` |
| Delivery | reflect | `/ts-iteration:next` (or `/ts-iteration:close` if last epic); spike: write learning entry to discovery.json first |

## Feedback Loop

After epic completion (Reflect phase), write feedback to `discovery.json`:

1. Mark epic status `"done"` in iteration.json.
2. Add entry to discovery.json with `source_epic` field referencing the completed epic id.
3. Run `/ts-iteration:next` (or `/ts-iteration:close` if last epic in release).
4. Discovery resumes with the completed epic as context.

## Commands

- `/ts-orchestrate:start` — entry point; sets active_epic + dial, routes per Workflow Routing
- `/ts-orchestrate:status` — cross-layer view (Discovery + Delivery)
- `/ts-orchestrate:next` — enforced phase advancement with gate checks

## Autonomy Levels

| Level | Behavior |
|---|---|
| HIGH | Auto-advance after gate sign-off; never auto-sign gates |
| MID | Recommend next action; user confirms phase advances |
| LOW | Wait for explicit user command at every step |
