## MODIFIED Requirements

### Requirement: Dogfood mirror includes agents

`scripts/dogfood.mjs`'s `mirrorTargets()` and its `--from-zip` branch SHALL
both include every `manifest.agents` (or `zipManifest.agents`) entry, mirrored
to `.claude/agents/<name>.md`, using the same `assertInsideClaude()` guard
already applied to skills and hooks.

#### Scenario: dogfood sync mirrors agents

- **WHEN** `npm run dogfood` runs with a manifest containing `agents[]`
- **THEN** `.claude/agents/ts-event-storming-facilitator.md` and
  `.claude/agents/ts-ddd-tactical-validator.md` exist after sync

#### Scenario: from-zip restore also mirrors agents

- **WHEN** `node scripts/dogfood.mjs --from-zip <path>` runs against a zip
  whose `manifest.json` contains `agents[]`
- **THEN** the same 2 files are restored into `.claude/agents/`

#### Scenario: old manifest without agents key does not break dogfood

- **WHEN** `manifest.agents` is absent (older zip/manifest, pre-this-change)
- **THEN** `mirrorTargets()` treats it as an empty array (`manifest.agents ??
  []`) — no agents synced, no error
