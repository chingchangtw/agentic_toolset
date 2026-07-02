# Phase Exit Contracts

Every phase exit MUST atomically write `.ai/ts-deliver-router/state.json` with the fields below.
If any required field is missing → router treats state as invalid on next read.

---

## Think → Plan

```json
{
  "phase": "plan",
  "updated_at": "<ISO>",
  "artifacts": {
    "problem_frame": "<classified frame: Commanded|Information|Workpiece|Transformation|Control>",
    "domain_vocabulary": "<file path or inline summary>",
    "acpl_pattern_group": "<G1|G2|G3|G4|G5 or combination>"
  },
  "exit_conditions": {
    "pf_classified": true,
    "vocabulary_defined": true,
    "no_code_written": true
  }
}
```

---

## Plan → Build

```json
{
  "phase": "build",
  "updated_at": "<ISO>",
  "artifacts": {
    "spec_dir": "spec/",
    "scenario_count": 0,
    "scenarios_min_schema_valid": true,
    "jira_synced": true
  },
  "exit_conditions": {
    "all_scenarios_given_when_then": true,
    "min_schema_gate_passed": true
  }
}
```

---

## Build → Review

```json
{
  "phase": "review",
  "updated_at": "<ISO>",
  "artifacts": {
    "implementation_files": [],
    "test_files": [],
    "semgrep_report": "<path>",
    "trivy_report": "<path>",
    "coverage_pct": 0
  },
  "exit_conditions": {
    "all_scenarios_implemented": true,
    "tdd_coverage_gate_passed": true,
    "sast_run": true,
    "dep_scan_run": true
  }
}
```

---

## Review → Test

```json
{
  "phase": "test",
  "updated_at": "<ISO>",
  "gates": {
    "G1": {
      "status": "passed",
      "signed_off_by": "<name>",
      "signed_off_at": "<ISO>",
      "semgrep_findings": 0,
      "trivy_secrets_findings": 0,
      "stride_items_flagged": [],
      "notes": ""
    }
  },
  "artifacts": {
    "code_review_report": "<path>"
  },
  "exit_conditions": {
    "G1_signed_off": true,
    "code_review_complete": true,
    "acpl_pattern_coverage_verified": true
  }
}
```

---

## Test → Ship

```json
{
  "phase": "ship",
  "updated_at": "<ISO>",
  "gates": {
    "G2": {
      "status": "passed",
      "signed_off_by": "<name>",
      "signed_off_at": "<ISO>",
      "mutation_tool": "stryker|pitest|mutmut",
      "mutation_score": 0,
      "mutation_threshold": 85,
      "scenarios_total": 0,
      "scenarios_passing": 0,
      "trivy_new_findings": 0,
      "notes": ""
    }
  },
  "artifacts": {
    "mutation_report": "<path>",
    "spectra_archive": "spec/archive/"
  },
  "exit_conditions": {
    "G2_signed_off": true,
    "scenarios_archived": true,
    "mutation_score_gte_threshold": true
  }
}
```

---

## Ship → Reflect

```json
{
  "phase": "reflect",
  "updated_at": "<ISO>",
  "artifacts": {
    "release_tag": "<tag>",
    "jira_issues_transitioned": true,
    "confluence_page_updated": true,
    "release_notes_url": "<url or null>"
  },
  "exit_conditions": {
    "release_tag_created": true,
    "jira_done": true,
    "confluence_updated": true
  }
}
```

---

## Reflect → Think (next cycle)

```json
{
  "phase": "think",
  "updated_at": "<ISO>",
  "artifacts": {
    "registry_refinement_count": 0,
    "lessons_captured": "<confluence page or file path>",
    "next_cycle_scope": "<brief description or null>"
  },
  "exit_conditions": {
    "registry_refined": true,
    "log_updated": true
  }
}
```

---

## Staleness Rule

A `state.json` is stale if **any declared artifact path has a filesystem `mtime`
newer than `state.json`'s own `mtime`**.

When stale:
- Router emits: `"state.json stale — <artifact> modified after last phase exit. Manual review required."`
- Router STOPS. Does not advance phase.
- Human must either re-run the phase exit write or manually update `state.json`.
