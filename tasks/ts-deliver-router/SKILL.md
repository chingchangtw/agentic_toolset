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

# ts-deliver-router

A GPS-style workflow hub that coordinates agentic software development across a
fixed 7-phase spine. It does not build code — it routes, checks state, enforces
gates, and dispatches to the right skill at the right moment.

---

## Workspace

All state is written under `.ai/` — the shared workspace root. On first use,
read `.ai/WORKSPACE.md` (created by `/ts-router init` if not present) for the
full layout contract and cross-skill read/write matrix.

This skill's private directory is `.ai/ts-deliver-router/`. It never writes
into any peer skill's directory. Shared artifacts it reads: `domain.json`,
`iteration.json` (epic status fields only), `risks.md` (G1 gate).

---

```
ts-deliver-router
│
├── INVARIANT — the hub identity (never changes per project)
│   ├── 7-phase spine       → gstack (Think→Plan→Build→Review→Test→Ship→Reflect)
│   ├── BDD discipline       → Spectra (discuss/propose/apply/ingest/archive)
│   ├── Review discipline    → code-review-graph (MCP server, always-on)
│   └── Token discipline     → caveman format (all skill variants)
│
├── PRIMITIVES — configuration layer
│   ├── DIAL                 → autonomy level per session
│   ├── CHECKS REGISTRY      → template catalogue of all possible activities
│   └── PROJECT REGISTRY     → per-project active tool collection + gate config
│
└── WORKSPACE  (.ai/)
    ├── WORKSPACE.md             → shared layout contract (all skills read this)
    ├── domain.json              → shared: ES output (read at Think exit)
    ├── iteration.json           → shared: epic queue (read by /ts-iteration next)
    ├── risks.md                 → shared: risk register (read at G1 gate)
    ├── decisions/               → shared: ADRs
    └── ts-deliver-router/        → PRIVATE to this skill
        ├── state.json           → current phase + exit contracts
        ├── autonomy             → DIAL setting
        ├── registry.json        → live tool collection + gate thresholds
        └── registry.log         → refinement history
```

### Core 4 (invariant — always active)

| Role | Tool |
|---|---|
| 7-phase spine | **gstack** |
| BDD discipline | **Spectra** (`discuss` / `propose` / `apply` / `ingest` / `archive`) |
| Review discipline | **code-review-graph** (MCP server) |
| Token discipline | **caveman** format on all skill files |

### Agent model

| Role | Tool | Strength |
|---|---|---|
| Hub / orchestrator | Claude Code | Deep reasoning, sub-agents, MCP |
| Muscle — boilerplate | Copilot CLI | GitHub-native ops, fast file edits |
| Muscle — large context | Gemini | Whole-repo reads, fleet tasks |

---

## PRIMITIVE 1: DIAL (autonomy)

Three levels. Stored in `.ai/ts-deliver-router/autonomy`. Read on every invoke.

| Level | Behaviour |
|---|---|
| **HIGH** | Auto-run phase chain. Stop only at taste + security/destructive gates. Print artifacts + token cost per phase. |
| **MID** | Recommend (default). Name phase + next skill(s)/checks. Wait for approval at each step. |
| **LOW** | Suggest only. Name phase. No skill names, no commands. |

**First use with no saved preference:** ask "Autonomy? HIGH / MID / LOW" and wait.
**Switching:** any time, update `.ai/ts-deliver-router/autonomy`, confirm aloud.
- → HIGH on: "go auto", "full auto", "just run it"
- → MID on: "recommend", "ask me each step"
- → LOW on: "suggestions only", "just tell me where I am"

Downshift to LOW always immediate. Upshift to HIGH: re-confirm before next
destructive or security step.

**Safety invariant:** security gates and destructive operations always pause for
human sign-off, even at HIGH. DIAL is a convenience control, never a safety bypass.

---

## PRIMITIVE 2: CHECKS REGISTRY

A catalogue of all possible activities mapped to phases. Three check types:

