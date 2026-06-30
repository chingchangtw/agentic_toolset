## ADDED Requirements

### Requirement: getPhaseList maps epic type to ordered phase list
`src/utils/phase-routing.ts` SHALL export `getPhaseList(epicType: "bugfix" | "refactor" | "epic"): string[]` returning the ordered delivery phase sequence for the given work type.

#### Scenario: bugfix routes to lean 3-phase spine
- **WHEN** `getPhaseList("bugfix")` is called
- **THEN** returns `["Think", "Build", "Ship"]` (exactly 3 elements, in this order)

#### Scenario: refactor routes to 6-phase spine (no Test phase)
- **WHEN** `getPhaseList("refactor")` is called
- **THEN** returns `["Think", "Plan", "Build", "Review", "Ship", "Reflect"]` (exactly 6 elements)

#### Scenario: epic routes to full 7-phase spine
- **WHEN** `getPhaseList("epic")` is called
- **THEN** returns `["Think", "Plan", "Build", "Review", "Test", "Ship", "Reflect"]` (exactly 7 elements)

##### Example: all three types
| epicType | Expected array | Length |
|---|---|---|
| `"bugfix"` | `["Think","Build","Ship"]` | 3 |
| `"refactor"` | `["Think","Plan","Build","Review","Ship","Reflect"]` | 6 |
| `"epic"` | `["Think","Plan","Build","Review","Test","Ship","Reflect"]` | 7 |

### Requirement: phase-routing.test.ts covers all three epic types
`src/tests/unit/phase-routing.test.ts` SHALL contain exactly 3 Vitest test cases, one per epic type, asserting the exact array returned by `getPhaseList`.

#### Scenario: test file validates bugfix lean path
- **WHEN** `npm test` runs `phase-routing.test.ts`
- **THEN** the bugfix test asserts `getPhaseList("bugfix")` equals `["Think","Build","Ship"]` and passes

#### Scenario: test file validates epic full path
- **WHEN** `npm test` runs `phase-routing.test.ts`
- **THEN** the epic test asserts `getPhaseList("epic")` equals `["Think","Plan","Build","Review","Test","Ship","Reflect"]` and passes
