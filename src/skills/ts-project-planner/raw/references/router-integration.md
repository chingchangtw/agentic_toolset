## Integration with ts-deliver-router

### How ts-project-planner pre-fills /ts-deliver init

When `/ts-iteration next` calls `/ts-deliver init`, it passes:

```
type:               <from epic.type in iteration.json>
domain_file:        .ai/domain.json
risks_file:         .ai/risks.md
acpl_pattern_group: <from domain.json, or from the originating discovery idea's
                      exploration_output if the epic came from --sync>
phase_activation:   <derived from type — see Work Unit Types table>
branch_name:        <feat|refactor|fix>/<epic-title-slug>
```

ts-deliver-router reads these to skip its own interview for fields already
known.

### How ts-deliver-router writes back to shared zone

ts-deliver-router ONLY writes these fields in `iteration.json`:
```
epics[active_epic].status        = "done"
epics[active_epic].branch        = "<branch name>"
epics[active_epic].mutation_score = <number>
epics[active_epic].shipped_at    = "<ISO>"
active_epic                      = null
```

It never writes to `plan.json` or `retrospectives/`.

### Discovery feedback hook contract (discovery.json)

ts-deliver-router has **append-only** access to `discovery.json`, restricted
to creating new entries via `/ts-discover idea --from-router` with
`source_epic` set (dedup-checked, per "Discovery State Machine" above).

ts-deliver-router MUST NOT modify, on any existing entry:
```
status, decision, ready_epics, synced_to_plan, keep_learning_count,
exploration_output, validation_output, notes (except via the dedup
append path, which this skill's command performs — not ts-deliver-router
directly)
```

This preserves a single point of decision authority over Discovery: only
`/ts-discover decide` (human-invoked, this skill) can move an idea to
`ready`/`killed`/`reduce-scope`.

### G1 gate enrichment

ts-deliver-router reads `.ai/risks.md` during Review G1. Any `open` risk
relevant to the current epic is surfaced in the STRIDE checklist
automatically. Separately, ts-deliver-router's G1 also surfaces (advisory,
non-blocking) any `discovery.json` entry with `source_epic` = the current
epic and `status` not in `{ready, killed}` — see ts-deliver-router's
"Discovery Feedback Hook" section.