| Type | Meaning |
|---|---|
| `always` | Runs every time the phase is active. Non-blocking. |
| `gate` | Blocks phase exit until passed or signed off. |
| `rec` | Recommended. Surfaced to user; skippable. |

### Default registry (template — written to `registry.json` at `/ts-router init`)

| Phase | Check ID | Type | Tool / Skill | Blocks Exit |
|---|---|---|---|---|
| Think | domain-framing | rec | `first-principles-agent` | No |
| Think | event-storming | rec | Event Storming facilitator sub-agent | No |
| Think | pf-classification | rec | `ts-acpl` → `problem-frame-map.md` | No |
| Plan | spectra-discuss | always | Spectra `discuss` | No |
| Plan | spectra-propose | always | Spectra `propose` | No |
| Plan | min-schema | gate | Spectra minimum-schema validator | Yes |
| Plan | jira-sync | rec | Atlassian Rovo MCP | No |
| Build | ts-acpl-patterns | always | `ts-acpl` skill | No |
| Build | incr-review | always | `code-review-graph` MCP | No |
| Build | spectra-apply | always | Spectra `apply` | No |
| Build | sast | always | Semgrep | No |
| Build | dep-scan | always | Trivy | No |
| Build | tdd-coverage | gate | Coverage ≥ threshold | Yes |
| Review | code-review | always | `code-review-graph` MCP | No |
| Review | G1-threat-model | gate | STRIDE checklist | Yes |
| Review | G1-sast-clean | gate | Semgrep (zero high/critical) | Yes |
| Review | G1-secrets-clean | gate | Trivy secrets scan | Yes |
| Review | ddd-validator | rec | DDD Tactical Validator sub-agent | No |
| Test | spectra-archive | gate | Spectra `archive` (lock scenarios) | Yes |
| Test | mutation | gate | Stryker / PITest / mutmut ≥ threshold | Yes |
| Test | G2-dep-scan | gate | Trivy (re-run) | Yes |
| Test | mutation-analysis | rec | `ts-mutation-analyst` sub-agent | No |
| Ship | jira-transition | always | Atlassian Rovo MCP | No |
| Ship | confluence-publish | always | Atlassian Rovo MCP | No |
| Ship | github-release | rec | GitHub MCP | No |
| Reflect | registry-refine | always | `/ts-router refine` | No |
| Reflect | retro | rec | `council-advisor` | No |
| Reflect | skill-update | rec | `skill-creator` | No |

**Adding a new check:**
1. Pick phase, type, trigger, tool.
2. Add one row above in `registry.json` (not here — this is the template).
3. Done. No other change required.

---

## PRIMITIVE 3: PROJECT REGISTRY

A per-project, versioned collection of tools and gate thresholds. Lives in
`.ai/ts-deliver-router/registry.json`. Initialized once via `/ts-router init`, refined iteratively
via `/ts-router refine` (auto-triggered at Reflect in MID/HIGH DIAL).

The Project Registry answers: *"For this specific project, which tools are active,
which are optional, and what are the gate thresholds?"*

### `.ai/ts-deliver-router/registry.json` schema

```json
{
  "project": "<name>",
  "initialized": "<ISO date>",
  "lifecycle_stage": "early | active | stabilizing | maintenance",
  "core": {
    "spine": "gstack",
    "bdd": "spectra",
    "review": "code-review-graph",
    "token_discipline": "caveman"
  },
  "collection": [
    {
      "id": "<tool-id>",
      "type": "skill | plugin | mcp | agent",
      "phase": ["<phase>", ...],
      "tier": "active | optional | pending-setup | retired",
      "gate": "<gate-id or null>",
      "threshold": "<number or null>"
    }
  ],
  "gates": {
    "G1": {
      "phase": "review",
      "required": ["semgrep", "trivy"],
      "sign_off": "human"
    },
    "G2": {
      "phase": "test",
      "required": ["mutation>=85", "trivy"],
      "sign_off": "human"
    }
  },
  "refinement_count": 0,
  "next_refinement_trigger": "reflect"
}
```

