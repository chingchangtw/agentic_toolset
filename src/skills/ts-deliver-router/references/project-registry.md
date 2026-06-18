# reference: project-registry (project activation over phase templates)

Use this reference when a project needs tiered activation and thresholds per check.

## Purpose

The phase registry files in `modules/registry-<phase>.md` are the catalog of
possible checks. Project Registry defines which checks are active for one project and
what thresholds apply.

## Source-of-truth split

- Template catalog: `modules/registry-<phase>.md` (all possible checks)
- Project activation: `.ai/ts-deliver-router/registry.json` (active/optional/pending-setup/retired)
- Router behavior: consult phase template for available checks, then project registry for
  tier and threshold at runtime

This extends CHECKS REGISTRY. It does not introduce a fourth primitive.

## `.ai/ts-deliver-router/registry.json` minimum model

```json
{
  "project": "<name>",
  "lifecycle_stage": "early|active|stabilizing|maintenance",
  "collection": [
    {
      "id": "<check-id>",
      "phase": ["think|plan|build|review|test|ship|reflect"],
      "tier": "active|optional|pending-setup|retired",
      "gate": "G1|G2|null",
      "threshold": 85
    }
  ],
  "gates": {
    "G1": { "phase": "think", "required": ["<id>"], "sign_off": "human" },
    "G2": { "phase": "ship", "required": ["<id>"], "sign_off": "human" }
  }
}
```

## Tier meanings

| Tier | Effect |
|---|---|
| `active` | Router runs/surfaces for the mapped phase |
| `optional` | Router may surface as recommendation only |
| `pending-setup` | Router warns setup gap and points to `references/setup-gaps.md` |
| `retired` | Router excludes from active recommendations |

## Lifecycle stage defaults

| Stage | Typical defaults | Mutation target |
|---|---|---|
| `early` | core checks + light quality controls | 60 |
| `active` | core + semgrep/trivy/github-mcp/ACPL | 75 |
| `stabilizing` | all active + stricter quality gates | 85 |
| `maintenance` | review-heavy + stability enforcement | 90 |

## Setup-gap detection

Before routing each phase, check project `collection[]` entries relevant to that phase:

- if tier is `pending-setup`: warn and point to `references/setup-gaps.md`
- if gate-required item is pending-setup: require explicit operator decision before gate exit

## See also

- `references/registry-schema.md` for full field reference and registry.log example
