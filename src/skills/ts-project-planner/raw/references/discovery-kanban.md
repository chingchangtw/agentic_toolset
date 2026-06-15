# Discovery Kanban — Stage Criteria, WIP, Stale Rule, Dedup

Operational reference for `/ts-discover` commands. Defines entry/exit criteria
per stage, the WIP limit, the stale rule, and the dedup algorithm for
`--from-router` feedback entries.

---

## Stage Definitions

### `idea`

**Entry:** Created via `/ts-discover idea "<desc>"` (user-invoked, or via
`/ts-project plan --new` seeding) or `/ts-discover idea --from-router`
(feedback intake).

**Contains:** `title` only. All other fields empty/null/default.

**Exit:** `/ts-discover explore <id>` → `exploring` (subject to WIP limit).

---

### `exploring`

**Entry:** `/ts-discover explore <id>` ran successfully.

**Contains:** `exploration_output` populated (`domain_events`, `commands`,
`aggregates`, `bounded_contexts`, `acpl_pattern_group`).
`riskiest_assumptions[]` populated, each tagged `H`/`M`/`L`.

**Exit:**
- If `riskiest_assumptions` contains no `H`-risk item →
  `/ts-discover decide <id> build` is permitted directly (skips `validating`).
- Otherwise → `/ts-discover validate <id>` → `validating`.
- `/ts-discover decide <id> keep-learning` from `validating` returns here
  (`keep_learning_count++`).

**Counts toward WIP limit.**

---

### `validating`

**Entry:** `/ts-discover validate <id>` ran successfully from `exploring`.

**Contains:** `validation_output` populated (`feasibility`,
`council_verdict`, `decision_rationale`).

**Exit:** `/ts-discover decide <id> [build|kill|keep-learning|reduce-scope]`.

**Counts toward WIP limit.**

---

### `ready`

**Entry:** `/ts-discover decide <id> build` from `exploring` or `validating`.

**Contains:** `ready_epics[]` populated (≥1 epic id). `synced_to_plan=false`
initially.

**Exit:** `/ts-project plan --sync` sets `synced_to_plan=true`. Entry remains
`ready` (not removed) — `synced_to_plan` is the forward-progress marker.

**Does not count toward WIP** — `ready` items are "done" from Discovery's
perspective.

---

### `killed`

**Entry:** `/ts-discover decide <id> kill` from `exploring` or `validating`.

**Contains:** Unchanged from prior stage, plus `decision="kill"`. An ADR is
written to `.ai/decisions/` documenting the rationale.

**Exit:** None — terminal state. Entry remains in `discovery.json` for audit;
never deleted.

---

### `reduce-scope`

**Entry:** `/ts-discover decide <id> reduce-scope` from `exploring` or
`validating`.

**Contains:** `notes` links forward to the new split entries
(e.g. `"split into idea-001a, idea-001b"`).

**Exit:** None — terminal state for the original entry. The new entries
(status=`idea`) are independent backlog items that go through the full
lifecycle.

---

## WIP Limit

```
WIP = count(ideas where status in {exploring, validating})
LIMIT = 3
```

Enforced at the `exploring` entry point only (`/ts-discover explore <id>`).
An idea returning from `keep-learning` (validating → exploring) does NOT
re-check the limit — it was already counted.

**Rationale:** keeps Discovery focused. For a solo developer or small team, 3
concurrent in-flight investigations is a practical ceiling — enough to avoid
idle time waiting on one slow validation, not so many that nothing finishes.

**When blocked:** `/ts-discover status` shows current WIP (e.g. `WIP: 3/3`)
and which ideas are occupying the slots. Resolve one (via `decide`) before
exploring a new one.

---

## Stale Rule

```
STALE if keep_learning_count >= 3
```

**Detection:** `/ts-discover status` checks this on every call and flags
matching entries.

**Effect:** Advisory only — does not block any command. The flag is a nudge:
"this idea has been re-explored 3 times without a build/kill decision;
something about the framing may be wrong, or the team may be avoiding a hard
call."

**Resolution suggested by router:**
```
"idea-NNN is stale (3x keep-learning). Suggest:
  - Re-run /ts-discover validate with updated/narrower assumptions, or
  - Force a decision: /ts-discover decide idea-NNN [build|kill|reduce-scope]"
```

A human can ignore the flag and run `keep-learning` again — the counter keeps
incrementing, and the flag stays visible. There is no hard cap.

---

## Dedup Algorithm (for `--from-router` entries)

Applied only to entries created via `/ts-discover idea --from-router`.
User-invoked `/ts-discover idea "<desc>"` never dedupes (the human is assumed
to know whether this is a new idea).

### Steps

```
1. Normalize incoming description:
   - lowercase
   - strip punctuation (.,;:!?'"()[]{})
   - collapse whitespace
   - tokenize on whitespace → set of words

2. For each existing entry (any status), normalize its title the same way
   → set of words

3. Compute Jaccard similarity:
   similarity = |intersection| / |union|

4. If similarity > 0.5 for any existing entry:
   → MATCH. Do not create new entry.
   → Append to matched entry.notes:
     "duplicate feedback received from <source_epic> on <ISO date>"
   → Return: { created: false, matched_id: "<id>" }

5. Else:
   → No match. Create new entry as specified in
     "/ts-discover idea --from-router" command spec.
   → Return: { created: true, id: "idea-<NNN>" }
```

### Worked Example

```
Existing entry: idea-007, title = "Tax API integration reliability"
  normalized: {tax, api, integration, reliability}

Incoming (--from-router): description = "Tax API reliability concerns"
  normalized: {tax, api, reliability, concerns}

intersection = {tax, api, reliability}        → size 3
union        = {tax, api, integration,
                 reliability, concerns}        → size 5

similarity = 3/5 = 0.6  → > 0.5 → MATCH

Result: idea-007.notes += "duplicate feedback received from EPIC-GL-CORE
on 2026-06-14"
No new entry created.
```

### Threshold Rationale

`0.5` (majority word overlap) is deliberately permissive toward merging —
false positives (two genuinely different ideas merge) are cheaper to recover
from (the merged note is visible in `/ts-discover status`, and a human can
manually split via `reduce-scope` if needed) than false negatives (duplicate
entries silently accumulate and fragment the signal).

---

## Quick Reference

| Rule | Value | Enforced at |
|---|---|---|
| WIP limit | 3 (exploring+validating) | `/ts-discover explore` |
| Stale threshold | `keep_learning_count >= 3` | `/ts-discover status` (advisory) |
| Validation required | only if any `riskiest_assumptions[].risk == "H"` | `/ts-discover decide build` |
| Dedup similarity threshold | Jaccard > 0.5 | `/ts-discover idea --from-router` only |
| Terminal states | `killed`, `reduce-scope` | — |
| Audit guarantee | no entry ever deleted | all commands |
