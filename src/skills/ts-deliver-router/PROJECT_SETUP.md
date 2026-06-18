# PROJECT_SETUP.md — Claude Code Project Instructions

Copy the block below into your Claude Code Project's **Project Instructions**
(or `CLAUDE.md`). Adjust the stack-specific sections for your project.

---

```markdown
## ts-deliver-router — Project Instructions

### Workflow Hub
This project uses ts-deliver-router as its workflow coordinator.
Phase: read from `.ai/ts-deliver-router/state.json` — never infer from artifacts.
Registry: read from `.ai/ts-deliver-router/registry.json` — check before routing.
DIAL: read from `.ai/ts-deliver-router/autonomy` — default MID if missing.

On any "what next" / "where am I" / "which skill" query:
1. Read .ai/ts-deliver-router/state.json → stale or missing → STOP, report reason
2. Read .ai/ts-deliver-router/registry.json → missing → prompt /ts-deliver init
3. Verify phase artifacts pass minimum-schema
4. Consult CHECKS REGISTRY for current phase
5. Respect DIAL setting

### Core 4 (always active — never negotiate)
- Spine:            gstack 7-phase (Think→Plan→Build→Review→Test→Ship→Reflect)
- BDD discipline:   Spectra (discuss/propose/apply/ingest/archive)
- Review:           code-review-graph MCP (always-on incremental review)
- Token format:     caveman (all skill variants)

### Agents (hub + muscle)
- Hub:              Claude Code (orchestration, reasoning, sub-agents)
- Muscle boilerplate: Copilot CLI (GitHub-native, fast file ops)
- Muscle large-ctx:   Gemini CLI (whole-repo reads, fleet tasks)

### Required External Dependencies
- gstack:             https://github.com/andyfischer/gstack
- Spectra:            [Spectra BDD skill library]
- code-review-graph:  https://github.com/tirth8205/code-review-graph (MCP server)
  ⚠ If not configured → surface setup gap before entering Build phase

### Build Phase — ACPL Code Generation Rules
All code generated in Build MUST follow these rules:
R1: Inject deps — never `new` inside business logic
R2: Guard clauses first — happy path never nested
R3: Boolean conditions use named predicates — no inline boolean soup
R4: State transitions explicit — no boolean flags for phase tracking
R5: Error paths return typed Result/Either — never swallow exceptions
R6: Every public function has contract comment (pre/post conditions)
R7: Side effects isolated to outermost layer only
R8: Magic literals are named constants — no bare 0/""/null in logic

Pattern groups are selected from ts-acpl based on Problem Frame classification
recorded in state.json at Think exit.

### Discovery Feedback Hook (Think + Build)
When Think or Build surfaces an unresolved assumption meeting ANY of:
  (a) blocks G1/G2, (b) affects >1 epic scope, (c) new external dependency
→ call /ts-discover idea --from-router (description, source_epic=active epic).
Non-blocking; outcome logged in state.json.notes regardless. Dedup is
ts-project-planner's responsibility. Minor single-epic details → notes only,
hook does not fire. Full spec: SKILL.md "Discovery Feedback Hook".

### Security Gates (always pause for human — no DIAL level bypasses)
G1 (Review phase): STRIDE + OWASP + Semgrep zero H/C + Trivy secrets clean
  + advisory linkage to .ai/discovery.json entries for this epic
G2 (Test phase):   mutation score ≥ registry threshold + Trivy re-run clean

### Plugin Stack (fills former placeholders)
SAST:             Semgrep   (Build always + Review G1)
dep/secrets scan: Trivy     (Build always + Test G2)
mutation TS/JS:   Stryker   (Test G2)
mutation Java:    PITest    (Test G2)
mutation Python:  mutmut    (Test G2)

### MCPs Active
- Atlassian Rovo:   https://mcp.atlassian.com/v1/mcp  (Plan + Ship + Reflect)
- code-review-graph: [local MCP server]               (Build + Review always)
- GitHub MCP:       [configure — see setup-gaps.md]   (Plan→Ship)

### Harvested Skills (conditional)
- mattpocock/skills:       TypeScript projects only
- addyosmani/agent-skills: Frontend projects only
- superpowers:             Harvest specific skills only — NOT as competing spine

### Sub-Agents (build from references/sub-agents.md)
- .claude/agents/ts-event-storming-facilitator.md  (Think)
- .claude/agents/ts-spec-validator.md              (Plan exit gate)
- .claude/agents/ts-ddd-tactical-validator.md      (Review)
- .claude/agents/ts-mutation-analyst.md            (Test)

### Commands (this skill)
/ts-deliver init         → initialize project registry + state
/ts-deliver refine       → refine registry (auto-called at Reflect MID/HIGH)
/ts-deliver status       → print current phase + active tools + pending-setup
/ts-deliver dry-run on   → simulation mode (describe commands, don't execute)
/ts-deliver dry-run off  → resume normal execution

### Commands (ts-project-planner — sibling skill, if installed)
/ts-discover idea|explore|validate|decide|status  → Discovery track (Layer D)
/ts-project plan --new|--sync|status|refine       → Backlog (Layer 0)
/ts-iteration start|next|status|close             → Delivery (Layer 1, calls
                                                      /ts-deliver init per epic)

### Design Principles
- Add rigour, never add scope
- State is written, never inferred
- Core 4 is invariant
- Project Registry is living (init once, refine every Reflect)
- Security gates always pause for human sign-off
- Discovery Feedback Hook is non-blocking and gated by 3 explicit criteria
```
