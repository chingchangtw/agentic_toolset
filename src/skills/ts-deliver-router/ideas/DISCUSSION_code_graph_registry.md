# Discussion — code-review-graph integration & registry changes

Reference record of the design session exploring how to incorporate
code-review-graph's ideas into the ts-deliver-router flow, and the
registry changes that emerged.

---

## Starting point

Two ideas proposed by operator:

1. **Phase-branch/tag strategy** — add each phase/step into a branch or tag,
   independent from the project's main branch.
2. **Development-graph** — something like code-review-graph but for the
   development workflow itself, not just the codebase.

---

## Design analysis (Claude)

### Idea A: Phase-branch/tag strategy

**What it solves:** Reproducibility and rollback. `.ai/ts-deliver-router/state.json` is
truth but it's a single mutable file. A phase-tag gives a hard checkpoint
you can `git checkout` to reconstruct the entire working tree as it was when
that phase exited. Also gives Copilot/Gemini a clean isolation surface.

**Key tension:** Branches are cheap; branch discipline is not. If the
convention slips, the phase-branch truth diverges from state.json truth —
two competing truths. The hardening pass was explicitly about eliminating
competing truths.

**Design decision: tags only, no long-lived phase branches.**
A tag is immutable once written. Each phase exit: Copilot/Gemini commits all
artifacts + updated `state.json` → router creates tag
`lifecycle/<phase>/<cycle-id>`. Tag is the on-disk audit trail.
`state.json` remains the runtime truth.

**Scope judgment:** Not a new primitive — an extension of the Phase Exit
Contract and one new registry row. One new `state.json` field:
`"phase_tag": "lifecycle/plan/cycle-001"`.

---

### Idea B: Development-graph

**What it solves:** Same thing code-review-graph solves for code — context
efficiency and structural queryability — but for the lifecycle itself.

**Key tension:** code-review-graph works because tree-sitter has a well-defined
grammar for code. The development graph's schema exists (state.json + the
registry) but building the edges requires derivation logic — a full MCP server
is non-trivial.

**Design decision: derivable graph first, MCP server deferred.**
Extend `state.json` to make the graph derivable from the file. A lightweight
Copilot/Gemini muscle task derives a Mermaid diagram from state.json on demand.
80% of the value, zero new infrastructure. MCP server is explicit future scope.

---

### Scope discipline applied

Both ideas fit as *extensions to existing primitives*, not new primitives:
- No new phase.
- No long-lived phase branches.
- No MCP server for dev-graph yet.
- No new PRIMITIVE label.

---

## Landscape survey — what actually exists

Question asked: *"Is there any open source / plug-in / skills in place?"*

### For Idea A (phase-branch/tag)

**GCC — Git Context Controller** (`faugustdev/git-context-controller`)
- Structures agent memory as a persistent file system with explicit operations:
  COMMIT, BRANCH, MERGE, and CONTEXT.
- Enables milestone-based checkpointing, exploration of alternative plans,
  structured reflection.
- An *intra-session* memory management system — helps an agent organize its
  own working memory during a task.
- Ships as a Claude Code skill: `npx skills add faugustdev/git-context-controller`
- MIT licensed. SWE-Bench-Lite: 48% bug resolution (state of the art at publish).

**GNAP — Git-Native Agent Protocol** (`farol-team/gnap`)
- Coordinates AI agent teams through a shared git repo using four JSON files.
- Tasks live in `board/todo/`, agents claim them to `board/doing/`, commit
  results to `board/done/`. Git history is the coordination audit trail.
- No server, no database. Any agent that can git push can participate.
- MIT licensed.
- Validates the pattern (git as state store, history as audit log) but is
  task-board coordination, not lifecycle phase tracking.

**Lore** (arxiv 2603.15566)
- Encodes decision context into permanent project history via enriched commit
  messages so future agents benefit from it.
- GCC manages the agent's scratchpad; Lore manages the project's institutional
  memory. The two are complementary.
- About enriched commits, not phase tags — reinforces the same principle.

**Gap identified:** Nobody writes a git tag at *lifecycle phase exit*
specifically. Small, fillable inside the ts-deliver-router's phase exit contract.

---

### For Idea B (development-graph / code graph options)

