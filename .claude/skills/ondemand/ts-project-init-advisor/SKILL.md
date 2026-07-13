---
name: ts-project-init-advisor
description: "Generates PROJECT_INIT_PLAN.md"
---
<!--
"Analyzes a project and generates PROJECT_INIT_PLAN.md — an executable, approval-gated Claude Code setup plan (MCPs, skills, hooks, CLAUDE.md). Activate when user asks to set up, initialize, or configure Claude Code for a project. Works in claude.ai (GitHub URL) and Claude Code (local scan)."
-->

# Project Init Advisor

Analyzes a project and produces a single executable artifact: **`PROJECT_INIT_PLAN.md`** — a structured, approval-gated task plan that initializes Claude Code with the right MCPs, skills, sub-agents, hooks, and CLAUDE.md.

---

## Token Governance

1. **Catalog-first**: Read `references/catalog.md` (MUST-HAVE section) before any web call — zero token waste.
2. **Web search optional**: Only search if catalog has no coverage for a detected stack or service.
3. **5-search quota**: Announce counter before each search: `🔍 Search X/5: [reason]`. Hard stop at 5/5.
4. **Approval gate**: At 5/5, ask user to resume (+5) or stop — wait for reply.
5. **User STOP**: "stop searching" → halt immediately, proceed with gathered data.


---

| Need | Source / Module |
|------|-----------------|
| Tool catalog (MUST-HAVE section) | `references/catalog.md` |
| CLAUDE.md scoring rubric | `references/claudemd-patterns.md` |
| Problem → recommendation mapping | Internal Phase 3 logic (keep inline) |
| Init plan template format | `references/init-plan-template.md` |

---

## Phase 1: Context Gathering — Claude Code Mode

**Step 1** — Read catalog immediately:
```
Read: references/catalog.md  →  MUST-HAVE section into working memory
```

**Step 2** — Scan local project (shell commands):
```bash
# Stack detection
ls package.json pyproject.toml Cargo.toml go.mod pom.xml 2>/dev/null
cat package.json 2>/dev/null | head -40
cat pyproject.toml 2>/dev/null | head -40

# Existing Claude config
ls .claude/ 2>/dev/null
cat .claude/CLAUDE.md 2>/dev/null
cat .claude/mcp.json 2>/dev/null
cat .claude/settings.json 2>/dev/null

# Project signals
cat README.md 2>/dev/null | head -30
cat .env.example 2>/dev/null
ls .github/workflows/ 2>/dev/null
ls src/ app/ lib/ tests/ 2>/dev/null
ls Dockerfile docker-compose.yml 2>/dev/null
```

**Step 3** — Run user interview for gaps only (same questions as 1A, skip answered ones).

**Step 4** — Optional live fetch (quota-governed).

---

## Phase 2: CLAUDE.md Analysis (if one found)

Score the existing CLAUDE.md using `references/claudemd-patterns.md` rubric:

| Dimension | Check | Score 0–2 |
|---|---|---|
| Project context | Purpose, stack, phase stated? | |
| Behavior rules | Always/never/style explicit? | |
| Tool permissions | Allow/deny calibrated? | |
| Memory anchors | Key decisions + "never do X"? | |
| MCP references | MCPs listed with usage guidance? | |
| Sub-agent contracts | Role + trigger + handoff? | |
| Compaction strategy | /compact instructions present? | |
| Token hygiene | Under 200 lines with clear value? | |

**Total: X/16**
- 0–6 → generate new CLAUDE.md from scratch in the plan
- 7–11 → targeted patches in the plan
- 12–16 → minor additions only

---

## Phase 3: Build Recommendation Set

Apply mapping logic (see Recommendation Mapping Logic section).
Produce three lists:
- **Tier 1** — install first, highest impact
- **Tier 2** — add when ready
- **Tier 3** — situational, mention only

For each Tier 1 + 2 item, resolve:
- Exact install command
- Exact settings.json permission snippet
- Hook file content (if hook)
- Sub-agent file content (if sub-agent)

This data feeds directly into Phase 4 task generation.

---

## Phase 3.5: Golden Agent-Context File Gap Scan

This repo authors five canonical agent-context files (`CLAUDE.md`, `AGENTS.md`,
`.claude/CLAUDE.md`, `.claude/goverance_CLAUDE.md`, `.github/copilot-instructions.md`),
packaged with this skill under `assets/golden/<relpath>` (same relative subpath, dotted
directories preserved). Before generating the plan, scan the target project for each of
the five paths and classify it into exactly one of three states:

1. **Absent** — target path does not exist. Add a **create** task: write
   `assets/golden/<relpath>` content to `<target-project>/<relpath>` verbatim, byte-identical.
   No approval gate — nothing exists to clobber. This is the only case where the advisor
   itself writes a golden file to disk.
