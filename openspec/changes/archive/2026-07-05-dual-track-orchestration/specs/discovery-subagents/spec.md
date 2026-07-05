## ADDED Requirements

### Requirement: ts-event-storming-facilitator is required to exit /ts-discover explore

`/ts-discover explore <id>` SHALL run `ts-event-storming-facilitator` and
SHALL NOT advance `idea.status` to `"exploring"` unless
`exploration_output.domain_events`, `.aggregates`, and `.bounded_contexts`
are all non-empty.

#### Scenario: facilitator output populates exploration_output

- **WHEN** `/ts-discover explore idea-NNN` runs and the facilitator returns a
  well-formed output contract
- **THEN** `idea-NNN.exploration_output` is written with `domain_events`,
  `commands`, `aggregates`, `bounded_contexts`, `acpl_pattern_group`, and
  `ubiquitous_language_terms`, and `idea-NNN.status` becomes `"exploring"`

#### Scenario: empty required fields block the transition

- **WHEN** the facilitator returns empty `domain_events`, `aggregates`, or
  `bounded_contexts`
- **THEN** `idea-NNN.status` stays `"idea"`, the missing fields are reported,
  and the facilitator is re-run — the command does NOT proceed to set
  `status = "exploring"`

### Requirement: ts-ddd-tactical-validator is required before /ts-discover decide build

`/ts-discover decide <id> build` SHALL require
`validation_output.ddd_validation` to exist with
`recommendation != "FAIL"`. If `validate` was skipped (no H-risk
assumptions), `decide build` SHALL invoke `ts-ddd-tactical-validator` (Mode
A) at decide-time before proceeding.

#### Scenario: validator runs during validate

- **WHEN** `/ts-discover validate <id>` runs
- **THEN** `ts-ddd-tactical-validator` (Mode A) always runs and writes
  `validation_output.ddd_validation`

#### Scenario: validator runs at decide-time if validate was skipped

- **WHEN** `/ts-discover decide <id> build` runs and
  `validation_output.ddd_validation` is absent
- **THEN** `ts-ddd-tactical-validator` (Mode A) runs now, before the build
  decision is finalized

#### Scenario: FAIL blocks the build decision

- **WHEN** `validation_output.ddd_validation.recommendation == "FAIL"`
- **THEN** `/ts-discover decide <id> build` STOPS, surfaces the violations,
  and suggests `keep-learning` or `reduce-scope` instead

### Requirement: exploration_output schema includes ubiquitous_language_terms

`idea.exploration_output` SHALL include a `ubiquitous_language_terms[]`
array, populated by `ts-event-storming-facilitator` and consumed by
`ts-ddd-tactical-validator`'s coverage calculation.

#### Scenario: schema includes the new field

- **WHEN** a developer reads `discovery-state.md`'s schema example
- **THEN** `exploration_output.ubiquitous_language_terms` appears alongside
  `domain_events`, `commands`, `aggregates`, `bounded_contexts`,
  `acpl_pattern_group`
