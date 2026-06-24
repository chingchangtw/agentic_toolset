# registry-ship — checks for the Ship phase

Load with: registry/index.md

| id           | type | trigger                | skill/cmd                        | block |
|--------------|------|------------------------|----------------------------------|-------|
| sec-review   | gate | before release (G2)    | NAMED CHECKLIST (security-gates.md) | yes* |
| notes-tone   | rec  | external release notes | adaptive-communication-architect | -     |
| notes-polish | rec  | external release notes | business-english-enhancer        | -     |
| github-release | rec | when github-mcp active | references/github-mcp.md (merge_pull_request/create_release) | - |
