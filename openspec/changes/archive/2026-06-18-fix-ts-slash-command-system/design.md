## Context

The ts-* skills (`ts-deliver-router`, `ts-project-planner`) document internal command prefixes
(`/ts-router`, `/ts-iteration`, `/ts-discover`, `/ts-project`) in their SKILL.md files. These
prefixes have no Claude Code harness backing — they are prose conventions, not registered slash
commands. Additionally, `ts-deliver-router` uses prefix `/ts-router` which mismatches the skill
name `ts-deliver-router`. Muscle agents (Copilot CLI, Codex CLI, Antigravity CLI) also have no
version-controlled handoff layer from the orchestrator.

This is a source code / skill development project. Changes go to `src/skills/` and `openspec/`.
Direct edits to `.claude/commands/` or `.agents/` are out of scope — skill files are the artifact.

Claude Code slash commands live in `.claude/commands/<folder>/<cmd>.md` and are invoked as
`/folder:cmd`. Skills live in `.claude/skills/<name>/` and are invoked as `/name`. The two
mechanisms are separate; a SKILL.md does not create slash commands on its own.

## Goals / Non-Goals

**Goals:**

- Rename `/ts-router` → `/ts-deliver` in `src/skills/ts-deliver-router/` files only
- Add first-use initialization section to `src/skills/ts-deliver-router/SKILL.md`
- Add first-use initialization section to `src/skills/ts-project-planner/SKILL.md`
- Update SKILL.md architecture sections to show `:` invocation syntax
- Add optional agent scaffold extension to `src/skills/ts-deliver-router/` (SKILL.md + new reference file + commands.md + workspace.md)

**Non-Goals:**

- Do not rename skill directories or SKILL.md `name:` frontmatter fields
- Do not modify behavioral logic, phase spine, registry, or security gates beyond PRIMITIVE 3 extension field and conditional load
- Do not pre-create `.claude/commands/` stub files as part of this change
- Do not touch `.agents/` files
- Do not check `.agent/` runtime directories into the skill source repo

## Decisions

### First-use initialization pattern

Each SKILL.md gains an `## On First Use` section. When the model loads the skill and this section
is present, it checks whether the skill's command directory exists in `.claude/commands/`. If absent,
the model creates all stub files before proceeding with the user's request.

Detection signal:
- `ts-deliver-router`: check `.claude/commands/ts-deliver/` exists
- `ts-project-planner`: check `.claude/commands/ts-iteration/` exists

If the directory is missing, the model SHALL create the stub files using the Write tool, then continue.

Stub file format (two lines per file):
```
You are operating as the <skill-name> skill. Load and follow src/skills/<skill-name>/SKILL.md before proceeding.
Sub-command: /<prefix> <sub-command> $ARGUMENTS
```

Stub files `ts-deliver-router` creates:
- `.claude/commands/ts-deliver/init.md`
- `.claude/commands/ts-deliver/refine.md`
- `.claude/commands/ts-deliver/status.md`

Stub files `ts-project-planner` creates:
- `.claude/commands/ts-iteration/start.md`, `next.md`, `close.md`
- `.claude/commands/ts-discover/idea.md`, `explore.md`, `validate.md`, `decide.md`, `status.md`
- `.claude/commands/ts-project/plan.md`, `status.md`, `refine.md`

Rationale: Keeps `.claude/commands/` out of the skill source repo. Each project gets its stubs
auto-provisioned on first skill invocation. No manual setup required.

Alternative considered: pre-baking stub files in the repo. Rejected — couples the skill source repo
to a specific `.claude/` layout; breaks projects that use different harness configurations.

### Rename scope: `/ts-router` → `/ts-deliver`

Replace only the command prefix string `/ts-router` with `/ts-deliver`. Do NOT rename:
the skill name `ts-deliver-router`, directory paths, state path `.ai/ts-deliver-router/`, or
references to "router" as a concept.

Files in scope for rename:
- `src/skills/ts-deliver-router/SKILL.md`
- `src/skills/ts-deliver-router/references/commands.md`
- `src/skills/ts-project-planner/SKILL.md` (Layer 2 architecture line only)
- `src/skills/ts-project-planner/references/router-integration.md`

`.agents/` files: NOT in scope for this change.

### Agent scaffold: opt-in extension via reference file

Agent scaffold is opt-in. Users who have no muscle agents pay zero token cost. The extension
activates via one flag in `registry.json` and loads a single reference file on demand.

