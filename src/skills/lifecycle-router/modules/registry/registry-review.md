# registry-review — checks for the Review phase

Load with: registry/index.md

| id            | type | trigger                  | skill/cmd       | block |
|---------------|------|--------------------------|-----------------|-------|
| staff-review  | gate | before leave review      | gstack:/review  | yes   |
| council-rev   | rec  | high-stakes/risky change | council-advisor | -     |
| xmodel-review | rec  | risky module             | Copilot/Gemini  | -     |