2. **Present, differs** — target path exists and its content does not byte-match
   `assets/golden/<relpath>`. Add a **MODIFY** task containing the target path and a
   comparison between the target's current content and the golden content, produced by
   reading both files directly and describing the difference in prose — no diff library,
   no new dependency (this skill is agent-executed prose, not compiled code; see the
   change's design.md D4). The task instructs the human to review and manually reconcile.
   The advisor never writes to this file itself — the write is the human's call.
3. **Present, byte-identical** — target path exists and matches `assets/golden/<relpath>`
   exactly. No task is emitted for that file.

Repeat for all five paths independently — a project can land in different states per file.

**Coexistence with `install.sh SCAFFOLD=y`**: the installer's `SCAFFOLD=y` flag is
unchanged by this skill and continues to copy-if-absent the entire
`src/project_root_structure/` tree (all files, not just these five) into a target project
at install time. This gap scan is additive and idempotent with it: a project that already
ran `SCAFFOLD=y` will have all five golden files present, so the scan naturally lands each
one in the present-and-matching (no task) branch above, unless the project has since
diverged. Both paths exist because `SCAFFOLD=y` gives an immediate full scaffold at install
time, while this scan gives per-file, approval-gated recommendations at any later point —
neither path changes the other's behavior.

---

## Phase 4: Generate PROJECT_INIT_PLAN.md

Generate the full plan file using the template → `references/init-plan-template.md`.  Output path: `tasks/PROJECT_INIT_PLAN.md` (Claude Code).

---

### After writing the file

**Claude Code mode** — announce:
```
✅ PROJECT_INIT_PLAN.md written to: tasks/PROJECT_INIT_PLAN.md

To execute:
  "Run tasks/PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"

Tasks: {N} total  |  Tier 1: {n}  |  Tier 2: {n}  |  Hooks: {n}  |  Agents: {n}
```

---

## Recommendation Mapping Logic

### Tier 1 (always include on match)
| Signal | Recommend |
|---|---|
| Any project | `ponytail` plugin (Claude Code) |
| Any project | `Graphify` MCP (code graph) |
| Any project | `caveman` skill + system installer |
| Any project | `spectra` app (open project in Spectra) |
| Any project | `code-review-graph` MCP |
| Any project | `Superpowers` plugin (Claude Code) |
| Any project | `mattpocock/skills` (global) |
| GitHub / GitLab detected | `github` MCP + `git-operations` skill |
| Jira / Confluence / Atlassian | `atlassian` MCP + `atlassian-rest-api` skill |
| Google Workspace | `google-drive` MCP + `gmail` MCP |
| Slack | `slack` MCP |
| PostgreSQL / MySQL / Mongo | database MCP + `schema-reviewer` sub-agent |
| AI / LLM project | `web-search` tool + `prompt-optimization` skill |
| Python project | `filesystem` MCP + `python-test-runner` skill |
| Team ≥ 2 | `code-reviewer` sub-agent |
| API / backend | `api-tester` sub-agent |
| Enterprise + Atlassian | full Rovo agent suite |
| Any project | `block-env-edit` hook + `session-summary` hook (MUST-HAVE) |

### Tier 2 (include if stack matches)
| Signal | Recommend |
|---|---|
| Any project | `ratacat/claude-skills@clean-code` |
| Any project | `ratacat/claude-skills@design-patterns` |
| Any project | `VoltAgent/awesome-agent-skills` (browse collection, pick relevant) |
| Any project | `Impeccable` (frontend design skill) |
| Any project | `Design Council` ⚠️ unverified install |
| Any project | `Anthropic Cybersecurity Skills` ⚠️ unverified install |
| Any web project | `UI UX Pro Max` ⚠️ unverified install |
| Any web project | `Awesome Claude Design` ⚠️ unverified install |
| Any web project | `researcher` sub-agent |
| Prettier / Black / gofmt detected | `format-on-edit` hook |
| ESLint / Ruff detected | `lint-on-edit` hook |
| TypeScript | `typecheck-on-edit` hook |
| Tests directory exists | `run-related-tests` hook |
| Security paths (auth/, payments/) | `confirm-sensitive-edit` hook |
| CI/CD present | `log-analyzer` sub-agent |
| Team ≥ 3 | `council-advisor` skill |
| Complex architecture | `planner` sub-agent |

### Tier 3 (mention at bottom of plan, no task block)
- Mobile → platform-specific MCPs
- Infra/DevOps → cloud-provider MCPs
- Niche stack → domain-specific skills

---

## Quality Standards

- Never generate a task for an MCP already in `.claude/mcp.json` — add to SKIPPED section instead
- Never add permissions broader than the project requires
- All install commands must be exact — never invent package names
- All hook scripts must be complete and runnable — no pseudocode
- All sub-agent definitions must include role, trigger, input, output, handoff
- CLAUDE.md in the plan must have zero unfilled placeholders
- Every task must have an exact verify command
- Unverified live-fetched MCPs: flag ⚠️ UNVERIFIED, move to Tier 3

---

## ts-deliver-router CLAUDE.md Template

Copy the block below into a project's Claude Code **Project Instructions**
(or `CLAUDE.md`) when recommending ts-deliver-router setup. Adjust the
stack-specific sections for the target project.

```markdown
## ts-deliver-router — Project Instructions

### Workflow Hub
This project uses ts-deliver-router as its workflow coordinator.
Phase: read from `.agents/ts-deliver-router/state.json` — never infer from artifacts.
Registry: read from `.agents/ts-deliver-router/registry.json` — check before routing.
DIAL: read from `.agents/ts-deliver-router/autonomy` — default MID if missing.

On any "what next" / "where am I" / "which skill" query:
1. Read .agents/ts-deliver-router/state.json → stale or missing → STOP, report reason
2. Read .agents/ts-deliver-router/registry.json → missing → prompt /ts-deliver init
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
  + advisory linkage to .agents/discovery.json entries for this epic
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

---

## Reference Files

- `references/catalog.md` — Static registry: MCPs, skills, hooks, sub-agents, permissions
- `references/claudemd-patterns.md` — CLAUDE.md templates, anti-patterns, scoring rubric
