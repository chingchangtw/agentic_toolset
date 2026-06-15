# registry-think — checks for the Think phase

Load with: registry/index.md

| id            | type | trigger                      | skill/cmd                               | block |
|---------------|------|------------------------------|-----------------------------------------|-------|
| deep-research | rec  | broad/research-heavy problem | anthropics/skills:research              | -     |
| ux-research   | rec  | user-facing product          | addyosmani/agent-skills:ux-research     | -     |
| frame-hats    | rec  | ambiguous/multi-stakeholder  | six-thinking-hats-coach                 | -     |
| first-princ   | rec  | novel/contested problem      | first-principles-agent                  | -     |
| strat-fit     | rec  | portfolio/product scope      | tows-strategy-analyst                   | -     |
| ts-event-storming-facilitator | rec | domain model unclear | references/sub-agents.md | - |
| threat-model  | gate | before any spec (G1)         | NAMED CHECKLIST (security-gates.md)     | yes*  |
