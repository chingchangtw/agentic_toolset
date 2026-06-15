# registry-test — checks for the Test phase

Load with: registry/index.md

| id             | type | trigger                    | skill/cmd                                   | block |
|----------------|------|----------------------------|---------------------------------------------|-------|
| acceptance     | gate | before leave test          | run Given/When/Then (Spectra BDD)           | yes   |
| integration-qa | gate | before leave test          | integration suite                           | yes   |
| e2e-qa         | rec  | user-facing change         | e2e suite                                   | -     |
| perf-qa        | rec  | perf-sensitive change      | load/perf (addyosmani/agent-skills)         | -     |
| a11y-audit     | rec  | user-facing/public product | addyosmani/agent-skills:accessibility-audit | -     |
| query_graph    | rec  | dependency/flow analysis   | mcp:codebase-tools                          | -     |
| ts-mutation-analyst | rec | mutation survivors require mapping | references/sub-agents.md | - |
| ts-acpl        | rec  | scenario-to-pattern mismatch | references/acpl-integration.md              | -     |
| github-test-status | rec | when github-mcp active | references/github-mcp.md (update_pull_request_review) | - |
