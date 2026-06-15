---
name: ts-deliver-router
description: >
  Thin coordinator over verified state. Drives gstack 7-phase flow
  (Think→Plan→Build→Review→Test→Ship→Reflect) with Spectra BDD skills nested in
  specific phases. Reads .ai/ts-deliver-router/state.json as truth (never infers phase from
  artifacts), enforces named security-gate checklists, and routes via three
  primitives: DIAL (autonomy), CHECKS REGISTRY (activity catalogue), and PROJECT
  REGISTRY (per-project tool collection). Activate when user builds or refactors
  software with agents and asks "what next", "which skill", "where am I", "what
  phase", "run the checks", "init project", "refine registry", or starts/resumes a
  project. Not for one-off lookups.
---

# ts-deliver-router (caveman)

Workspace: .ai/ root. Private state: .ai/ts-deliver-router/. Read .ai/WORKSPACE.md on first use.
Shared reads: .ai/domain.json (Think), .ai/iteration.json (epic status only), .ai/risks.md (G1).
Never writes into peer skill directories.

Hub=Claude Code. Spine=gstack 7 phases (fixed). BDD=Spectra nested in phases.
Review=code-review-graph MCP (always-on). Token=caveman format.
Muscle=Copilot (boilerplate/GitHub) + Gemini (large-context).
Router=THIN COORDINATOR. Phase from `.ai/ts-deliver-router/state.json` only — never inferred.
3 PRIMITIVES: DIAL + CHECKS REGISTRY + PROJECT REGISTRY.

---

## PRIMITIVE 1: DIAL
3 levels → `.ai/ts-deliver-router/autonomy`
HIGH=auto chain. stop only taste+security/destructive gate. print artifacts+token cost.
MID=recommend (default). name phase+skills. wait approve each step.
LOW=suggest. phase name only. no skill names.
First use no saved pref: ask HIGH/MID/LOW, wait.
Switch anytime, update file, confirm.
Safety: security+destructive gates ALWAYS pause human even HIGH. DIAL ≠ safety bypass.

---

## PRIMITIVE 2: CHECKS REGISTRY
3 types: always(non-blocking) / gate(blocks exit) / rec(skippable).

| Phase | Check | Type | Tool |
|---|---|---|---|
| Think | domain-framing | rec | first-principles-agent |
| Think | event-storming | rec | ES facilitator sub-agent |
| Think | pf-classify | rec | ts-acpl→problem-frame-map |
| Plan | spectra-discuss | always | Spectra discuss |
| Plan | spectra-propose | always | Spectra propose |
| Plan | min-schema | gate | Spectra schema validator |
| Plan | jira-sync | rec | Atlassian Rovo MCP |
| Build | ts-acpl-patterns | always | ts-acpl skill |
| Build | incr-review | always | code-review-graph MCP |
| Build | spectra-apply | always | Spectra apply |
| Build | sast | always | Semgrep |
| Build | dep-scan | always | Trivy |
| Build | tdd-coverage | gate | coverage≥threshold |
| Review | code-review | always | code-review-graph MCP |
| Review | G1-threat | gate | STRIDE checklist |
| Review | G1-sast | gate | Semgrep zero high/crit |
| Review | G1-secrets | gate | Trivy secrets |
| Review | ddd-validate | rec | DDD validator sub-agent |
| Test | spectra-archive | gate | Spectra archive |
| Test | mutation | gate | Stryker/PITest/mutmut≥threshold |
| Test | G2-dep | gate | Trivy re-run |
| Test | mutation-analysis | rec | ts-mutation-analyst sub-agent |
| Ship | jira-transition | always | Atlassian Rovo MCP |
| Ship | confluence-pub | always | Atlassian Rovo MCP |
| Ship | github-release | rec | GitHub MCP |
| Reflect | registry-refine | always | /ts-router refine |
| Reflect | retro | rec | council-advisor |
| Reflect | skill-update | rec | skill-creator |

Add row: pick phase+type+tool → append to registry.json. Done.

---

## PRIMITIVE 3: PROJECT REGISTRY
Per-project versioned tool collection. Lives in `.ai/ts-deliver-router/registry.json`.
Init once via `/ts-router init`. Refine via `/ts-router refine` (auto at Reflect MID/HIGH).

