# Risk Register — agenticToolset

Project-level risks. Seeded by /ts-project:plan --new on 2026-07-03; human adds/removes.

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-01 | Destructive merge: advisor/installer overwrites a user's hand-edited CLAUDE.md or AGENTS.md during scaffold copy | M | H | Protected-files policy (prompt once, never silent overwrite) — precedent exists in ts-project-scaffolder SKILL.md; make it a shared rule for any scaffold-writing path |
| R-02 | Two competing scaffold delivery paths (install.sh SCAFFOLD=y blind copy vs. advisor-driven copy/merge) drift or conflict | M | M | Single source of truth for scaffold-write behavior; installer path either delegates or is documented as bootstrap-only |
| R-03 | Scaffold agent-context files go stale vs. this repo's own evolving .claude/CLAUDE.md + goverance conventions | H | M | Dogfood-style parity check between src/project_root_structure/ and the repo's own .claude/ context files at release time |
| R-04 | Silent breakage on end-user machines from generated config (prior incident: bare python3 hook, fixed v0.1.5) | M | H | Installer regression checklist in memory + LESSONS_LEARNED; clean-HOME verification before release |
| R-05 | Skill package hygiene regressions (broken refs, orphans) recur as skills evolve — skill-validator misses prose/backtick refs | M | M | tasks/skill-validator-todo.md decision pending: restore custom validate-refs gate alongside skill-validator |