**Tier definitions:**

| Tier | Meaning |
|---|---|
| `active` | In play this project — runs when its phase is reached |
| `optional` | Available, surfaced as `rec`, not required |
| `pending-setup` | Intended but not yet configured (surfaces as setup gap) |
| `retired` | Was used; no longer applicable this project |

### Lifecycle stage → default collection

| Stage | Core 4 | Additional defaults | Mutation target |
|---|---|---|---|
| **Spike / early** | ✅ | ACPL, first-principles-agent | 60% |
| **Active** | ✅ | ACPL, Semgrep, Stryker, GitHub MCP | 75% |
| **Stabilizing** | ✅ | All active + Trivy tighter | 85% |
| **Maintenance** | ✅ | code-review-graph heavy, ACPL Assertion Gate emphasis | 90% |

---

## Discovery Feedback Hook

Closes the loop with `ts-project-planner`'s Discovery track (Idea → Explore →
Validate → Ready). When Think or Build surfaces an unresolved assumption that
meets one of three gating criteria, this skill calls
`/ts-discover idea --from-router` — pushing the unknown upstream into Discovery
rather than absorbing it silently in Delivery. This is a single hook, not a
fourth primitive.

**Gating criteria — hook fires if the unknown:**
```
(a) blocks a security gate (G1 or G2), OR
(b) affects the scope of more than one epic, OR
(c) introduces a new external dependency not previously in scope
```

**Where it fires:**
- **Think** — `ts-event-storming-facilitator`'s exploration surfaces a domain
  assumption (e.g. "multi-currency required from day 1") with no prior
  validation record, and criterion (b) or (c) applies.
- **Build** — always-on checks (Semgrep / Trivy / code-review-graph) reveal an
  implementation-level unknown meeting criterion (c), or a finding that would
  block G1/G2 (criterion a).

**Call shape:**
```
/ts-discover idea --from-router
  description: "<the unresolved assumption, in one sentence>"
  source_epic: "<active epic id>"
```

**Non-blocking, always logged:**
- The hook never blocks phase progression — Think/Build continue regardless of
  the call's outcome.
- Success or failure is recorded in `state.json.notes`
  (e.g. `"discovery hook unavailable — ts-project-planner not detected"`).
- Dedup against existing `discovery.json` entries is `ts-project-planner`'s
  responsibility (title-similarity check) — this skill does not dedup.

**What does NOT fire the hook:**
Minor implementation details — naming, internal refactors, single-epic
non-blocking findings — are recorded in `state.json.notes` only. The hook is
reserved for unknowns that genuinely affect project-level decisions.

---

## Commands

### `/ts-router init`

Runs at the start of every new project. Writes `registry.json` and initial
`state.json`.

**Interview flow:**

```
Step 1 — Project profile
  Q: "Project type?" → greenfield / refactor / integration / spike
  Q: "Primary stack?" → TypeScript / Python / Java / mixed
  Q: "Touch external systems?" → yes / no  [triggers security tier]
  Q: "Frontend involved?" → yes / no  [unlocks addyosmani/agent-skills]
  Q: "Lifecycle stage?" → early / active / stabilizing / maintenance

Step 2 — Tool collection
  Router proposes collection based on Step 1 answers.
  Human confirms or overrides each tool.
  Unresolved pending-setup items listed with setup instructions.

Step 3 — Gate thresholds
  Q: "Mutation score target?" [default by stage, see table above]
  Q: "Security gates required?" [always yes if external systems = yes]

Step 4 — Write
  → .ai/ts-deliver-router/registry.json  (collection + gates)
  → .ai/ts-deliver-router/state.json     (phase = Think, initialized = true)
  → .ai/ts-deliver-router/autonomy       (if not already set)
  → Confirm: "Registry initialized. N tools active, 2 gates, mutation target X%."
```

### `/ts-router refine`

Refines the registry. Called automatically at Reflect (MID/HIGH DIAL). Also
callable any time.

**Refinement flow:**

