# Rename Map — `ts-` Prefix Family

Applies to all skills, commands, and sub-agents proposed across this design
series. Used as the single reference by both `ts-project-planner-prd.md` and
`ts-deliver-router-change-prd.md`.

---

## Skills

| Old | New |
|---|---|
| `lifecycle-router` | `ts-deliver-router` |
| `project-planner` | `ts-project-planner` |
| `ai-coding-pattern-language` (acpl) | `ts-acpl` |

## Sub-Agents

| Old | New |
|---|---|
| `event-storming-facilitator` | `ts-event-storming-facilitator` |
| `spec-validator` | `ts-spec-validator` |
| `ddd-tactical-validator` | `ts-ddd-tactical-validator` |
| `mutation-analyst` | `ts-mutation-analyst` |

## Commands

`router`-namespace commands stay `/ts-router *` — "router" is retained from
`ts-deliver-router` (the skill name still ends in `-router`); only the
descriptive prefix changed (`lifecycle` → `deliver`). No command renaming
follows from this change.

| Old | New |
|---|---|
| `/router init` | `/ts-router init` |
| `/router refine` | `/ts-router refine` |
| `/router status` | `/ts-router status` |
| `/router dry-run [on\|off]` | `/ts-router dry-run [on\|off]` |
| `/project plan` | `/ts-project plan` |
| `/project plan --sync` | `/ts-project plan --sync` |
| `/project plan --new` | `/ts-project plan --new` |
| `/project status` | `/ts-project status` |
| `/project refine` | `/ts-project refine` |
| `/iteration start <release>` | `/ts-iteration start <release>` |
| `/iteration next` | `/ts-iteration next` |
| `/iteration status` | `/ts-iteration status` |
| `/iteration close` | `/ts-iteration close` |
| `/discover idea "<desc>"` | `/ts-discover idea "<desc>"` |
| `/discover explore <id>` | `/ts-discover explore <id>` |
| `/discover validate <id>` | `/ts-discover validate <id>` |
| `/discover decide <id> [...]` | `/ts-discover decide <id> [...]` |
| `/discover status` | `/ts-discover status` |
| `/discover idea --from-router` | `/ts-discover idea --from-router` |

## Workspace Paths

| Old | New | Notes |
|---|---|---|
| `.ai/lifecycle-router/` | `.ai/ts-deliver-router/` | private state dir, renamed |
| `.ai/project-planner/` | `.ai/ts-project-planner/` | private state dir, renamed |
| `.ai/` (workspace root) | `.ai/` | **unchanged** — generic shared-workspace convention, not a skill name |
| `.ai/WORKSPACE.md` | `.ai/WORKSPACE.md` | **unchanged** — generic contract file |
| `.ai/domain.json` | `.ai/domain.json` | **unchanged** — shared artifact, not skill-named |
| `.ai/iteration.json` | `.ai/iteration.json` | **unchanged** |
| `.ai/risks.md` | `.ai/risks.md` | **unchanged** |
| `.ai/discovery.json` | `.ai/discovery.json` | **unchanged** (new artifact, see ts-project-planner PRD) |
| `.ai/decisions/` | `.ai/decisions/` | **unchanged** |

## Registry Tool IDs (inside `registry.json`)

Any `collection[].id` referencing a renamed sub-agent or skill must be updated:

| Old `id` | New `id` |
|---|---|
| `acpl` | `ts-acpl` |
| `event-storming-facilitator` | `ts-event-storming-facilitator` |
| `spec-validator` | `ts-spec-validator` |
| `ddd-tactical-validator` | `ts-ddd-tactical-validator` |
| `mutation-analyst` | `ts-mutation-analyst` |

## Out of Scope for Renaming

- External tools/MCPs (Semgrep, Trivy, Stryker, PITest, mutmut, GitHub MCP,
  Atlassian Rovo, Spectra, gstack, code-review-graph, Copilot, Gemini) — these
  are third-party names, not part of the `ts-` family.
- `.ai/` workspace root and all shared artifact filenames — generic convention,
  shared by any future skill regardless of prefix.
