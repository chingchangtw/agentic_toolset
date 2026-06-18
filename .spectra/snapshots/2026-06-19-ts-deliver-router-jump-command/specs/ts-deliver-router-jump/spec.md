# Spec: ts-deliver-router-jump

> Capability: `/ts-deliver:jump <phase>` command for the ts-deliver-router skill.
> Promoted from change: `ts-deliver-router-jump-command`

---

### Requirement: jump command SHALL accept a phase name and validate it

The `/ts-deliver:jump <phase>` command SHALL accept exactly one argument — a phase name — and validate it against the fixed 7-phase spine before proceeding.

Valid phase names (case-insensitive): `Think`, `Plan`, `Build`, `Review`, `Test`, `Ship`, `Reflect`.

#### Scenario: Invalid phase name is rejected

- **WHEN** the user invokes `/ts-deliver:jump <phase>` with a phase name not in the valid set
- **THEN** the router SHALL list the valid phase names and STOP without modifying state.json

#### Scenario: Same-phase jump is a no-op

- **WHEN** the user invokes `/ts-deliver:jump <phase>` where phase equals the current phase in state.json
- **THEN** the router SHALL show the current phase status and return without modifying state.json

---

### Requirement: forward jump SHALL replay gates in sequence

When the target phase is ahead of the current phase, the router SHALL replay every gate check between the current phase and the target phase in sequential order before writing state.json.

#### Scenario: All gates pass on a forward jump

- **WHEN** the user invokes `/ts-deliver:jump <phase>` with a target phase ahead of current
- **AND** all gate checks between current and target pass
- **THEN** the router SHALL write `current_phase: <target>` to state.json and display a gate replay summary showing each gate as ✓

#### Scenario: A gate is blocked on a forward jump

- **WHEN** the user invokes `/ts-deliver:jump <phase>` with a target phase ahead of current
- **AND** any gate check between current and target does not pass
- **THEN** the router SHALL report which gate blocked and what is missing, and SHALL NOT modify state.json (no partial advance)

##### Example: Blocked forward jump

| Condition | Expected Behavior |
| --------- | ----------------- |
| Current=Think, target=Build, G1 (Think→Plan) not signed | Report: "G1 blocked — checklist incomplete" · state.json unchanged |
| Current=Plan, target=Ship, G2 (Test→Ship) not signed | Report: "G2 blocked — human sign-off required" · state.json unchanged |

---

### Requirement: G1 and G2 SHALL remain non-bypassable during jump

The security gates G1 (end of Think) and G2 (start of Ship) SHALL require 100% checklist completion and explicit human sign-off during any forward jump, regardless of DIAL autonomy level. Jump does not loosen gate requirements.

#### Scenario: Jump cannot auto-sign G1 or G2

- **WHEN** a forward jump passes through G1 or G2
- **THEN** the router SHALL pause at that gate and require human sign-off before continuing the gate replay sequence
- **AND** HIGH autonomy SHALL NOT allow auto-sign at G1 or G2

---

### Requirement: backward jump SHALL be allowed without gate replay

When the target phase is behind the current phase, the router SHALL allow the jump without replaying any gates (re-entering an earlier phase is a valid rework or pivot action).

#### Scenario: Backward jump succeeds with a warning

- **WHEN** the user invokes `/ts-deliver:jump <phase>` with a target phase behind current
- **THEN** the router SHALL write `current_phase: <target>` to state.json
- **AND** display: "Jumping back to <phase>. Advancing forward again will require gate re-checks."

---

### Requirement: jump SHALL respect dry-run mode

When dry-run is active, the router SHALL describe the gate replay and the state.json write without executing either.

#### Scenario: Dry-run jump produces a report without side effects

- **WHEN** dry-run mode is ON and the user invokes `/ts-deliver:jump <phase>`
- **THEN** the router SHALL output a `[DRY-RUN]`-prefixed gate replay report
- **AND** SHALL NOT write to state.json
