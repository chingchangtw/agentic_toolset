# AI Coding Pattern Language (ACPL)

A skill that bridges **Problem Frame specs → AI-generated code → Mutation Testing**.

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | Full skill — canonical reference |
| `SKILL_caveman.md` | Token-optimized variant (~60% tokens) |
| `references/patterns.md` | 20-pattern catalogue with code templates |
| `references/problem-frame-map.md` | PF domain → pattern decision tree |
| `references/mutation-guide.md` | Stryker / PITest / mutmut setup + CI |

## Pattern Groups

- **G1 Guard/Boundary** — kill boundary-value mutants
- **G2 Pure Logic** — kill conditional and deletion mutants
- **G3 State** — kill state-variable mutants
- **G4 Seams** — kill method-call removal mutants
- **G5 Output Contract** — kill return-value mutants

## 8 Core Generation Rules

1. Inject deps — never `new` inside logic
2. Guards first — happy path never nested
3. Named predicates — no inline boolean soup
4. Explicit state — no boolean flags for phases
5. Typed Result — never swallow exceptions
6. Contract comment per public function
7. Side effects outermost only
8. Named constants — no bare literals

## Mutation Score Targets (ts-deliver-router integration)

Build ≥60% → Review ≥75% → Test ≥85% → Ship ≥85% (CI break <50%)

## Pilot Context

Designed around the Atlassian administrator productivity tool pilot:
bulk REST API executor + browser automation recorder/replayer.
See `references/problem-frame-map.md` → *Commanded Behaviour — Bulk REST API Execution*.