**code-review-graph** (`tirth8205/code-review-graph`) — already in registry
- Builds a structural map of code with Tree-sitter, tracks changes
  incrementally, gives AI assistants precise context via MCP.
- When a file changes, traces every caller, dependent, and test affected
  ("blast radius").
- `pip install code-review-graph` / `code-review-graph install` auto-configures.

**better-code-review-graph** (`n24q02m/better-code-review-graph`)
- Fork of code-review-graph with critical bug fixes, configurable embeddings,
  production CI/CD.
- Fixes broken multi-word search and empty `callers_of` results.

**codegraph** (`Colby McHenry / codegraph`)
- Parses codebase using tree-sitter, indexes symbol relationships, call graphs,
  import chains, web routes into SQLite with full-text search.
- MCP server with 9 tools. ~35% lower cost, ~70% fewer tool calls on large repos.
- Semantic-versioning of the graph (roadmap): what does the graph look like at
  commit abc123 vs def456 — useful for code review agents reasoning about diffs.
- Solo/small-team sweet spot.

**Graphify** (YC-backed, 63k stars)
- Converts entire codebases into queryable knowledge graphs.
- Works across 20+ AI coding assistant platforms.
- Tree-sitter parsing locally, zero API calls.
- v0.8.35: Streamable HTTP transport for shared graph server, live PostgreSQL
  introspection.
- Team/shared-server sweet spot.

**Codebase-Memory** (arxiv 2603.27277)
- 83% answer quality vs 92% for file-exploration agent, at 10× fewer tokens
  and 2.1× fewer tool calls.
- 66 languages, 14 MCP tools, single statically linked C binary, zero runtime
  dependencies.
- Research-grade, most capable.

**Gap identified:** All four are *code* knowledge graphs. None graph the
*workflow/lifecycle* itself. Derivable-from-state.json is the proportionate
first step.

---

## Honest map

| Idea | What exists | Gap |
|---|---|---|
| Phase-level git tags as checkpoints | GCC (agent memory COMMIT/BRANCH), GNAP (task board in git) | Nobody writes a tag at lifecycle phase exit specifically. Small, fillable inside ts-deliver-router's exit contract. |
| Development-graph (query lifecycle state structurally) | codegraph, Graphify, code-review-graph, Codebase-Memory — all for *code* graphs | No tool graphs the workflow DAG itself. Novel. Derivable from state.json as a first step. |
| Replace code-review-graph in registry | codegraph or Graphify are stronger candidates today | Worth evaluating as a registry swap — both have wider language support and better token numbers. |

---

## Registry changes decided

Four additions. No existing rows edited. No spine changes.

### 1. `code-graph` — build, always (new)

```
| code-graph    | build   | always | session start / repo init  | <codegraph OR Graphify> (MCP)   | -     |
```

Separates repo-indexing (one-time setup) from per-change query (incr-review).
"Graph not built" surfaces as a missing check rather than a silent skip.
Placeholder filled per-project, same pattern as `<SAST tool>`.

### 2. `incr-review` — build, always (source reference updated, † )

```
| incr-review   | build   | always | each change                | code-graph MCP + review         | -     |
```

Behavior unchanged. Source updated from `code-review-graph` to `code-graph MCP`
(the new row above it).

### 3. `gcc-commit` — build, rec (new)

```
| gcc-commit    | build   | rec    | milestone reached          | GCC:COMMIT (faugustdev/git-context-controller) | - |
```

Agent memory checkpoint at significant Build milestones. `rec` — surfaced by
router, operator decides. Not a gate.

### 4. `phase-tag` — * (cross-cutting), gate (new)

```
| phase-tag     | *       | gate   | phase exit                 | git tag lifecycle/<phase>/<cycle-id> (Copilot) | yes |
```

Immutable git tag at every phase exit. Written by Copilot/Gemini after
`state.json` is atomically replaced. Blocks phase exit if tag write fails.

Tag naming: `lifecycle/<phase>/<cycle-id>`
Example: `lifecycle/plan/cycle-001`

state.json change (v1 → v2): new field `"phase_tag": "lifecycle/plan/cycle-001"`
written at every phase exit.

### 5. `dev-graph-snapshot` — reflect, rec (new)

```
| dev-graph-snapshot | reflect | rec | end of cycle | derive Mermaid from state.json (Copilot) | - |
```

