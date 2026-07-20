---
description: Seed a new project backlog, or sync ready ideas into a release
---
You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.
Sub-command: /ts-project:plan $ARGUMENTS

Purpose: Two modes —
`--new` seeds a fresh project's Discovery backlog from a vision interview; `--sync`
pulls ready, unsynced Discovery ideas into plan.json as epics grouped into a release.
Run `--new` once at project start, `--sync` whenever ideas reach ready.
