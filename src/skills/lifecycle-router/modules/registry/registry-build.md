# registry-build — checks for the Build phase

Load with: registry/index.md

| id           | type   | trigger                | skill/cmd                               | block |
|--------------|--------|------------------------|-----------------------------------------|-------|
| tdd          | always | code change            | superpowers:test-driven-development     | -     |
| subagent-dev | rec    | parallelizable work    | superpowers:subagent-driven-development | -     |
| incr-review  | always | each change            | code-review-graph + review              | -     |
| sast         | always | code change            | <SAST tool>                             | -     |
| dep-scan     | always | dependency change      | <dep/secrets scanner>                   | -     |
| ts-tooling   | rec    | TypeScript stack       | mattpocock/skills                       | -     |
| fe-tooling   | rec    | frontend stack         | addyosmani/agent-skills                 | -     |
| coverage     | gate   | before leave build     | coverage >= <X>%                        | yes   |
| mutation     | rec    | high-risk module       | <mutation tool>                         | -     |