PRIMITIVE 3 in `src/skills/ts-deliver-router/SKILL.md` gains:
1. `"extensions": { "agent_scaffold": false }` added to the `registry.json` schema definition
2. One conditional load instruction: "If `extensions.agent_scaffold = true`, load `references/agent-scaffold.md` before executing any phase."

Total change to SKILL.md from agent scaffold: ~5 lines.

Opt-in trigger points (documented in `references/agent-scaffold.md`):
- `/ts-deliver init` interview asks "Muscle agents? (copilot / codex / antigravity / none)" — any named agent sets `agent_scaffold: true` and runs initial scaffold
- User edits `registry.json` manually — picked up on next invocation
- `/ts-deliver refine` detects new `type="agent"` entries in `collection[]` → prompts "Enable agent scaffold? Y/N"

Rationale: Inlining scaffold behavior as an unconditional PRIMITIVE was rejected — it would load
unconditionally, violating token discipline (add rigour, never add scope).

### `.agent/` directory contract

`.agent/` is a runtime project directory — orchestrator writes, muscle agents read. It is NOT
checked into the skill source repo. It mirrors the `.ai/` pattern: `.ai/` is shared AI state,
`.agent/` is shared muscle-agent contracts.

```
.agent/
  _registry.json
  copilot/
    AGENTS.md
    capabilities.md
  codex/
    AGENTS.md
    capabilities.md
```

Escalation invariant: muscle agents never make gate decisions. Any task tagged `BLOCK_EXIT` or
`ESCALATE` pauses and returns control to Claude Code before phase exit.

### commands directory not mirrored in .agents/

The `/ts-router` → `/ts-deliver` rename applies only to `src/skills/` files. `.agents/` mirrors
are out of scope for this change.

## Implementation Contract

**Behavior after implementation:**

- First invocation of ts-deliver-router in a new project: model detects missing `.claude/commands/ts-deliver/`, creates 3 stub files, then proceeds
- First invocation of ts-project-planner in a new project: model detects missing `.claude/commands/ts-iteration/`, creates 11 stub files, then proceeds
- Subsequent invocations: detection check passes (directory exists), no stub creation, immediate execution
- Zero occurrences of `/ts-router ` (with trailing space) in `src/skills/ts-deliver-router/` or `src/skills/ts-project-planner/`
- `/ts-deliver init` with named muscle agent: `registry.json` sets `agent_scaffold: true`, model loads `references/agent-scaffold.md`, generates `.agent/` directories
- `/ts-deliver init` with "none": `registry.json` keeps `agent_scaffold: false`, no `.agent/` generated
- `/ts-deliver refine` with new `type="agent"` entry: model prompts for scaffold enable

**Acceptance criteria:**

- `grep -r "/ts-router " src/skills/` returns no matches
- `src/skills/ts-deliver-router/SKILL.md` contains `## On First Use` section with detection + stub creation instructions
- `src/skills/ts-project-planner/SKILL.md` contains `## On First Use` section with detection + stub creation instructions
- `src/skills/ts-deliver-router/SKILL.md` PRIMITIVE 3 contains `extensions.agent_scaffold: false` field and conditional load instruction for `references/agent-scaffold.md`
- `src/skills/ts-deliver-router/references/agent-scaffold.md` exists and contains write rules, schemas, templates, and lifecycle events
- `src/skills/ts-deliver-router/references/workspace.md` documents `.agent/` directory

**Scope boundaries:**

- In scope: `src/skills/ts-deliver-router/SKILL.md`, `src/skills/ts-deliver-router/references/commands.md`, `src/skills/ts-deliver-router/references/agent-scaffold.md` (new), `src/skills/ts-deliver-router/references/workspace.md`, `src/skills/ts-project-planner/SKILL.md`, `src/skills/ts-project-planner/references/router-integration.md`
- Out of scope: `.agents/` files, `.claude/commands/` pre-baked files, `.agent/` runtime directories in this repo, `.spectra.yaml`, security gate logic

## Risks / Trade-offs

- [Risk] Model skips initialization check when context window is full → Mitigation: `## On First Use` section placed near top of SKILL.md, before behavioral content
- [Risk] User invokes skill in a project where `.claude/commands/ts-deliver/` already exists with different content → Mitigation: detection is presence-only; if directory exists, skip creation silently
- [Risk] `/ts-router` rename in `src/skills/` diverges from `.agents/` mirrors → Mitigation: accepted; `.agents/` is out of scope per project convention
- [Risk] Agent scaffold reference is large and always-loaded for muscle-agent users → Mitigation: reference is opt-in, loaded only when `agent_scaffold = true`; default projects pay zero cost