```
Read registry.json + state.json + phase history.

Report:
  "Tools used this cycle: ..."
  "Tools unused this cycle: ..."
  "Gate results: G1 passed in N attempts, G2 needed N iterations"
  "Pending-setup items still unresolved: ..."

Prompts:
  → "Promote optional → active?"
  → "Retire active → retired?"
  → "Resolve pending-setup items?"
  → "Adjust mutation threshold?" (stage progression)
  → "Add tools discovered this cycle?"
  → "Update lifecycle_stage?" (e.g. early → active)

Write:
  → registry.json  (refinement_count++, changes applied)
  → registry.log   (append: { date, changes[], rationale })
  → Confirm: "Registry refined. refinement_count = N."
```

### `/ts-router status`

Print current state without advancing anything.

```
Output:
  Phase:        <current phase>
  DIAL:         HIGH / MID / LOW
  Active tools: <list from registry, tier=active>
  Pending setup: <list from registry, tier=pending-setup>
  Last refined: <date from registry.log>
  Next gate:    <next gate in current phase>
```

### `/ts-router dry-run [on|off]`

Toggle simulation mode. In dry-run, all commands are described but not executed.
Writes `.ai/ts-deliver-router/dry-run = true|false`. Default: off.

---

## Phase Routing Logic

On every "what next" / "where am I" / phase-advance request:

```
1. Read .ai/ts-deliver-router/state.json
   → Missing or stale (any artifact mtime > state.json mtime): STOP.
     Emit "phase unclear, manual review" + specific reason.

2. Read .ai/ts-deliver-router/registry.json
   → Missing: prompt "/ts-router init" first. STOP.
   → Warn on any pending-setup tools relevant to current phase.
   → Also read .ai/iteration.json if exists (ts-project-planner context).
   → Also read .ai/risks.md if Review phase (G1 enrichment).

3. Verify current phase artifacts pass minimum-schema.
   → Any failure: STOP. Emit specific failure.

4. Consult CHECKS REGISTRY for current phase.
   → Run `always` checks.
   → Surface `rec` checks per DIAL level.
   → Enforce `gate` checks before phase exit.
   → [Think + Build only] For each new unresolved assumption surfaced this
     phase, evaluate Discovery Feedback Hook gating criteria (a)/(b)/(c).
     If met → call /ts-discover idea --from-router (non-blocking; see
     "Discovery Feedback Hook" section above).

5. Respect DIAL. Default MID (recommend + wait) unless saved preference says otherwise.

6. On phase exit: atomically write .ai/ts-deliver-router/state.json (PHASE EXIT CONTRACT).
   → If .ai/iteration.json exists and writer_lock is clear:
     update epic status fields only (see workspace-spec.md cross-skill matrix).
```

---

## Phase Map

### Think
*Goal: domain understanding, problem classification, ubiquitous language*

Skills: `first-principles-agent` (rec), `six-thinking-hats-coach` (rec),
`tows-strategy-analyst` (rec), `ts-acpl` → `problem-frame-map.md` (rec)

**Sub-agent: `ts-event-storming-facilitator`** (rec — activate when registry `tier=active`)

Runs a structured ES session directly in Claude Code. No whiteboard required.

```
Input:  Project description (from /ts-router init answers or free text)

Session flow:
  1. Elicit Domain Events  (orange) — past-tense facts: "OrderPlaced", "IssueKeyRejected"
  2. Identify Commands     (blue)   — what triggers each event: "PlaceOrder", "ValidateKey"
  3. Name Aggregates       (yellow) — what handles each command: "Order", "IssueKey"
  4. Suggest Bounded Contexts       — where ubiquitous language changes meaning
  5. Classify Problem Frame         — Commanded / Information / Workpiece / Transformation / Control
  6. Map to ACPL pattern groups     — using ts-acpl→references/problem-frame-map.md

Output (written to state.artifacts.domain_vocabulary):
  domain_events:       [list]
  commands:            [list]
  aggregates:          [list]
  bounded_contexts:    [list]
  problem_frame:       <classification>
  acpl_pattern_group:  <G1|G2|G3|G4|G5 combination>
  ubiquitous_language: [key terms]
```

