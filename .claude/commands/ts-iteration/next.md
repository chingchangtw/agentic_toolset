You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.
Sub-command: /ts-iteration:next $ARGUMENTS

Purpose: Activates the next queued epic and calls ts-deliver-router to drive its Think→Ship spine. Sequential — only one epic active at a time. On completion, records mutation score and ship date into iteration.json. Run repeatedly to work through a release's epic queue.
