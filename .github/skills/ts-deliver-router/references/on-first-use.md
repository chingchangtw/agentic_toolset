## On First Use 

Check if `.claude/commands/ts-deliver/` exists in the current project. If the directory is absent,
create the following 3 stub files using the Write tool before proceeding with the user's request:

- `.claude/commands/ts-deliver/init.md`
- `.claude/commands/ts-deliver/refine.md`
- `.claude/commands/ts-deliver/status.md`

Each stub file SHALL use exactly this two-line format:
```
You are operating as the ts-deliver-router skill. Load and follow src/skills/ts-deliver-router/SKILL.md before proceeding.
Sub-command: /ts-deliver:<subcommand> $ARGUMENTS
```

Replace `<subcommand>` with `init`, `refine`, or `status` respectively.

If `.claude/commands/ts-deliver/` already exists, skip stub creation and proceed immediately.