registry.json shape:
```json
{
  "project": "",
  "initialized": "",
  "lifecycle_stage": "early|active|stabilizing|maintenance",
  "core": { "spine":"gstack","bdd":"spectra","review":"code-review-graph","token_discipline":"caveman" },
  "collection": [
    { "id":"", "type":"skill|plugin|mcp|agent", "phase":[], "tier":"active|optional|pending-setup|retired", "gate":null, "threshold":null }
  ],
  "gates": {
    "G1": { "phase":"review", "required":["semgrep","trivy"], "sign_off":"human" },
    "G2": { "phase":"test",   "required":["mutation>=85","trivy"], "sign_off":"human" }
  },
  "refinement_count": 0,
  "next_refinement_trigger": "reflect"
}
```

Stage defaults:
  early        → core4 + ts-acpl. mutation target 60%.
  active       → core4 + ts-acpl + semgrep + stryker + github-mcp. target 75%.
  stabilizing  → all active + trivy tight. target 85%.
  maintenance  → core4 + code-review-graph heavy + ts-acpl assertion-gate emphasis. target 90%.

---

## DISCOVERY FEEDBACK HOOK
Closes loop w/ ts-project-planner Discovery track (Idea→Explore→Validate→Ready).
Not a 4th primitive — single hook. Think/Build surface unresolved assumption
meeting gating criteria → call /ts-discover idea --from-router
(description, source_epic=active epic id).

Gating (fires if unknown):
  (a) blocks G1/G2, OR (b) affects >1 epic scope, OR (c) new external dependency

Fires:
  Think → ts-event-storming-facilitator exploration surfaces domain assumption (b/c)
  Build → always-checks (semgrep/trivy/code-review-graph) surface (a) or (c)

Non-blocking. Outcome (success|unavailable) logged state.json.notes regardless.
Dedup = ts-project-planner's job (title-similarity), not this skill's.
Minor single-epic/non-blocking details → state.json.notes only, hook does NOT fire.

---

## COMMANDS

### /ts-router init
Interview → writes registry.json + state.json + autonomy.
  Step1: project type / stack / external systems? / frontend? / lifecycle stage?
  Step2: propose collection → human confirms/overrides.
  Step3: mutation threshold? / security gates required?
  Step4: write files. confirm "N tools active, 2 gates, mutation target X%."

### /ts-router refine
Read registry.json + history. Report used/unused/gate results/pending-setup.
Prompts: promote optional→active? retire? resolve pending-setup? adjust threshold? update stage?
Write: registry.json (refinement_count++). append registry.log {date,changes[],rationale}.

### /ts-router status
Print: phase / DIAL / active tools / pending-setup / last refined / next gate.

### /ts-router dry-run [on|off]
Simulation mode. Describe all commands, execute nothing. `.ai/ts-deliver-router/dry-run`.

---

## ROUTING LOGIC (every "what next")
1. Read state.json → missing/stale → STOP "phase unclear" + reason.
2. Read registry.json → missing → prompt /ts-router init. warn pending-setup.
3. Verify phase artifacts pass minimum-schema → fail → STOP + specific failure.
4. Run always checks. surface rec checks per DIAL. enforce gates before exit.
   [Think+Build only] eval Discovery Feedback Hook gating (a)/(b)/(c) per new
   unresolved assumption → if met, call /ts-discover idea --from-router (non-blocking).
5. Respect DIAL. default MID.
6. Phase exit → atomically write state.json (PHASE EXIT CONTRACT).

---

## PHASES (summary)

Think    → first-principles-agent, six-thinking-hats, tows-strategy-analyst, ts-acpl→pf-map
           SUB-AGENT ts-event-storming-facilitator (rec, tier=active):
             input: project description
             session: domain-events→commands→aggregates→bounded-contexts→PF classify→ts-acpl pattern group
             output→state.artifacts: {domain_events,commands,aggregates,pf_class,acpl_pattern_group,ubiq_lang}
             flows into: Plan (commands=scenario seeds) + Build (pattern group pre-selected)
           exit: PF classified. vocabulary defined. acpl_pattern_group set. no code.
           [hook: unresolved domain assumption meeting (b)/(c) → --from-router]

