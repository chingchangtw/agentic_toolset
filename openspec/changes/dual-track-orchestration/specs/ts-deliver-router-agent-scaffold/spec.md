## MODIFIED Requirements

### Requirement: sub-agents.md documents shipped status per agent

`src/skills/ts-deliver-router/references/sub-agents.md` SHALL mark agents #1
(`ts-event-storming-facilitator`) and #3 (`ts-ddd-tactical-validator`) as
shipped — packaged from `src/agents/`, installed automatically via the
release manifest's `agents[]` category — superseding the prior
"documented build spec, build manually via `.claude/agents/<id>.md`"
guidance for those two agents specifically.

#### Scenario: shipped agents documented

- **WHEN** a developer reads `sub-agents.md` sections 1 and 3
- **THEN** each begins with a `> **Status: shipped.**` line pointing at
  `src/agents/` as the source and noting no manual build is needed

#### Scenario: unshipped agents unaffected

- **WHEN** a developer reads `sub-agents.md` sections 2
  (`ts-spec-validator`) and 4 (`ts-mutation-analyst`)
- **THEN** no status line is added — they remain manual-build-only, as
  before this change (explicit Non-Goal)
