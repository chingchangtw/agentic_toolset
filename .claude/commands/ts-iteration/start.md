You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.
Sub-command: /ts-iteration:start $ARGUMENTS

Purpose: Loads a release's epics from plan.json, resolves dependency order via topological sort, and writes iteration.json with all epics queued. Surfaces unresolved cross-release dependencies for a human decision. Run once per release, after /ts-project:plan --sync.
