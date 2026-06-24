# Discovery Kanban — Stage Criteria, WIP, Stale Rule, Dedup

Operational reference for `/ts-discover` commands.

---

## Stage Definitions

### `idea`
**Entry:** `/ts-discover idea "<desc>"` or `/ts-discover idea --from-router`.
**Contains:** `title` only. All other fields empty/null/default.
**Exit:** `/ts-discover explore <id>` → `exploring` (subject to WIP limit).

### `exploring`
**Entry:** `/ts-discover explore <id>` ran successfully.
**Contains:** `exploration_output` populated (domain_events, commands, aggregates, bounded_contexts, acpl_pattern_group). `riskiest_assumptions[]` populated, each tagged `H`/`M`/`L`.
**Exit:**
- No `H`-risk → `/ts-discover decide <id> build` permitted directly (skips validating).
- Otherwise → `/ts-discover validate <id>` → `validating`.
- `/ts-discover decide <id> keep-learning` from `validating` returns here (`keep_learning_count++`).

**Counts toward WIP limit.**

### `validating`
**Entry:** `/ts-discover validate <id>` from `exploring`.
**Contains:** `validation_output` populated (feasibility, council_verdict, decision_rationale).
**Exit:** `/ts-discover decide <id> [build|kill|keep-learning|reduce-scope]`.
**Counts toward WIP limit.**

### `ready`
**Entry:** `/ts-discover decide <id> build` from `exploring` or `validating`.
**Contains:** `ready_epics[]` populated (≥1 epic id). `synced_to_plan=false` initially.
**Exit:** `/ts-project plan --sync` sets `synced_to_plan=true`. Entry stays `ready`.
**Does not count toward WIP.**

### `killed`
**Entry:** `/ts-discover decide <id> kill`.
**Contains:** Unchanged + `decision="kill"`. ADR written to `.ai/decisions/`.
**Exit:** None — terminal. Entry stays in `discovery.json`, never deleted.

### `reduce-scope`
**Entry:** `/ts-discover decide <id> reduce-scope`.
**Contains:** `notes` links forward to new split entries.
**Exit:** None — terminal. New entries (status=`idea`) go through full lifecycle independently.

---

## WIP Limit

```
WIP = count(ideas where status in {exploring, validating})
LIMIT = 3
```

Enforced at `exploring` entry point only. Returning from `keep-learning` does NOT re-check.

When blocked: `/ts-discover status` shows `WIP: 3/3` and occupying ideas.

---

## Stale Rule

```
STALE if keep_learning_count >= 3
```

Advisory only. `/ts-discover status` flags and suggests:
```
"idea-NNN is stale (3x keep-learning). Suggest:
  - Re-run /ts-discover validate with updated/narrower assumptions, or
  - Force a decision: /ts-discover decide idea-NNN [build|kill|reduce-scope]"
```
Human can ignore — counter keeps incrementing, flag stays visible.

---

## Dedup Algorithm (`--from-router` entries only)

User-invoked `/ts-discover idea "<desc>"` never dedupes.

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
   → No match. Create new entry per "/ts-discover idea --from-router" spec.
   → Return: { created: true, id: "idea-<NNN>" }
```

Worked example:
```
Existing: idea-007 "Tax API integration reliability"
  normalized: {tax, api, integration, reliability}

Incoming: "Tax API reliability concerns"
  normalized: {tax, api, reliability, concerns}

intersection = {tax, api, reliability} → size 3
union = {tax, api, integration, reliability, concerns} → size 5
similarity = 3/5 = 0.6 → > 0.5 → MATCH

Result: idea-007.notes += "duplicate feedback received from EPIC-GL-CORE on 2026-06-14"
```

Threshold 0.5: permissive toward merging — false positives cheaper than false negatives.

---

## Quick Reference

| Rule | Value | Enforced at |
|---|---|---|
| WIP limit | 3 (exploring+validating) | `/ts-discover explore` |
| Stale threshold | `keep_learning_count >= 3` | `/ts-discover status` (advisory) |
| Validation required | only if any `riskiest_assumptions[].risk == "H"` | `/ts-discover decide build` |
| Dedup threshold | Jaccard > 0.5 | `/ts-discover idea --from-router` only |
| Terminal states | `killed`, `reduce-scope` | — |
| Audit guarantee | no entry ever deleted | all commands |