This output flows directly into Plan (Spectra `propose` uses the command list as
scenario seeds) and Build (ACPL pattern group pre-selected).

Exit contract: Problem Frame classification recorded in `state.artifacts`.
Domain vocabulary defined. ACPL pattern group set. No code written.

> If exploration surfaces an unresolved domain assumption meeting the
> Discovery Feedback Hook criteria, `/ts-discover idea --from-router` is
> called (see "Discovery Feedback Hook" above).

### Plan
*Goal: BDD scenarios, acceptance criteria, task decomposition, branch creation*

Skills: Spectra `discuss` → `propose` (always), `ts-acpl` → pattern group selection (rec),
`prompt-refiner` (rec for hardening agent prompts)

**MCPs active in Plan:**
- **Atlassian Rovo** (rec): create/update Jira stories from Spectra scenarios; two-way traceability
- **GitHub MCP** (rec): `create_branch` from main using feature name; link branch to Jira issue

```
GitHub MCP operations at Plan exit:
  create_branch(name="feat/<feature-name>", from="main")
  → branch URL recorded in state.artifacts.branch
  → Jira issue updated with branch link via Atlassian Rovo
```

Gate: Spectra minimum-schema — every scenario has Given / When / Then complete.

Exit contract: `spec/` directory exists. All scenarios pass minimum-schema.
`state.json` records scenario count + branch name.

### Build
*Goal: code generation with ACPL patterns applied*

Skills: `ts-acpl` skill (always — primary coding discipline), Spectra `apply` (always),
`code-review-graph` MCP (always — incremental review), mattpocock/skills (conditional
TS), addyosmani/agent-skills (conditional frontend)

Agents: Copilot CLI (boilerplate muscle), Gemini (large-context reads)

Always checks: Semgrep SAST, Trivy dep/secrets scan.

> If always-checks surface a new external dependency or a G1/G2-blocking
> finding, the Discovery Feedback Hook fires (see "Discovery Feedback Hook"
> above).

**GitHub MCP operations in Build** (rec — continuous):
```
  push_files(branch=state.artifacts.branch, files=[...], message="feat: <scope>")
  → commits scoped to feature branch; never to main
  → commit message format: "<type>(<scope>): <summary>" (conventional commits)
```

Gate: TDD coverage ≥ threshold.

Exit contract: All scenarios have implementation. Coverage gate green. SAST/dep
scan results recorded in `state.gates`. Branch has at least one commit.

### Review
*Goal: architecture conformance, code quality, G1 security gate*

Skills: `code-review-graph` MCP (always), `critical-thinker` (rec),
`council-advisor` (rec for high-stakes decisions), `ts-ddd-tactical-validator` (rec)

**GitHub MCP operations in Review:**
```
  create_pull_request(
    head=state.artifacts.branch,
    base="main",
    title="<feature>",
    body="Closes <jira-issue>. Scenarios: <scenario count>."
  )
  → PR URL recorded in state.artifacts.pr_url

  create_review_comment(pr=state.artifacts.pr_url, body="<code-review-graph findings>")
  → posts code-review-graph report inline on the PR diff
```

**G1 Gate (STRIDE + OWASP):**
```
Checklist:
[ ] STRIDE threat model completed (Spoofing / Tampering / Repudiation /
    Info Disclosure / Denial of Service / Elevation of Privilege)
[ ] OWASP Top 10 checked for relevant items
[ ] Semgrep zero high/critical findings
[ ] Trivy secrets scan clean
[ ] Privacy inventory reviewed (PII handling documented)
Human sign-off required. Records to state.gates.G1.
```

**Discovery linkage (advisory, non-blocking):** if `.ai/discovery.json` has any
entry with `source_epic` = this epic and `status` not in `{ready, killed}`,
surface it here. Human may resolve via `ts-project-planner`'s `/ts-discover`
commands, or explicitly accept the risk and record it in
`state.gates.G1.notes`. This does not hard-block G1 sign-off.

