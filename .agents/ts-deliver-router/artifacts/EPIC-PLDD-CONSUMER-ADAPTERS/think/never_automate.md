# Never-automate list — EPIC-PLDD-CONSUMER-ADAPTERS

Irreversible or high-blast-radius operations this epic must NOT run without an
explicit human step, even at DIAL=HIGH:

1. **Force-overwrite of `.agents/ts-deliver-router/registry.json` or `state.json`**
   without a prior snapshot+manifest entry. Dogfood install must write through the
   same manifest+rollback path as everything else — no direct file replace.
2. **Force-overwrite of `.claude/hooks/*`** — hooks execute on every session; a bad
   write breaks every future session's router state injection, not just this repo.
3. **Auto-signing G1/G2** for the dogfood-activation sub-deliverable. Router's hard
   safety rule already blocks this, restated here as project-specific: given this
   is the first time PLDD writes outside `src/*`, G1 sign-off is non-negotiable
   before Plan proceeds on activation.
4. **Deleting `.agents/ts-deliver-router/history.jsonl`** or any prior epic's
   archived state as part of rollback — rollback removes only what this epic's
   manifest added/changed, never pre-existing audit trail.
5. **Running dogfood install against `master` directly** — activation must happen
   on a branch, verified, before any merge decision.
