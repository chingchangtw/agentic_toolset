# Work Unit Profiles

`/ts-iteration next` → `/ts-deliver init` reads `type` field → pre-populates registry profile.

---

## Epic (full feature — 7 phases)

```
Active phases:   think → plan → build → review → test → ship → reflect
Gates:           G1 (review) + G2 (test) — both require human sign-off
Mutation target: stage-dependent (60/75/85/90%)
Branch:          feat/<epic-title-slug>

Registry tier adjustments vs default:
  ts-event-storming-facilitator → active   (Think phase)
  ts-spec-validator             → active   (Plan exit gate)
  ts-acpl                       → active   (Build primary discipline)
  ts-mutation-analyst           → active   (Test phase)
  ts-ddd-tactical-validator     → optional (Review phase)
  atlassian-rovo             → active   (Plan + Ship + Reflect)
  github-mcp                 → active   (Plan → Ship full chain)
  semgrep                    → active   (Build always + G1)
  trivy                      → active   (Build always + G2)
  stryker/pitest/mutmut      → active   (G2 gate — select per stack)
```

---

## Refactor (no new scenarios, no Ship)

```
Active phases:   think → build → review → test → reflect
Skipped:         plan (no new Spectra scenarios)
                 ship (no user-facing change — merged at Review sign-off)
Gates:           G1 only (review) — human sign-off
Mutation target: 90% (regression guard — must not break existing behaviour)
Branch:          refactor/<scope-slug>

Key constraint: Spectra scenarios from the original epic MUST continue to pass.
  No new scenarios. The existing archived spec is the acceptance test.

Registry tier adjustments vs epic:
  ts-event-storming-facilitator → optional (Think may be lightweight re-classification)
  ts-spec-validator             → skip     (no new scenarios)
  ts-acpl                       → active   (emphasis on Assertion Gate + Value Object patterns)
  ts-mutation-analyst           → active   (90% target — surviving mutants = regression risk)
  atlassian-rovo             → active   (Reflect only — no Jira transition, refactor is internal)
  github-mcp                 → active   (branch + PR + merge — no release tag)
  G2                         → skip
  stryker/pitest/mutmut      → active   (90% target)

Think phase for refactor:
  Goal is NOT domain re-discovery — it is:
  "What structural problem are we fixing? What invariant must not break?"
  Use first-principles-agent to challenge the refactor rationale.
  Exit: refactor_goal recorded in state.artifacts. existing_scenarios confirmed passing.
```

---

## Bugfix (no Think, no Reflect — fast lane)

```
Active phases:   plan → build → test → ship
Skipped:         think  (problem already known — skip domain work)
                 review (no architectural change — lightweight)
                 reflect (single-purpose fix — no retro needed)
Gates:           G2 only (test) — human sign-off
Mutation target: 80% (focused — must kill mutants on the fixed logic path)
Branch:          fix/<issue-id>-<slug>

Key constraint: Fix must be scoped to the reported issue.
  If the fix reveals a larger structural problem → STOP.
  Escalate to an epic or refactor work unit type. Do not scope-creep a bugfix.

Registry tier adjustments vs epic:
  ts-event-storming-facilitator → skip
  ts-spec-validator             → active  (Plan: write minimal BDD scenario for the bug)
  ts-acpl                       → active  (emphasis on Guard Clause + Result/Either)
  ts-mutation-analyst           → active  (focused report — fix path only)
  ts-ddd-tactical-validator     → skip
  atlassian-rovo             → active  (transition Jira bug → Done at Ship)
  github-mcp                 → active  (branch + PR + merge — no milestone, no release tag)
  semgrep                    → active  (Build always — security bugs especially)
  trivy                      → skip    (dep scan overkill for isolated bugfix)
  G1                         → skip

Plan phase for bugfix:
  Write exactly ONE Spectra scenario: Given <bug condition> / When <trigger> / Then <fix>.
  This scenario becomes the regression guard. Archive it at Test.

Scope escalation signals (STOP and escalate if any):
  - The fix requires changing more than 3 files
  - The fix requires a new database migration
  - The fix reveals a missing domain concept
  - The fix requires a new dependency
```

---

## Size Estimate → Iteration Sequencing
Used by `/ts-iteration start` to warn when overloaded.
| Size | Estimated phases | Rough effort |
|---|---|---|
| S | ≤ 3 phases | 1–2 days |
| M | 4–5 phases | 3–5 days |
| L | Full 7 phases, 1 cycle | 1–2 weeks |
| XL | Full 7 phases, may need splitting | > 2 weeks → recommend splitting into 2 epics |

XL: warn and offer to split before `/ts-iteration start`. Split at Bounded Context boundary in `domain.json`.

---

## Work Unit Types — Quick Reference
| Type | Active Phases | Gates | Mutation Target | Branch |
|---|---|---|---|---|
| **epic** | Full 7 phases | G1 + G2 | Per stage (60→85%) | `feat/<name>` |
| **refactor** | Think→Build→Review→Test→Reflect (no Ship) | G1 only | 90% (regression guard) | `refactor/<name>` |
| **bugfix** | Plan→Build→Test→Ship (no Think/Reflect) | G2 only | 80% | `fix/<name>` |