Exit contract: G1 signed off. PR open with review comments. `code-review-graph`
report saved. ACPL pattern coverage verified.

### Test
*Goal: BDD execution, mutation testing, G2 gate, ≥ threshold mutation score*

Skills: Spectra `archive` (gate — lock scenarios), `ts-acpl` → `mutation-guide.md`

Plugins: Stryker (TS/JS), PITest (Java), mutmut (Python) — choice per stack

**Sub-agent: `ts-mutation-analyst`** (rec — activate when registry `tier=active`)

Closes the loop between code generation and mutation score without manual diagnosis.

```
Input:  Mutation report path (Stryker HTML/JSON, PITest XML, or mutmut output)
        + state.artifacts.acpl_pattern_group

Processing:
  1. Parse surviving mutants from report
  2. Classify each by mutant class:
       boundary-value     → Guard Clause / Value Object
       conditional        → Specification / Policy Object
       statement-deletion → Pure Function / Command Object
       return-value       → Result/Either / Explicit Empty
       state-variable     → State Machine / Event Sourcing
  3. For each surviving mutant → look up ACPL Mutation Sensitivity Note
  4. Name the exact missing test

Output:
  mutation_score:   N%  vs threshold N%  → PASS | FAIL
  priority_fixes:
    1. [BOUNDARY] src/IssueKey.ts:14
       Missing: IssueKey.create("") → Err(ValidationError)
       Pattern: Guard Clause. Kills: boundary-value mutant on regex guard.
    2. [RETURN VALUE] src/BulkExecutor.ts:42
       Missing: assert result.ok === false on API 4xx response
       Pattern: Result/Either. Kills: return-value replacement mutant.
  acceptable_survivors: N  (logging/cosmetic — documented)
```

**GitHub MCP operations in Test:**
```
  update_pull_request_review(
    pr=state.artifacts.pr_url,
    body="Mutation score: N% (threshold N%). G2: PASS|FAIL.\nSurviving mutants: N priority fixes."
  )
  → updates PR description with live mutation score before G2 sign-off
```

**G2 Gate:**
```
[ ] All Spectra scenarios pass (Given/When/Then green)
[ ] Mutation score ≥ registry threshold (default 85%)
[ ] Trivy dependency scan re-run clean
[ ] No new critical findings vs Review baseline
Human sign-off required. Records to state.gates.G2.
```

Exit contract: Spectra scenarios archived (locked). Mutation score recorded in
`state.metrics.mutation_score`. G2 signed off. PR updated with score.

### Ship
*Goal: release, deployment, traceability update*

Skills: `vibe-coding-scaffold` → release checklist

**GitHub MCP operations in Ship** (primary operations for this phase):
```
  merge_pull_request(pr=state.artifacts.pr_url, merge_method="squash")
  → squash merge to keep main history clean

  create_release(
    tag="v<version>",
    target="main",
    name="<feature name>",
    body="<changelog from Spectra archived scenarios>"
  )
  → release tag URL recorded in state.artifacts.release_url

  Copilot CLI: generate release notes from commit history (muscle)
```

**Atlassian Rovo MCP operations:**
```
  Jira: transition issues → Done; link PR + release tag
  Confluence: publish page with archived Spectra scenarios as living documentation
```

Exit contract: PR merged to main. Release tag created. Jira issues transitioned.
Confluence page updated with archived Spectra scenarios.

### Reflect
*Goal: retrospective, registry refinement, skill improvement*

Skills: `/ts-router refine` (always — auto-run), `council-advisor` (rec), `mastery-tutor`
(rec), `skill-creator` (rec), Atlassian Rovo MCP (write reflect.md to Confluence)

Exit contract: `registry.json` refinement_count incremented. `registry.log` updated.
Lessons captured.

---

## External Dependencies

### Required (always active — Core 4 + orchestration)

