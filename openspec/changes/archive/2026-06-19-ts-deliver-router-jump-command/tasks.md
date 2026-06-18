## 1. Document the jump command contract

- [x] 1.1 Add a `/ts-deliver jump` section to `src/skills/ts-deliver-router/references/commands.md` containing: syntax (`/ts-deliver jump <phase>`), valid phase list, forward-jump gate replay behavior, blocked-gate halt behavior, backward-jump allowance with warning, dry-run behavior, and state.json write contract. Verify: the section is present and covers all scenarios from the spec (invalid phase, same-phase, forward pass, forward blocked, backward, dry-run).
- [x] 1.2 Update the LOAD INDEX row in `src/skills/ts-deliver-router/SKILL.md` that references `references/commands.md` to include `/ts-deliver:jump` alongside the existing init/refine/status entries. Verify: the LOAD INDEX row reads "`/ts-deliver:init`, `/ts-deliver:refine`, `/ts-deliver:status`, `/ts-deliver:jump` command contracts".
- [x] 1.3 Update the Quick reference commands line in `src/skills/ts-deliver-router/SKILL.md` to include `/ts-deliver:jump`. Verify: quick reference line lists all four commands in colon syntax.

## 2. Register the slash command stub

- [x] 2.1 Create `.claude/commands/ts-deliver/jump.md` as a 2-line stub: line 1 loads SKILL.md, line 2 declares the sub-command with `$ARGUMENTS`. Verify: file exists, follows the same 2-line pattern as `init.md`/`refine.md`/`status.md`, and `$ARGUMENTS` is present so the phase name passes through.
