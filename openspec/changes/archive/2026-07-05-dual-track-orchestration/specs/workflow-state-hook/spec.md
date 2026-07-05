## MODIFIED Requirements

### Requirement: Hook emits Discovery-branch NEXT guidance

When only `iteration.json` exists (Discovery mode), the hook SHALL additionally
read `.agents/discovery.json` and emit a `[NEXT]` line derived from the
highest-priority in-flight idea's status. Priority order: `validating >
exploring > idea > ready` (first match wins — one `[NEXT]` line only, per D11).

#### Scenario: focus idea is exploring

- **WHEN** `discovery.json` has an idea with `status: "exploring"` and no
  idea with `status: "validating"`
- **THEN** hook emits `[NEXT] Run /ts-discover validate <id> (required if
  H-risk) or /ts-discover decide <id> build`

#### Scenario: validating outranks exploring

- **WHEN** `discovery.json` has ideas with both `status: "exploring"` and
  `status: "validating"`
- **THEN** the `[NEXT]` line targets the `validating` idea's id, not the
  `exploring` one

#### Scenario: no discovery.json or empty ideas array

- **WHEN** `discovery.json` does not exist, or exists with an empty
  `ideas[]`
- **THEN** hook emits `[NEXT] Run /ts-discover idea "<desc>" or
  /ts-project:plan --new`

#### Scenario: malformed discovery.json does not crash the hook

- **WHEN** `discovery.json` contains invalid JSON
- **THEN** the `[WORKFLOW STATE] Discovery` line still prints (unaffected —
  it only reads `iteration.json`), and the `[NEXT]` line falls back to the
  seed-suggestion default; the hook does not error or produce no output at
  all