Mermaid diagram of cycle derived from state.json: phase transitions,
gate results, ingest deltas, token cost per phase. Zero new infrastructure.
Feeds the retro. Future path: promote to dedicated MCP server if proven useful.

---

## Full registry with all changes

| id | phase | type | trigger | skill/cmd | block |
|---|---|---|---|---|---|
| threat-model | think | gate | before any spec (G1) | NAMED CHECKLIST (see G1) | yes* |
| design-review | plan | gate | before leave plan | council-advisor, /plan-eng-review | yes |
| xmodel-plan | plan | rec | before Build | Copilot/Gemini (/codex) | - |
| tdd | build | always | code change | superpowers:TDD | - |
| **code-graph** | **build** | **always** | **session start / repo init** | **`<codegraph OR Graphify>` (MCP)** | **-** |
| incr-review † | build | always | each change | code-graph MCP + review | - |
| sast | build | always | code change | `<SAST tool>` | - |
| dep-scan | build | always | dependency change | `<dep/secrets scanner>` | - |
| coverage | build | gate | before leave build | coverage >= `<X>%` | yes |
| mutation | build | rec | high-risk module | `<mutation tool>` | - |
| **gcc-commit** | **build** | **rec** | **milestone reached** | **GCC:COMMIT (faugustdev/git-context-controller)** | **-** |
| staff-review | review | gate | before leave review | gstack:/review | yes |
| xmodel-review | review | rec | risky module | Copilot/Gemini | - |
| acceptance | test | gate | before leave test | run Given/When/Then (BDD) | yes |
| integration-qa | test | gate | before leave test | integration suite | yes |
| e2e-qa | test | rec | user-facing change | e2e suite | - |
| perf-qa | test | rec | perf-sensitive change | load/perf test | - |
| sec-review | ship | gate | before release (G2) | NAMED CHECKLIST (see G2) | yes* |
| **dev-graph-snapshot** | **reflect** | **rec** | **end of cycle** | **derive Mermaid from state.json (Copilot)** | **-** |
| retro | reflect | always | end of cycle | gstack:/retro, /learn | - |
| **phase-tag** | **\*** | **gate** | **phase exit** | **git tag lifecycle/\<phase\>/\<cycle-id\> (Copilot)** | **yes** |

Bold = new. † = source reference updated, behavior unchanged.
\* security/destructive gate — pauses for human even in HIGH; HIGH never auto-signs.
\* on phase-tag — cross-cutting, fires at every phase exit.

---

## Open questions (unresolved, carry forward)

**Q1 — codegraph vs Graphify for `code-graph` row?**
- Solo/small-team → codegraph (simpler, SQLite-only).
- Team sharing one server → Graphify (HTTP transport, shared graph).
- Fill placeholder when wiring a real project.

**Q2 — `phase-tag` as `gate` or `always`?**
Currently `gate` (hard block on tag write failure). Alternative: `always`
with warning for environments where git push is unavailable (detached HEAD,
CI without push rights). Decide per-project when wiring.

**Q3 — `dev-graph-snapshot` in Reflect only, or also after Review?**
A snapshot after Review would show which ingest deltas were triggered by
review findings. Currently Reflect-only. Revisit after first cycle completes.

---

## Source references

| Tool | Repo / URL | License | Install |
|---|---|---|---|
| codegraph | github.com/ColbyMcHenry/codegraph | MIT | MCP server config |
| Graphify | augmentcode.com/learn/graphify-63k-stars | OSS | MCP server config |
| GCC | github.com/faugustdev/git-context-controller | MIT | `npx skills add faugustdev/git-context-controller` |
| GNAP | github.com/farol-team/gnap | MIT | 4 JSON files in repo |
| code-review-graph | github.com/tirth8205/code-review-graph | — | `pip install code-review-graph` |
| better-code-review-graph | glama.ai/mcp/servers/w1z9fju964 | MIT | MCP server config |
| Codebase-Memory | arxiv.org/abs/2603.27277 | OSS | C binary / MCP |

---

## Status

Design record only. Changes are **not active** until merged into
`SKILL.md` + `SKILL_caveman.md` in the same session, after open questions
Q1–Q3 are resolved.

Previous design records: `Ideas.md` (ts-deliver-router design session).
Previous registry export: `REGISTRY_CHANGES.md`.
