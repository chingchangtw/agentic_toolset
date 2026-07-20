## On First Use

Check if `.claude/commands/ts-iteration/` exists in the current project. If the directory is absent,
create the following 11 stub files using the Write tool before proceeding with the user's request:

**ts-iteration** (3 files):
- `.claude/commands/ts-iteration/start.md`
- `.claude/commands/ts-iteration/next.md`
- `.claude/commands/ts-iteration/close.md`

**ts-discover** (5 files):
- `.claude/commands/ts-discover/idea.md`
- `.claude/commands/ts-discover/explore.md`
- `.claude/commands/ts-discover/validate.md`
- `.claude/commands/ts-discover/decide.md`
- `.claude/commands/ts-discover/status.md`

**ts-project** (3 files):
- `.claude/commands/ts-project/plan.md`
- `.claude/commands/ts-project/status.md`
- `.claude/commands/ts-project/refine.md`

Each stub file SHALL use exactly this format — YAML frontmatter with a one-line
`description` (≤12 words, short form of Purpose, shown in `/help` and command pickers),
then the dispatch block, blank line, then a `Purpose:` line (≤150 words) describing
what that specific sub-command does:
```
---
description: <short-purpose>
---
You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.
Sub-command: /ts-discover:idea $ARGUMENTS

Purpose: <purpose>
```

Replace the sub-command line with the appropriate prefix/subcommand, and
`<short-purpose>` / `<purpose>` with the matching text below
(source of truth: `references/commands.md`):

**ts-iteration**
- **start** (`/ts-iteration:start <release>`)
  - short-purpose: Load a release's epics and queue them in dependency order
  - purpose: Loads a release's epics from plan.json,
    resolves dependency order via topological sort, and writes iteration.json with all
    epics queued. Surfaces unresolved cross-release dependencies for a human decision.
    Run once per release, after `/ts-project:plan --sync`.
- **next** (`/ts-iteration:next`)
  - short-purpose: Activate the next queued epic and drive it through delivery
  - purpose: Activates the next queued epic and calls
    ts-deliver-router to drive its Think→Ship spine. Sequential — only one epic active
    at a time. On completion, records mutation score and ship date into iteration.json.
    Run repeatedly to work through a release's epic queue.
- **close** (`/ts-iteration:close <release>`)
  - short-purpose: Close a release once its epic queue is fully drained
  - purpose: Closes a release once every epic is done
    or deferred. Writes a retrospective, carries deferred epics forward, and bumps the
    backlog's refined_count. Run after the epic queue is fully drained.

**ts-discover**
- **idea** (`/ts-discover:idea "<desc>"`)
  - short-purpose: Seed the Discovery backlog with one new candidate idea
  - purpose: Seeds the Discovery backlog with one new
    candidate (status=idea). The cheapest entry point for capturing a raw idea before
    any exploration work begins. Also used internally as feedback intake from
    ts-deliver-router.
- **explore** (`/ts-discover:explore <id>`)
  - short-purpose: Run event-storming and risk exploration on an idea
  - purpose: Runs Problem Understanding + Solution
    Exploration on an idea — event-storming to produce domain events/commands/aggregates,
    then a first-principles challenge to surface riskiest assumptions. WIP-limited to 3
    in-flight ideas. Moves the idea to status=exploring.
- **validate** (`/ts-discover:validate <id>`)
  - short-purpose: Pressure-test an idea's assumptions and DDD tactical soundness
  - purpose: Pressure-tests an idea's riskiest
    assumptions and DDD tactical soundness. Mandatory when any assumption is tagged
    H-risk; optional otherwise. Writes a feasibility verdict. Moves the idea to
    status=validating.
- **decide** (`/ts-discover:decide <id> [build|kill|keep-learning|reduce-scope]`)
  - short-purpose: Terminal decision point — build, kill, keep-learning, or reduce-scope
  - purpose: Terminal decision point for an idea — promote to ready-for-delivery, kill with a
    written ADR, loop back for more learning, or split into smaller ideas. `build`
    requires a passing DDD validation first.
- **status** (`/ts-discover:status`)
  - short-purpose: Kanban view of the Discovery backlog by stage
  - purpose: Kanban view of the Discovery backlog — counts and
    titles per stage (idea/exploring/validating/ready/killed/reduce-scope), WIP usage,
    and stale ideas flagged for a forced decision.

**ts-project**
- **plan** (`/ts-project:plan --new "<vision>"` or `--sync [release]`)
  - short-purpose: Seed a new project backlog, or sync ready ideas into a release
  - purpose: Two modes —
    `--new` seeds a fresh project's Discovery backlog from a vision interview; `--sync`
    pulls ready, unsynced Discovery ideas into plan.json as epics grouped into a release.
    Run `--new` once at project start, `--sync` whenever ideas reach ready.
- **status** (`/ts-project:status`)
  - short-purpose: Cross-iteration progress snapshot across releases and Discovery
  - purpose: Cross-iteration progress snapshot — releases and
    their state, total epics done vs. total, Discovery pipeline counts, open risks, and
    the most recent ADR.
- **refine** (`/ts-project:refine`)
  - short-purpose: Backlog maintenance after a release closes or scope changes
  - purpose: Backlog maintenance after a release closes or scope
    changes — reviews deferred epics and stale Discovery ideas, adds newly discovered
    epics, re-prioritizes releases, and updates the risk register.

If `.claude/commands/ts-iteration/` already exists, skip stub creation and proceed immediately.