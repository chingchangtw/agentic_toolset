## ADDED Requirements

### Requirement: ts-project-planner/SKILL.md includes Layer 1 workflow routing table
`src/skills/ts-project-planner/SKILL.md` SHALL have a `## Workflow Routing` section appended, containing a table mapping starting point + size to the correct skill invocation sequence.

#### Scenario: routing table covers all 5 starting-point scenarios
- **WHEN** a developer reads ts-project-planner/SKILL.md
- **THEN** the Workflow Routing table contains rows for: new idea, idea-in-discovery (small), idea-in-discovery (medium/large), active epic, and epic complete

##### Example: routing table rows
| Starting point | Size | Activate |
|---|---|---|
| New idea | Any | /ts-discover:idea |
| Idea in Discovery | Small (bugfix/tweak) | /ts-discover:decide build → /ts-iteration:next → /ts-deliver:init --scope lean |
| Idea in Discovery | Medium/Large | /ts-discover:explore → validate → decide → /ts-project:plan --sync → /ts-iteration:start → /ts-iteration:next |
| Active epic | Any | /ts-deliver:status → /ts-deliver:refine (follow phase spine) |
| Epic complete | Any | /ts-iteration:next (or /ts-iteration:close if last) → /ts-discover:status |

### Requirement: routing table includes two HARD RULEs
The `## Workflow Routing` section SHALL include both hard rules as literal text:

#### Scenario: hard rules present in routing table section
- **WHEN** a developer reads the Workflow Routing section of ts-project-planner/SKILL.md
- **THEN** the section contains exactly these two lines:
  - `HARD RULE: Never start /ts-deliver:init without an epic in iteration.json.active_epic.`
  - `HARD RULE: Never mark epic done without G1 + G2 human sign-off.`
