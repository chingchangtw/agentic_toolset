# PRD — project-init-advisor Skill
**Version**: 1.0  
**Status**: Draft  
**Owner**: Tony (CAO, Synaptics)  
**Last Updated**: 2025-06

---

## 1. Purpose

`project-init-advisor` is a Claude Code / claude.ai skill that analyzes a project and produces a single executable artifact — `PROJECT_INIT_PLAN.md` — containing an approval-gated, task-by-task initialization plan for configuring Claude Code with the right MCPs, skills, sub-agents, hooks, and CLAUDE.md.

It replaces the manual, ad-hoc process of researching and assembling a Claude Code environment from scratch every time a new project starts.

---

## 2. Problem Statement

### Current pain
- Developers starting a new Claude Code project must manually discover, evaluate, and install MCPs, skills, hooks, and sub-agents with no guided process.
- There is no standard way to audit an existing CLAUDE.md for quality or completeness.
- Recommendations are generic — not derived from the actual project's stack, services, or team context.
- Each init is one-shot and irreversible; there is no approval gate before changes are applied.
- The process is entirely different when working in claude.ai vs. Claude Code CLI — no skill bridges both.

### Desired outcome
A single skill invocation produces a complete, project-specific, executable plan that works in both environments and gives the user full control over what gets applied.

---

## 3. Target Users

| User | Context | Primary Need |
|---|---|---|
| Solo developer | New project, bare Claude Code install | Fast, correct init without research overhead |
| Team lead | Existing repo with inconsistent Claude config | Audit + gap analysis + standardized setup |
| Enterprise architect | Template repo + GitHub connected | Delta analysis against baseline template |
| CAO / AI transformation lead | Multiple project types across org | Repeatable, governed init process |

---

## 4. Runtime Environments

The skill detects its environment at startup and adapts behavior accordingly.

### 4.1 claude.ai Mode
**Detection**: No filesystem access; `.claude/` directory not reachable.

**Flow**:
1. Ask user for GitHub repository URL
2. Fetch key project files via GitHub MCP (`get_file_contents`) or `raw.githubusercontent.com` fallback
3. Run gap-filling user interview (questions skipped if already answered by fetched files)
4. Generate `project_init_plan.md` as a downloadable file
5. User downloads, places in project root, opens Claude Code, and executes

**GitHub MCP benefit**: When connected, the skill reads actual repo files (stack manifests, existing `.claude/` config, `.env.example`, CI workflows) without requiring the user to paste them manually. This is the recommended setup.

### 4.2 Claude Code / CLI Mode
**Detection**: `.claude/` directory exists or local filesystem is readable via shell tools.

**Flow**:
1. Scan local project directory via bash commands
2. Run gap-filling user interview
3. Write `tasks/PROJECT_INIT_PLAN.md` directly into the project
4. User executes plan in-place: `"Run tasks/PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"`

---

## 5. Primary Deliverable — PROJECT_INIT_PLAN.md

The plan file is the skill's sole output. It is:

- **Executable**: Each task contains exact commands, file contents, and a verify step
- **Approval-gated**: Every task requires explicit user confirmation before execution
- **Self-contained**: No external lookups needed at execution time — all content is embedded
- **Idempotent-aware**: Already-installed MCPs/skills are listed in a SKIPPED section, not re-applied
- **Portable**: Generated in claude.ai, executable in Claude Code — same format, same execution instruction

### 5.1 Plan Structure

```
# PROJECT INIT PLAN
[header: date, project name, mode, source]

## PROJECT PROFILE
[inferred type, stack, services, team, repo]

## CLAUDE.md STATUS
[score X/16 + action: new | patch | minor | no change]

## HOW TO EXECUTE THIS PLAN
[execution instruction for both environments]

## TASKS
[one task block per action item — see Task Block Spec]

## TIER 3 — CONSIDER LATER
[low-priority items, one line each]

## SKIPPED (already installed)
[deduplication list]
```

### 5.2 Task Block Specification

Every task block contains:

```markdown
### TASK N: [descriptive name]
**Type**:             Setup | MCP Install | Hook | Sub-agent | Config | Skills | Verification
**Tier**:             1 | 2 | FINAL
**Approval required**: yes
**Why**:              [1-sentence rationale tied to this specific project]
**Action**:           [exact bash commands or file contents — no pseudocode]
**Env vars needed**:  [list or "none"] (MCP tasks only)
**Verify**:           [exact command to confirm success]
```

### 5.3 Task Ordering

Tasks always execute in this sequence:
1. Create `.claude/` directory structure
2. Install Tier 1 MCPs (one task per MCP)
3. Create Tier 1 hook scripts + register in settings.json
4. Create Tier 1 sub-agent files
5. Apply merged `settings.json`
6. Write `CLAUDE.md`
7. Install skills
8. Install Tier 2 MCPs
9. Create Tier 2 hooks + sub-agents
10. Final verification (`claude /init` + spot checks)

---

## 6. Skill Phases

### Phase 0 — Environment Detection
Detects runtime mode. Announces mode to user. Routes to Phase 1A or 1B.

