# goverance_CLAUDE.md — Project Governance & Registries

The heavier material the project brief intentionally omits to stay under 150 lines.

**See also**
- `.claude/CLAUDE.md` — universal behaviour, anti-slop guardrail, core principles, communication style, mandatory prompt rule.
- `../CLAUDE.md` — stack, commands, architecture, file structure, project-scoped hard rules.

This file is advisory (~70% adherence). For 100% enforcement, encode the rule in `.claude/hooks/` or a CI check.

## Definition of Done
A task is complete when:
- The stated requirement is satisfied.
- Assumptions are written down.
- Impacted areas are checked (callers, shared utilities, configs, migrations).
- Obvious edge cases are considered.
- Tests are added or updated when behaviour changes.
- Documentation is updated when public behaviour changes.
- Type-check, lint, and tests all pass.
- Verification was actually run — not asserted.

## Release Readiness Gates
- [ ] All tests pass on CI.
- [ ] No new dependencies without justification.
- [ ] No `.env` or secrets in the diff.
- [ ] Migration plan documented (if schema or contract changed).
- [ ] Rollback plan documented (if deploy-affecting).
- [ ] CHANGELOG / release notes updated.
- [ ] Public API contract reviewed (if applicable).
- [ ] Security review pass (if touching authn / authz / crypto / input parsing).

## Implementation Workflow
1. Restate the goal in one sentence.
2. List impacted files and modules.
3. Note assumptions, risks, and conflicts with current conventions.
4. Propose the smallest safe implementation path.
5. Implement with minimal diffs.
6. Self-review against the Definition of Done.
7. Suggest follow-up improvements only after the main task is complete.

## Elegance Check Gate
For non-trivial changes, pause and ask: "Is there a more elegant way?" before committing.
If a fix feels hacky, rewrite it knowing what you now know.
Skip for simple, obvious fixes — do not over-engineer.

## Path-Scoped Rules Registry
Each `.claude/rules/<name>.md` loads only when files matching its glob are in context.

| File              | Glob                  | Purpose                                     |
|-------------------|-----------------------|---------------------------------------------|
| `api.md`          | `src/api/**`          | API-route conventions, contract checks      |
| `migrations.md`   | `db/migrations/**`    | Migration safety, idempotency, rollback     |
| `<add>`           | `<glob>`              | `<purpose>`                                 |

## Hooks Registry
Hooks are deterministic — they fire every time and override prose guidance.

| Hook              | When                | Purpose                                              |
|-------------------|---------------------|------------------------------------------------------|
| `SessionStart.sh` | Session start       | Load project context, print branch + dirty state     |
| `PostToolUse.sh`  | After any tool use  | Auto-format, auto-commit with normalised message     |
| `PreCompact.sh`   | Before compaction   | Persist state to `tasks/checkpoint.md`               |

## Skills Registry
Skills are model-invokable, load on demand. List only what exists in `.claude/skills/`.

| Skill                     | Trigger                | Purpose                                          |
|---------------------------|------------------------|--------------------------------------------------|
| `code-standards`          | writing/reviewing code | Prefer/avoid lists for code quality              |
| `implementation-workflow` | non-trivial task       | 4-step plan → implement → verify → follow-ups    |
| `done-check`              | wrapping up            | Run the Definition of Done before declaring done |
| `elegance-check`          | non-trivial change     | Pause and rewrite if a fix feels hacky           |
| `lessons-loop`            | after a correction     | Append entry to lessons file                     |
| `<add>`                   | `<trigger>`            | `<purpose>`                                      |

## Agents Registry
Agents are subagents with isolated context windows. List only what exists in `.claude/agents/`.

| Agent                | Role                       | Inputs       | Outputs                       |
|----------------------|----------------------------|--------------|-------------------------------|
| `code-reviewer.md`   | Review diffs               | Diff range   | Summary, blockers, nits       |
| `researcher.md`      | Web fetch + synthesis      | Question     | Cited summary                 |
| `log-analyzer.md`    | Parse errors / crash logs  | Log file     | Root-cause hypothesis         |
| `<add>`              | `<role>`                   | `<inputs>`   | `<outputs>`                   |

## Suggested Agent Roles (invoke on demand)
- **Requirements Clarifier** — turn vague asks into testable acceptance criteria.
- **Solution Designer** — propose 2–3 approaches with tradeoffs before implementation.
- **Refactor Reviewer** — check blast radius and convention conformance.
- **Test Writer** — encode WHY (intent), not just WHAT (behaviour).
- **Security Reviewer** — secrets, injection, authz, deserialisation, supply chain.
- **API Contract Checker** — diff public surface; flag breaking changes.
- **Documentation Maintainer** — update docs when public behaviour changes.
- **Release Readiness Reviewer** — run the Release Readiness gates above before sign-off.

## Self-Reflection Cadence
After each non-trivial task, silently evaluate:
- Did I answer the actual requirement?
- Did I modify more files than necessary?
- Did I preserve current architecture and conventions?
- What was unclear and should be clarified earlier next time?
- What pattern or utility should be extracted for reuse?

Append durable lessons to `.ai/LESSONS_LEARNED.md` under one of:
- **Mistake** — what went wrong.
- **Signal missed** — what should have been a stop-sign.
- **Better rule** — a one-line rule for `.claude/CLAUDE.md` or `../CLAUDE.md`.
- **Reusable pattern** — a snippet, helper, or skill worth extracting.

Review the lessons file at session start for the relevant project.
