# registry-review — checks for the Review phase

Load with: registry/index.md

| id                  | type | trigger                    | skill/cmd               | block |
|---------------------|------|----------------------------|-------------------------|-------|
| staff-review        | gate | before leave review        | gstack:/review          | yes   |
| council-rev         | rec  | high-stakes/risky change   | council-advisor         | -     |
| xmodel-review       | rec  | risky module               | Copilot/Gemini          | -     |
| detect_changes      | rec  | any review                 | mcp:codebase-tools      | -     |
| get_review_context  | gate | any review                 | mcp:codebase-tools      | yes   |
| get_affected_flows  | rec  | any review                 | mcp:codebase-tools      | -     |
| code-review-deep    | rec  | deeper review before exit  | gstack:/code-review     | -     |
| security-review     | gate | before leave review        | gstack:/security-review | yes   |
| ts-ddd-tactical-validator | rec | domain model drift risk | references/sub-agents.md | - |
| github-pr-review    | rec  | when github-mcp active     | references/github-mcp.md (create_pull_request/create_review_comment) | - |