### Phase 1A — Context Gathering (claude.ai)
- Prompts for GitHub URL
- Fetches files in priority order: README → stack manifest → `.claude/CLAUDE.md` → `mcp.json` → `settings.json` → `.env.example` → CI workflow → Dockerfile
- Stops fetching when context is sufficient (token conservation)
- Gap-fills via user interview

### Phase 1B — Context Gathering (Claude Code)
- Reads `references/catalog.md` MUST-HAVE section first
- Scans local project via bash: stack files, `.claude/` config, project structure signals
- Gap-fills via user interview

### Phase 2 — CLAUDE.md Analysis
Scores existing CLAUDE.md on 8 dimensions (0–2 each, max 16):

| Dimension | What is evaluated |
|---|---|
| Project context | Purpose, stack, phase stated clearly |
| Behavior rules | Always / never / style explicit |
| Tool permissions | Allow/deny calibrated to project needs |
| Memory anchors | Key decisions + "never do X" captured |
| MCP references | MCPs listed with per-MCP usage guidance |
| Sub-agent contracts | Role + trigger + input/output + handoff |
| Compaction strategy | `/compact` instructions present |
| Token hygiene | Under 200 lines with clear section value |

Score determines action in the plan:
- 0–6 → generate new CLAUDE.md from scratch
- 7–11 → targeted patches
- 12–16 → minor additions only

### Phase 3 — Build Recommendation Set
Applies recommendation mapping logic against detected signals. Produces Tier 1 / Tier 2 / Tier 3 lists. Resolves exact commands, file contents, and permissions for each Tier 1 + 2 item before Phase 4.

### Phase 4 — Generate PROJECT_INIT_PLAN.md
Writes the complete plan file. Announces output path and task summary. Offers follow-up actions.

---

## 7. Recommendation System

### 7.1 Catalog-First Architecture
The skill uses a static catalog (`references/catalog.md`) as its primary recommendation source. Web search is optional enrichment, not the default path.

**Catalog sections**:
- Section 0: MUST-HAVE (universal baseline — always applied)
- Section 1: MCPs — Official Anthropic / First-Party
- Section 2: MCPs — Ecosystem / Third-Party
- Section 3: Claude Code Skills
- Section 4: Sub-agent Archetypes
- Section 5: Hooks — Lifecycle Automations
- Section 6: Settings.json Permission Blocks

### 7.2 MUST-HAVE Baseline (applied to every project)

| Item | Type | Rationale |
|---|---|---|
| `filesystem` permissions | Config | Scopes Claude Code's read/write safely |
| `git-operations` skill | Skill | Every code project needs commit/branch/diff workflows |
| `code-reviewer` sub-agent | Sub-agent | Catches regressions before commit |
| `researcher` sub-agent | Sub-agent | Offloads external doc lookup, saves tokens |
| `block-env-edit.sh` hook | Hook | Prevents accidental `.env` credential exposure |
| `session-summary.sh` hook | Hook | PreCompact session log — recoverable audit trail |
| CLAUDE.md 5 core sections | Config | Project context, behavior rules, permissions, architecture notes, compaction |

### 7.3 Tier Mapping Logic

**Tier 1** — always include on signal match:

| Signal | Recommendation |
|---|---|
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

**Tier 2** — include if stack matches:

| Signal | Recommendation |
|---|---|
| Any web project | `researcher` sub-agent |
| Prettier / Black / gofmt detected | `format-on-edit` hook |
| ESLint / Ruff detected | `lint-on-edit` hook |
| TypeScript | `typecheck-on-edit` hook |
| Tests directory exists | `run-related-tests` hook |
| Security paths (auth/, payments/) | `confirm-sensitive-edit` hook |
| CI/CD present | `log-analyzer` sub-agent |
| Team ≥ 3 | `council-advisor` skill |
| Complex architecture | `planner` sub-agent |

**Tier 3** — mention at plan footer, no task block:
- Mobile → platform-specific MCPs
- Infra/DevOps → cloud-provider MCPs
- Niche stack → domain-specific skills

### 7.4 Deduplication
Any MCP or skill already present in the project's `.claude/mcp.json` is moved to the SKIPPED section. No duplicate installs are generated.

### 7.5 Hook System
Hooks are shell scripts in `.claude/hooks/` registered in `settings.json`. Four lifecycle types:

| Type | Fires | Common use |
|---|---|---|
| `PreToolUse` | Before tool runs | Block dangerous ops, require confirmation |
| `PostToolUse` | After tool completes | Auto-format, lint, run tests |
| `PreCompact` | Before context compaction | Save session summary |
| `SessionStart` | When session opens | Print project context reminder |

Every hook task in the plan includes: complete shell script content + exact `settings.json` registration snippet.

---

## 8. Token Governance

| Rule | Behavior |
|---|---|
| Catalog-first | Read `references/catalog.md` MUST-HAVE before any web call |
| Web search optional | Only if catalog has no coverage for detected stack/service |
| 5-search quota | Counter announced before each search: `🔍 Search X/5: [reason]` |
| Hard stop at 5/5 | Notifies user; requires explicit approval to resume (+5 more) |
| User STOP | "stop searching" → halt immediately, proceed with gathered data |
| Sufficiency check | If catalog covers all signals → skip web entirely, note it |

