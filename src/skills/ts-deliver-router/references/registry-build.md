# registry-build — checks for the Build phase

Load with: registry/index.md

| id                    | type   | trigger                     | skill/cmd                               | block |
|-----------------------|--------|-----------------------------|-----------------------------------------|-------|
| tdd                   | always | code change                 | superpowers:test-driven-development     | -     |
| subagent-dev          | rec    | parallelizable work         | superpowers:subagent-driven-development | -     |
| incr-review           | always | each change                 | code-review-graph + review              | -     |
| sast                  | always | code change                 | <SAST tool>                             | -     |
| dep-scan              | always | dependency change           | <dep/secrets scanner>                   | -     |
| ts-tooling            | rec    | TypeScript stack            | mattpocock/skills                       | -     |
| fe-tooling            | rec    | frontend stack              | addyosmani/agent-skills                 | -     |
| coverage              | gate   | before leave build          | coverage >= <X>%                        | yes   |
| mutation              | rec    | high-risk module            | <mutation tool>                         | -     |
| semantic_search_nodes | rec    | symbol/concept lookup       | mcp:codebase-tools                      | -     |
| get_impact_radius     | rec    | before touching shared code | mcp:codebase-tools                      | -     |
| code-review           | always | each change                 | gstack:/code-review                     | -     |
| simplify              | rec    | after logical change unit   | gstack:/simplify                        | -     |
| ts-acpl               | rec    | domain-heavy implementation | references/acpl-integration.md          | -     |
| github-push           | rec    | when github-mcp active      | references/github-mcp.md (push_files)   | -     |
| cli-mutation-coverage | rec    | new CLI entrypoint script   | in-process runCli/isMainModule test (see pl-scope-guard.test.ts pattern) | -     |