| Tool | Role | Source |
|---|---|---|
| gstack | 7-phase spine | https://github.com/andyfischer/gstack |
| Spectra | BDD discipline | Spectra BDD skill library |
| code-review-graph | Incremental review MCP | https://github.com/tirth8205/code-review-graph |
| Copilot CLI | Boilerplate muscle | GitHub Copilot CLI |
| Gemini CLI | Large-context muscle | Google Gemini CLI |

### Harvested (active when relevant)

| Tool | Role | Condition |
|---|---|---|
| superpowers | Extended skill set | Harvest specific skills only; do NOT use as competing spine |
| mattpocock/skills | TS type discipline | TypeScript projects only |
| addyosmani/agent-skills | Frontend/perf patterns | Frontend projects only |
| ts-acpl | Coding pattern library | All projects (strongly recommended) |

### Plugins (fill former placeholders)

| Plugin | Role | Phase |
|---|---|---|
| **Semgrep** | SAST (fills `<SAST tool>`) | Build (always) + Review (G1 gate) |
| **Trivy** | Dep/secrets scan (fills `<dep/secrets scanner>`) | Build (always) + Test (G2 gate) |
| **Stryker** | Mutation testing TS/JS (fills `<mutation tool>`) | Test (G2 gate) |
| **PITest** | Mutation testing Java | Test (G2 gate) |
| **mutmut** | Mutation testing Python | Test (G2 gate) |

### MCPs

| MCP | Role | Phase(s) | Status |
|---|---|---|---|
| Atlassian Rovo | Jira + Confluence traceability | Plan, Ship, Reflect | Connected |
| code-review-graph | Incremental code review | Build, Review (always-on) | Required — warn if not configured |
| **GitHub MCP** | **Full traceability chain** | **Plan→Build→Review→Test→Ship** | Add — see `setup-gaps.md` |

**GitHub MCP operations by phase:**

| Phase | Operation | Effect |
|---|---|---|
| Plan | `create_branch` | Feature branch from main; linked to Jira |
| Build | `push_files` | Commits to feature branch (conventional commits) |
| Review | `create_pull_request` + `create_review_comment` | PR opened; code-review-graph findings posted inline |
| Test | `update_pull_request_review` | PR description updated with mutation score |
| Ship | `merge_pull_request` + `create_release` | Squash merge; release tag with Spectra changelog |

### Sub-agents

| Agent | Phase | Activation | Purpose |
|---|---|---|---|
| **`ts-event-storming-facilitator`** | Think | `tier=active` in registry | ES session → Domain Events → Commands → Aggregates → ACPL pattern group → flows into Plan + Build |
| `ts-spec-validator` | Plan | Always (gate) | Verify Spectra minimum-schema before phase exit |
| `ts-ddd-tactical-validator` | Review | `tier=active` in registry | Verify Aggregate boundaries + Repository interfaces match scenarios |
| **`ts-mutation-analyst`** | Test | `tier=active` in registry | Parse Stryker/PITest report → classify surviving mutants → name exact missing ACPL test |

Build specs for all four sub-agents: `references/sub-agents.md`

---

## Setup Gap Detection

Before routing in any phase, the router checks `.ai/ts-deliver-router/registry.json` for
`tier=pending-setup` items relevant to the current phase. If found:

```
⚠ Setup gap detected: <tool> is pending-setup but required for <phase>.
  Setup instructions: <from references/setup-gaps.md>
  Options:
    1. Resolve now (router waits)
    2. Mark as optional for this project (downgrades to tier=optional)
    3. Continue without it (router notes the skip in state.json)
```

---

## Reference Files

| File | When to read |
|---|---|
| `references/registry-schema.md` | Full registry.json field reference + examples |
| `references/gate-checklists.md` | G1 STRIDE + G2 mutation gate full checklists |
| `references/setup-gaps.md` | Setup instructions for each pending-setup tool |
| `references/phase-exit-contracts.md` | Full exit contract spec for all 7 phases |
| `references/sub-agents.md` | Build specs for the 4 recommended sub-agents |
| `references/acpl-integration.md` | How ACPL skill integrates phase-by-phase |