---

## 9. Quality Standards

| Standard | Rule |
|---|---|
| No duplicate tasks | Dedup against existing `mcp.json` before generating tasks |
| Minimal permissions | Never add permissions broader than the project requires |
| Exact commands only | No pseudocode — all install commands must be copy-runnable |
| Complete hook scripts | Full shell script content in every hook task — no stubs |
| Complete agent definitions | Role + trigger + input + output + handoff in every sub-agent task |
| Zero placeholders in CLAUDE.md | All content derived from Phase 1 context; no `[YOUR VALUE HERE]` |
| Every task has verify | Exact verify command required in every task block |
| Unverified MCPs | Flag ⚠️ UNVERIFIED, demote to Tier 3 |

---

## 10. Reference Files

| File | Purpose | Read when |
|---|---|---|
| `references/catalog.md` | Static registry of MCPs, skills, hooks, sub-agents, permissions | Phase 1 (always — MUST-HAVE section); Phase 3 (relevant sections only) |
| `references/claudemd-patterns.md` | CLAUDE.md section templates, anti-patterns, scoring rubric, complete example | Phase 2 (scoring); Phase 4 (CLAUDE.md generation) |

---

## 11. Known Limitations (v1.0)

| Limitation | Impact | Future fix |
|---|---|---|
| GitHub MCP not always connected in claude.ai | Falls back to manual URL paste + raw.githubusercontent.com fetch | Improve fallback UX; prompt to connect GitHub MCP |
| Static catalog requires manual maintenance | New MCPs not in catalog missed unless live fetch used | Versioned catalog with release cadence; community contributions |
| No diff output for existing CLAUDE.md | User sees score + gaps but not a side-by-side diff | Add Phase 2 diff mode: show before/after sections |
| Hook scripts not validated pre-execution | A malformed hook script will fail silently | Add bash syntax check in the verify step |
| Sub-agent quality depends on context richness | Sparse projects produce generic agent definitions | Improve inference from README + code structure |
| No rollback mechanism | If a task fails mid-plan, partial state left behind | Add rollback task block at plan end |
| Tier 2 items have no execution gate | All Tier 2 tasks execute if user approves each one | Add a "skip all Tier 2" option at plan start |

---

## 12. Improvement Backlog

Ordered by priority:

### High
- [ ] **v1.1 — Context-aware CLAUDE.md output path**: Detect if `.claude/` exists in Claude Code mode → offer write directly to `.claude/CLAUDE.md` vs. `tasks/` staging
- [ ] **v1.1 — Diff mode for existing CLAUDE.md**: Show before/after sections side-by-side when score is 7–11 (patch mode)
- [ ] **v1.2 — Template repo delta mode**: When GitHub template repo has existing `.claude/` config, generate only the delta (gap analysis vs. baseline)

### Medium
- [ ] **v1.2 — Rollback task**: Add `TASK ROLLBACK` block at plan end that undoes all applied changes if needed
- [ ] **v1.2 — Catalog versioning**: Add `catalog_version` field to plan header; warn when catalog is >90 days old
- [ ] **v1.3 — Hook validation**: Run `bash -n` syntax check on generated hook scripts before embedding in plan
- [ ] **v1.3 — Plugin recommendations**: Add plugin catalog section (bundles of skills) alongside individual skill installs
- [ ] **v1.3 — Spectra / BDD integration**: Detect BDD lifecycle signals (feature files, spec-driven workflow) → recommend Spectra skill + appropriate sub-agents

### Low
- [ ] **v2.0 — Multi-project org mode**: Accept multiple repo URLs → generate a standardized org-wide baseline plan
- [ ] **v2.0 — Plan re-execution**: Detect an existing `PROJECT_INIT_PLAN.md` → offer to re-run skipping already-completed tasks
- [ ] **v2.0 — Community catalog contributions**: Accept PR-based additions to `references/catalog.md`

---

## 13. File Structure

```
project-init-advisor/
├── SKILL.md                          ← skill entry point + full workflow
└── references/
    ├── catalog.md                    ← static MCP/skill/hook/sub-agent registry
    └── claudemd-patterns.md          ← CLAUDE.md templates, rubric, examples
```

Packaged as: `project-init-advisor.skill` (zip, validated via `package_skill.py`)

---

## 14. Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-06 | Initial build: catalog-first, tiered recommendations, CLAUDE.md generation |
| 0.2 | 2025-06 | Added token governance, 5-search quota, MUST-HAVE catalog section |
| 0.3 | 2025-06 | Added hook recommendations (5 types), hook registration format |
| 0.4 | 2025-06 | Renamed to `project-init-advisor` |
| 1.0 | 2025-06 | Full redesign: dual-mode (claude.ai / Claude Code), PROJECT_INIT_PLAN.md as primary deliverable, approval-gated task execution model, Phase 0 environment detection |
