# registry-plan — checks for the Plan phase

Load with: registry/index.md

| id            | type | trigger                      | skill/cmd                                | block |
|---------------|------|------------------------------|------------------------------------------|-------|
| reverse-spec  | rec  | refactor entry only          | code-review-graph (map→reverse-spec)     | -     |
| brainstorm    | rec  | open solution space          | superpowers:brainstorming                | -     |
| write-plan    | rec  | before leave plan            | superpowers:writing-plans                | -     |
| design-review | gate | before leave plan            | council-advisor, gstack:/plan-eng-review | yes   |
| prompt-opt    | rec  | before delegating to muscle  | the-master-prompt-optimization-architect | -     |
| xmodel-plan   | rec  | before Build                 | gstack:/codex or Copilot/Gemini          | -     |
