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

Each stub file SHALL use exactly this two-line format:
```
You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.
Sub-command: /ts-iteration:start $ARGUMENTS
```

Replace the sub-command line with the appropriate prefix and subcommand for each file. Example for `ts-discover/idea.md`:
```
You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.
Sub-command: /ts-discover:idea $ARGUMENTS
```

If `.claude/commands/ts-iteration/` already exists, skip stub creation and proceed immediately.