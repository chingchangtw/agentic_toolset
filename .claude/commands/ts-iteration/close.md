---
description: Close a release once its epic queue is fully drained
---
You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.
Sub-command: /ts-iteration:close $ARGUMENTS

Purpose: Closes a release once every epic is done
or deferred. Writes a retrospective, carries deferred epics forward, and bumps the
backlog's refined_count. Run after the epic queue is fully drained.
