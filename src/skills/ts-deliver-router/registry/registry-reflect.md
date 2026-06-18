# registry-reflect — checks for the Reflect phase

Load with: registry/index.md

| id            | type   | trigger                        | skill/cmd                              | block |
|---------------|--------|--------------------------------|----------------------------------------|-------|
| retro         | always | end of cycle                   | gstack:/retro, gstack:/learn           | -     |
| harvest-skill | rec    | retro yields a reusable pattern | skill-creator (ref: anthropics/skills) | -     |
