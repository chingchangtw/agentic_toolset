## Why

The lifecycle-router CHECK REGISTRY tables define what checks agents run per phase. Three built-in code-quality skills — `/code-review`, `/simplify`, and `/security-review` — are currently absent from these tables. Agents running the router have no signal to invoke them at the right phase, so quality checks are ad-hoc and inconsistent.

## What Changes

- `/code-review` added as `always` check in the Build phase (run on each change) and `rec` in the Review phase (deeper review before exit).
- `/simplify` added as `rec` in the Build phase (after each logical change unit).
- `/security-review` added as `gate` in the Review phase (blocks exit; required before ship).
- Registry rows added to `src/skills/lifecycle-router/modules/registry/registry-build.md` and `src/skills/lifecycle-router/modules/registry/registry-review.md`.

## Non-Goals

- Not changing the skills themselves (`/code-review`, `/simplify`, `/security-review`).
- Not adding these to Think, Plan, Test, Ship, or Reflect registries — they are code-change activities.
- Not changing the router spine, state schema, or security gates.

## Capabilities

### New Capabilities

- `code-review-registry-entries`: CHECK REGISTRY rows for `/code-review`, `/simplify`, and `/security-review` wired into Build and Review phase registry files.

### Modified Capabilities

(none)

## Impact

- Affected specs: `code-review-registry-entries` (new)
- Affected code:
  - Modified: `src/skills/lifecycle-router/modules/registry/registry-build.md`
  - Modified: `src/skills/lifecycle-router/modules/registry/registry-review.md`
  - New: none
  - Removed: none
