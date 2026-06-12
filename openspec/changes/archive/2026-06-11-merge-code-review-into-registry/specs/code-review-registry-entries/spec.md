## ADDED Requirements

### Requirement: /code-review is registered in the Build phase registry

The lifecycle-router CHECK REGISTRY for the Build phase SHALL include a row for `/code-review` with type `always` and trigger `each change`, mapped to `gstack:/code-review`.

#### Scenario: Agent in Build phase consults registry

- **WHEN** an agent invokes the lifecycle-router during the Build phase
- **THEN** the registry surfaces `/code-review` as an always-on check to run after each code change

### Requirement: /simplify is registered in the Build phase registry

The lifecycle-router CHECK REGISTRY for the Build phase SHALL include a row for `/simplify` with type `rec` and trigger `after logical change unit`, mapped to `gstack:/simplify`.

#### Scenario: Agent in Build phase consults registry for recommendations

- **WHEN** an agent invokes the lifecycle-router during the Build phase
- **THEN** the registry surfaces `/simplify` as a recommended check after completing a logical unit of work

### Requirement: /code-review is registered in the Review phase registry

The lifecycle-router CHECK REGISTRY for the Review phase SHALL include a row for `/code-review` with type `rec` and trigger `deeper review before exit`, mapped to `gstack:/code-review`.

#### Scenario: Agent in Review phase consults registry

- **WHEN** an agent invokes the lifecycle-router during the Review phase
- **THEN** the registry surfaces `/code-review` as a recommended deeper review check before exiting the phase

### Requirement: /security-review is registered in the Review phase registry as a gate

The lifecycle-router CHECK REGISTRY for the Review phase SHALL include a row for `/security-review` with type `gate` (block=yes) and trigger `before leave review`, mapped to `gstack:/security-review`. This gate MUST be passed or signed off before the Review phase can exit.

#### Scenario: Agent attempts to exit Review phase without security-review

- **WHEN** an agent attempts to exit the Review phase
- **THEN** the router blocks exit until the `security-review` gate is `passed` or `signed_off`

#### Scenario: Agent completes security-review gate

- **WHEN** the `security-review` gate status is set to `passed` or `signed_off`
- **THEN** the router permits exit from the Review phase (assuming all other gates are also satisfied)
