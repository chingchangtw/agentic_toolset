## Integration with ts-deliver-router

### How ts-project-planner pre-fills /ts-deliver init
`/ts-iteration next` passes to `/ts-deliver init`:
```
type:               <from epic.type in iteration.json>
domain_file:        .agents/domain.json
risks_file:         .agents/risks.md
acpl_pattern_group: <from domain.json, or from the originating discovery idea's
                      exploration_output if the epic came from --sync>
phase_activation:   <derived from type — see Work Unit Types table>
branch_name:        <feat|refactor|fix>/<epic-title-slug>
```
ts-deliver-router skips own interview for pre-filled fields.
### How ts-deliver-router writes back to shared zone
ts-deliver-router ONLY writes in `iteration.json`:
```
epics[active_epic].status        = "done"
epics[active_epic].branch        = "<branch name>"
epics[active_epic].mutation_score = <number>
epics[active_epic].shipped_at    = "<ISO>"
active_epic                      = null
```
Never writes to `plan.json` or `retrospectives/`.
### Discovery feedback hook contract (discovery.json)
ts-deliver-router APPEND-ONLY access to `discovery.json` — new entries via `/ts-discover idea --from-router` with `source_epic` set (dedup-checked).

MUST NOT modify on any existing entry:
```
status, decision, ready_epics, synced_to_plan, keep_learning_count,
exploration_output, validation_output, notes (except via the dedup
append path, which this skill's command performs — not ts-deliver-router
directly)
```
Single point of decision authority: only `/ts-discover decide` (human-invoked) can move idea to `ready`/`killed`/`reduce-scope`.
### G1 gate enrichment
ts-deliver-router reads `.agents/risks.md` at Review G1 — open risks surfaced in STRIDE checklist. Also surfaces (advisory, non-blocking) any `discovery.json` entry with `source_epic` = active epic and `status` not in `{ready, killed}`.
