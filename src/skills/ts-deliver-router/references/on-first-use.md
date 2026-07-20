## On First Use 

Check if `.claude/commands/ts-deliver/` exists in the current project. 
If the directory is absent, create the following 3 stub files using the Write tool before proceeding with the user's request:

- `.claude/commands/ts-deliver/init.md`
- `.claude/commands/ts-deliver/refine.md`
- `.claude/commands/ts-deliver/status.md`

Each stub file SHALL use exactly this format — YAML frontmatter with a one-line
`description` (≤12 words, short form of Purpose, shown in `/help` and command pickers),
then the dispatch block, blank line, then a `Purpose:` line (≤150 words) describing
what that specific sub-command does:
```
---
description: <short-purpose>
---
You are operating as the ts-deliver-router skill. Load and follow src/skills/ts-deliver-router/SKILL.md before proceeding.
Sub-command: /ts-deliver:<subcommand> $ARGUMENTS

Purpose: <purpose>
```

Replace `<subcommand>` with `init`, `refine`, or `status` respectively, and
`<short-purpose>` / `<purpose>` with the matching text below
(source of truth: `references/commands.md`):

- **init**
  - short-purpose: Initialize project router state and registry (lifecycle stage, tool tiers, gate thresholds)
  - purpose: Initializes project router state and the project registry — sets lifecycle
    stage, active/optional/pending-setup tools, and gate thresholds. Asks whether muscle
    agents (Copilot / Codex / Antigravity / none) are in use and enables the `.agent/`
    scaffold if so. Run once per project before any phase work begins.
- **refine**
  - short-purpose: Update project registry from phase history and gate outcomes
  - purpose: Updates the project registry from phase history and gate outcomes —
    promote/demote tool tiers, adjust thresholds, update lifecycle stage. Also detects
    muscle agents missing a `.agent/<id>/` scaffold and offers to generate it. Run after
    a phase or epic completes to keep the registry current.
- **status**
  - short-purpose: Read-only summary of router state, active checks, and next gate
  - purpose: Read-only summary of router state — current phase, autonomy level, active
    checks, pending setup gaps, and the next gate. No state transition, no writes. Run
    anytime to check where an epic stands.

If `.claude/commands/ts-deliver/` already exists, skip stub creation and proceed immediately.