## MODIFIED Requirements

### Requirement: Workflow Routing table covers 9 end-user work types, both tracks

`ts-orchestrate/SKILL.md`'s Workflow Routing table SHALL be keyed by the
end-user's work type (not epic type), and SHALL cover both the Discovery and
Delivery tracks. Each row's Route column SHALL name the active track inline
and walk its states one by one.

#### Scenario: 9 work types present

- **WHEN** a developer reads the Workflow Routing table
- **THEN** it contains exactly these work-type rows: Feature, Bugfix & Hotfix,
  Refactor, Chore & Tech debt, Patch, Spike, PoC, Ops/Infra, plus an Epic
  footnote (plan slice, not a work type)

#### Scenario: Feature routes through both tracks

- **WHEN** WORK_TYPE=FEATURE and no validated idea exists in `discovery.json`
- **THEN** the Route enters Discovery (`idea → explore → validate → decide
  build`) before entering Delivery's Think→Plan[G1]→Build→Review→Test→Ship spine

#### Scenario: PoC never reaches Delivery

- **WHEN** WORK_TYPE=POC
- **THEN** the Route stays entirely within Discovery
  (`idea → explore → validate → decide build/kill/reduce-scope`) and never
  initializes `ts-deliver-router/state.json`

### Requirement: Entry Gate exempts Discovery-entry work types

The Entry Gate (`active epic: none` block) SHALL apply only to Delivery-entry
work types. `WORK_TYPE=POC`, `WORK_TYPE=FEATURE` without a validated idea, and
all `/ts-discover *` commands SHALL be exempt.

#### Scenario: POC bypasses Entry Gate

- **WHEN** `iteration.json.active_epic` is null and `WORK_TYPE=POC`
- **THEN** `ts-orchestrate` does NOT emit `[BLOCKED] No active epic` and
  instead routes to `/ts-discover idea`