Plan     → Spectra discuss→propose. min-schema gate. ts-acpl→pattern selection. prompt-refiner.
           GitHub MCP: create_branch(feat/<name>, from=main) → state.artifacts.branch
           Atlassian Rovo: create/update Jira stories; link branch.
           exit: spec/ exists. all scenarios Given/When/Then. branch created.

Build    → ts-acpl (primary). Spectra apply. code-review-graph always. semgrep+trivy always.
           copilot (boilerplate). gemini (large-context).
           GitHub MCP: push_files(branch=state.artifacts.branch, conventional-commits)
           gate: tdd-coverage≥threshold.
           exit: all scenarios implemented. coverage green. branch has commits.
           [hook: always-checks surface (a)/(c) → --from-router]

Review   → code-review-graph. critical-thinker. G1 gate (STRIDE+OWASP+semgrep+trivy+privacy).
           GitHub MCP: create_pull_request(head=branch→main) → state.artifacts.pr_url
                       create_review_comment(pr, body=code-review-graph-findings)
           G1=human sign-off. records to state.gates.G1.
           G1 discovery linkage (advisory): surface any discovery.json entry
             with source_epic=this epic and status not in {ready,killed};
             resolve via ts-project-planner /ts-discover, or accept+note in
             state.gates.G1.notes. Non-blocking.
           exit: G1 signed. PR open with inline findings. ts-acpl pattern coverage verified.

Test     → spectra archive (gate). mutation gate≥threshold. G2 (trivy re-run+mutation).
           SUB-AGENT ts-mutation-analyst (rec, tier=active):
             input: mutation report + state.artifacts.acpl_pattern_group
             classify: boundary→Guard Clause, conditional→Specification,
               deletion→Pure Function, return-value→Result/Either, state→State Machine
             output: score%, priority_fixes[{location,missing_test,pattern,kills}]
           GitHub MCP: update_pull_request_review(pr, "Mutation: N% → PASS|FAIL")
           G2=human sign-off. records to state.gates.G2.
           exit: scenarios locked. mutation score in state.metrics. PR updated. G2 signed.

Ship     → GitHub MCP: merge_pull_request(pr, squash) + create_release(tag, body=spectra-changelog)
           Atlassian Rovo: jira→Done + link PR/tag. Confluence: publish archived scenarios.
           Copilot CLI: release notes from commit history.
           exit: PR merged. release tag. jira done. confluence updated.

Reflect  → /ts-router refine (always). council-advisor (rec). skill-creator (rec).
           exit: registry refined. log updated. lessons captured.

---

## PLUGINS (fills former placeholders)
SAST             → Semgrep       (Build always + Review G1)
dep/secrets scan → Trivy         (Build always + Test G2)
mutation TS/JS   → Stryker       (Test G2)
mutation Java    → PITest        (Test G2)
mutation Python  → mutmut        (Test G2)

## MCPs
Atlassian Rovo    → connected. Plan+Ship+Reflect.
code-review-graph → required. Build+Review always-on. warn if not configured.
GitHub MCP        → add. Plan(branch) Build(commit) Review(PR+comments) Test(score) Ship(merge+tag).
                    setup: references/setup-gaps.md

## SUB-AGENTS
ts-event-storming-facilitator → Think (tier=active): ES→domain-events→commands→aggregates→ts-acpl-PF-group.
ts-spec-validator             → Plan (gate): verify spectra min-schema before exit.
ts-ddd-tactical-validator     → Review (rec): aggregate+repo+event alignment vs scenarios.
ts-mutation-analyst           → Test (tier=active): report→mutant class→ACPL pattern→missing test.
build specs: references/sub-agents.md

## REFS
references/registry-schema.md    → full registry.json field reference
references/gate-checklists.md    → G1 STRIDE + G2 mutation full checklists
references/setup-gaps.md         → setup instructions per pending-setup tool
references/phase-exit-contracts.md → exit contracts all 7 phases
references/sub-agents.md         → build specs for 4 sub-agents
references/acpl-integration.md   → ACPL phase-by-phase integration
