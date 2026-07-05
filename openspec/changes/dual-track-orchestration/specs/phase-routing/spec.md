## MODIFIED Requirements

### Requirement: getPhaseList supports 9 work types

`src/utils/phase-routing.ts`'s `getPhaseList()` SHALL accept
`'epic' | 'feature' | 'bugfix' | 'hotfix' | 'refactor' | 'chore' | 'patch' |
'spike' | 'ops'` and return the correct phase array for each. `'epic'` is
retained for existing `iteration.json` state (plan slices) but is no longer
an end-user-facing WORK_TYPE. `'poc'` is intentionally absent — PoC never
initializes a deliver spine.

#### Scenario: each new type returns its exact spine

- **WHEN** `getPhaseList(type)` is called for `feature`, `bugfix`, `hotfix`,
  `chore`, `patch`, `spike`, or `ops`
- **THEN** it returns, respectively:
  `['Think','Plan','Build','Review','Test','Ship']`,
  `['Think','Build','Ship']`, `['Think','Build','Ship']`,
  `['Build','Ship']`, `['Build','Test','Ship']`,
  `['Think','Build','Reflect']`, `['Think','Build','Review','Ship']`

#### Scenario: existing epic and refactor spines unchanged

- **WHEN** `getPhaseList('epic')` or `getPhaseList('refactor')` is called
- **THEN** the returned arrays are unchanged from before this change
