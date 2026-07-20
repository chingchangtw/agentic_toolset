# module: registry-lean (lean phase profile — bugfix work type)

Loaded when: epic type is `bugfix` and lean path is active.

## Lean Spine (bugfix)

3-phase spine — skips Plan, Review, Test:

1. **Think** — Spectra:discuss. Skills: council-advisor.
   Artifacts: framing, root-cause analysis.
   Exit: proceed to Build when root cause is clear.
   **G1 not required for bugfix lean path.**

2. **Build** — Spectra:apply. Always: tdd, sast.
   Artifact: fix implementation with test coverage.
   Exit: proceed to Ship when fix passes tests.

3. **Ship** — Spectra:archive.
   Artifacts: release_notes, merged.
   **G2 not required for bugfix lean path.**

## Skipped Phases

Plan, Review, Test are NOT run for bugfix epics. Phase history will not contain these phases.

## Gate Summary

| Gate | Required |
|---|---|
| G1 (threat-model) | No |
| G2 (sec-review) | No |

## Notes

- Use this profile when `iteration.json.epics[].type == "bugfix"`.
- Full 7-phase profile is in `phases.md`.
- Refactor and epic types use phases.md (G1 required for both; G2 required for epic).
