**This is the primary deliverable.** Generate the full plan file now.

### Output path
- **Claude Code mode**: write to `tasks/PROJECT_INIT_PLAN.md`

### File format — follow exactly

````markdown
# PROJECT INIT PLAN
Generated: {date}
Project: {name inferred from repo/directory}
Mode: claude.ai (GitHub: {url}) | Claude Code (local)
Source: catalog v{date} [+ live fetch: X/5 searches used]

---

## PROJECT PROFILE
- Type:     {inferred}
- Stack:    {inferred}
- Services: {inferred}
- Team:     {inferred}
- Repo:     {url or local path}

## CLAUDE.md STATUS
- Score: X/16
- Action: {new | patch | minor additions | no change}

---

## HOW TO EXECUTE THIS PLAN

### claude.ai users
1. Download this file
2. Open Claude Code in your project directory
3. Say: "Execute PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"

### Claude Code users (this file is already in tasks/)
Say: "Execute tasks/PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"

Each task will show:
  ▶ TASK N: [name]
  Action: [what will happen]
  Files affected: [list]
  Approve? (yes / skip / stop)

---

## TASKS

### TASK 1: Create .claude directory structure
**Type**: Setup
**Approval required**: yes
**Files**: .claude/, .claude/hooks/, .claude/agents/, tasks/
**Action**:
```bash
mkdir -p .claude/hooks .claude/agents .claude/skills tasks
```
**Verify**: `ls -la .claude/`

---

### TASK 2: Install MCP — {name}
**Type**: MCP Install
**Tier**: 1
**Approval required**: yes
**Why**: {1-sentence rationale tied to this project}
**Action**:
```bash
{exact install command}
```
**Env vars needed**: {list or "none"}
**Verify**: `claude mcp list`

---

[... one TASK block per Tier 1 MCP ...]

---

### TASK N: Install MCP — {name}  [TIER 2]
**Type**: MCP Install
**Tier**: 2
**Approval required**: yes
**Why**: {rationale}
**Action**:
```bash
{exact install command}
```

---

### TASK N: Create hook — {hook-name}.sh
**Type**: Hook
**Tier**: {1|2}
**Approval required**: yes
**Trigger**: {PreToolUse | PostToolUse | PreCompact | SessionStart}
**Matches**: {pattern}
**Why**: {rationale}
**Action**: Create file `.claude/hooks/{hook-name}.sh`:
```bash
{complete hook script content}
```
Then register in `.claude/settings.json`:
```json
{exact hook registration JSON snippet}
```
**Verify**: `cat .claude/hooks/{hook-name}.sh`

---

### TASK N: Create sub-agent — {agent-name}.md
**Type**: Sub-agent
**Tier**: {1|2}
**Approval required**: yes
**Why**: {rationale}
**Action**: Create file `.claude/agents/{agent-name}.md`:
```markdown
{complete agent definition}
```
**Verify**: `cat .claude/agents/{agent-name}.md`

---

### TASK N: Apply settings.json
**Type**: Config
**Approval required**: yes
**Why**: Consolidates all permissions and hook registrations from this plan
**Action**: Write `.claude/settings.json`:
```json
{complete merged settings.json — permissions + all hook registrations}
```
**Verify**: `cat .claude/settings.json`

---

### TASK N: Generate CLAUDE.md
**Type**: Config
**Approval required**: yes
**Why**: {new | replaces weak score X/16 | patches gaps in existing}
**Action**: Write `.claude/CLAUDE.md`:
```markdown
{complete project-specific CLAUDE.md content}
{derived from Phase 1 context — no unfilled placeholders}
{all sections from claudemd-patterns.md}
{references every Tier 1 MCP with usage guidance}
{sub-agent contracts for all Tier 1 agents}
{compaction strategy}
{100-180 lines}
```
**Verify**: `wc -l .claude/CLAUDE.md && head -20 .claude/CLAUDE.md`

---

### TASK N: Install skills
**Type**: Skills
**Approval required**: yes
**Action**:
```bash
{one npx install command per recommended skill}
```
**Verify**: `ls .claude/skills/`

---

### TASK FINAL: Verify full init
**Type**: Verification
**Approval required**: yes
**Action**:
```bash
claude /init
claude mcp list
ls -la .claude/
ls -la .claude/hooks/
ls -la .claude/agents/
```
**Expected**: All installed MCPs listed, all hook files present, CLAUDE.md readable.

---

## TIER 3 — CONSIDER LATER
{name} — {one-line rationale}
{name} — {one-line rationale}

## SKIPPED (already installed)
{list any MCPs/skills found in existing mcp.json that overlap with recommendations}
````