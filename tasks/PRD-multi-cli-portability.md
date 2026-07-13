# PRD — Multi-CLI Portability: Codex CLI + Copilot CLI Targets

| | |
|---|---|
| Status | PROPOSED — review, answer OQs, then split into openspec changes |
| Target repo | `agenticToolset` (build pipeline + installers + deliverable adapters) |
| Audience | Tony (approve/cut/answer OQs) + Sonnet-class sessions (execute) |
| Governing constraint | **Author once, compile per target.** `src/` stays the single canonical source; no per-CLI forks of skill content. All additions = build-pipeline compilers, installer flags, adapter files, conformance fixtures. |
| Format rule | Every requirement in this PRD declares one `enforcement` class (`cmd` / `schema` / `checklist` / `template`) per the Sonnet-runnability rule (PLDD §3.1). A rule without one is a defect. |

---

## 1. WHY (problem statement)

1. **Single-runtime lock-in.** Everything this repo ships is consumed through Claude Code
   surfaces: `SKILL.md` dispatch, `.claude/` install paths, UserPromptSubmit hooks,
   `settings.json` permissions, agent frontmatter. A team member on Codex CLI or GitHub
   Copilot CLI gets nothing from `release.zip`.
2. **The valuable 80% is already portable.** The methodology payload — phase spines,
   registries, reference MDs, `.agents/` state files (plain JSON + Markdown) — has zero
   Claude dependency. Only the *delivery wrapper* (~20%) is Claude-specific. Portability is
   a compilation problem, not a rewrite.
3. **Interop convention exists now.** Both Codex CLI and Copilot CLI read `AGENTS.md`-style
   repo instruction files and both speak MCP. There is a stable-enough common denominator
   to target without per-CLI heroics.
4. **Weak-model economics (house rule).** Future sessions executing this are Sonnet-class.
   Every step below must be a recipe with a red/green check, not a judgement call.

**Core thesis:** keep one canonical authoring format (today's skill/hook/command source in
`src/`), add per-target *compilers* to the existing manifest-driven build, and define an
honest **degradation ladder** — each CLI gets the strongest integration its surfaces
support, and what it loses relative to Claude Code is documented, never silently faked.

---

## 2. North star and non-goals

**North star:** `npm run release` emits install bundles for three targets; an end user on
any of the three CLIs runs one installer command and gets the ts- workflow (orchestration
skills, workflow state, scaffold) at the strongest fidelity tier that CLI supports, with a
conformance check proving what landed.

**Non-goals (protect scope):**
- NG1: No behavior-parity promise. Hook-enforced behaviors (auto-injected `[WORKFLOW STATE]`,
  session guard) degrade to instruction-protocol on CLIs without hooks. Documented, not
  emulated with daemons/wrappers.
- NG2: No MCP server in v1. One MCP server serving skills/state to all three CLIs is the
  architecturally prettier unification — deferred, not rejected (§9). File compilation
  rides the existing pipeline; MCP is a new runtime to build, test, and support.
- NG3: No new CLIs beyond Codex + Copilot (no Gemini CLI, no Cursor) in v1. The adapter
  contract (F1) must make adding one later a data change, not a design change.
- NG4: Claude Code remains Tier A / reference target. No Claude feature is removed or
  weakened to achieve symmetry.
- NG5: Skill *content* is not rewritten for other models. Same reference MDs everywhere;
  only dispatch/packaging differs.

---

## 3. Design model

### 3.1 Degradation ladder (the one design idea)

| Tier | Target | Integration surfaces | What works | What degrades |
|---|---|---|---|---|
| A | Claude Code | skills, hooks, slash commands, subagents, settings | Everything (today) | — |
| B | Codex CLI | `AGENTS.md` (hierarchical), custom prompts, MCP client, config.toml | Workflow skills as instruction modules + `/prompt` entry points; `.agents/` state fully readable | No prompt-turn hook → state read is protocol-driven (F3); no subagent registry → agent cards become role-prompt templates |
| C | Copilot CLI | `AGENTS.md` / `.github/copilot-instructions.md`, path-scoped instructions, MCP client | Workflow instructions + state protocol; scaffold | Same as B, plus no custom slash-prompt surface assumed until R0 probe proves otherwise |

Tier assignments are hypotheses until **R0 verifies them against live CLIs** — CLI extension
surfaces change fast; this PRD deliberately does not hard-code API details that may be
stale. R0's capability matrix is the source of truth from then on.

### 3.2 What exists vs. gap (grounding — do not rebuild)

| Exists today | Gap this PRD fills |
|---|---|
| Manifest-driven build (`generate-manifest.mjs` → `build-release.mjs` → `release.zip`) | Per-target compile step + `targets` field in manifest entries (F2) |
| Installers `install.sh` / `install.ps1` → `.claude/` paths | `--cli claude\|codex\|copilot` flag + per-CLI dest map + per-CLI version marker (F4) |
| `inject-workflow-state.sh` hook (Claude-only state surface) | Portable state-access protocol block compiled into Tier B/C instructions (F3) |
| `.agents/` runtime state — already CLI-neutral JSON/MD | Nothing. This is the moat; do not touch. |
| Managed-block generator precedent (`generate-gitignore-block.mjs`, `# BEGIN dogfood-mirror`) | Same pattern for `AGENTS.md` managed section (F2/F4) |
| `run-scenario.sh` TAP harness + install-parity check in CI | Per-target bundle conformance checks (F5) |
| Skill dual-file convention (SKILL.md + SKILL_caveman.md) | Compiler consumes SKILL.md only; caveman twin stays Claude-side (checklist row in F2) |

### 3.3 Deliverable inventory (what ships)

```
scripts/lib/targets.mjs              NEW — target registry: dest paths, surface map, per-CLI emit rules
scripts/compile-target.mjs           NEW — canonical src → per-target bundle dir (called by build-release)
scripts/probe-cli-surfaces.md        NEW — R0 manual probe checklist (living doc, versioned)
src/targets/codex/                   NEW — Codex-only static adapters (entry AGENTS.md section template, prompt stubs)
src/targets/copilot/                 NEW — Copilot-only static adapters (copilot-instructions section template)
release/install.sh|.ps1              MODIFIED — --cli flag, dest map, version markers
docs/cli-capability-matrix.md        NEW — R0 output; per-surface support table with probe dates
USER_GUIDE.md                        MODIFIED — per-CLI quickstart sections
```

---

## 4. Features

---

### F1 — Capability Matrix + Adapter Contract

**WHY:** every later feature keys off "what can this CLI actually host." Guessing = building
on sand; CLI docs drift. One verified matrix, re-probed on version bumps, is the contract.

#### Requirement: capability matrix is probed, not assumed
`docs/cli-capability-matrix.md` SHALL record, per CLI × surface (instruction files, custom
prompts/commands, hooks, subagents, MCP, config/permissions), the support status
(`full` / `partial` / `none`), the CLI version probed, and the probe date.
Enforcement: `checklist` — every cell filled, no `TBD`; matrix has a probe-date column.

#### Scenario: matrix drives the compiler
- **WHEN** `compile-target.mjs` runs for a target
- **THEN** it emits only surfaces the matrix marks `full`/`partial` for that CLI, and prints a skipped-surface summary for `none` rows

#### Requirement: adapter contract is data, not code forks
`scripts/lib/targets.mjs` SHALL define each target as a data record: `{ id, destRoot,
instructionFile, promptDir?, supportsHooks, supportsAgents, versionMarkerPath }`. Adding a
future CLI SHALL require only a new record + static adapter dir, no changes to compiler
control flow. Enforcement: `cmd` — a vitest test constructs a fake fourth target record and
asserts the compiler produces a bundle for it without code modification.

**Cut-line:** cannot cut — F2–F5 all read this contract.

---

### F2 — Per-Target Compiler in Build Pipeline

**WHY:** the manifest already declares what ships; extending it with *where per target*
keeps single-source authoring and makes the whole feature a build-step change.

**Design:** `build-release.mjs` gains a compile phase. Per target:
- **Tier A (claude):** unchanged passthrough — current `release.zip` layout is the Tier A bundle.
- **Tier B/C:** for each manifest skill, emit an *instruction module*: SKILL.md body (frontmatter
  stripped, dispatch phrasing neutralized) + its `references/` copied verbatim. Assemble an
  `AGENTS.md` managed block (`<!-- BEGIN ts-toolset --> … <!-- END ts-toolset -->`, reusing the
  gitignore-block generator pattern) containing: toolset intro, state-access protocol (F3),
  skill index with relative paths. Emit prompt stubs into the target's prompt dir if the matrix
  supports custom prompts.

#### Requirement: one canonical source per artifact
No skill/hook/command content SHALL exist under `src/targets/`; that directory holds only
target-specific *adapters* (entry templates, prompt stubs ≤15 lines each that point into the
shared bundle). Enforcement: `cmd` — CI check fails if any file under `src/targets/` exceeds
15 non-blank lines or duplicates a heading found in `src/skills/**`.

#### Scenario: build emits three bundles
- **WHEN** `npm run release` completes
- **THEN** `dist/` contains `release.zip` (claude, unchanged name for installer back-compat) plus `release-codex.zip` and `release-copilot.zip`, each with a zip-root `manifest.json` carrying `releaseVersion` + `target`

#### Scenario: caveman twins stay Tier A
- **WHEN** the compiler processes a skill directory containing `SKILL_caveman.md`
- **THEN** the caveman file is included in the claude bundle only (checklist: grep the B/C bundles for `SKILL_caveman` → zero hits)

**Cut-line:** cutting F2 kills the PRD — it is the core. Partial cut: ship Codex only
(drop Copilot target record; nothing else changes — that is the adapter contract working).

---

### F3 — Portable State-Access Protocol (hook replacement)

**WHY:** Tier A gets `[WORKFLOW STATE]` injected every turn by hook. Tier B/C have no such
hook; without a replacement the orchestration skills are blind and the whole dual-track
method fails on those CLIs.

**Design:** a fixed instruction block (compiled into the AGENTS.md managed block) that
directs the model: at the start of every task and before any phase-advance decision, read
`.agents/ts-deliver-router/state.json` + `.agents/iteration.json` (+ `discovery.json` when
Discovery-routed) and restate the same one-line summary the hook would have injected —
same `[WORKFLOW STATE] …` format, same `[NEXT]` guidance table (transcribed from the hook's
guidance table; single source referenced, not forked — the block cites
`src/hook/inject-workflow-state.sh` as canonical and is regenerated from it at build time).

#### Requirement: protocol block is generated from the hook, not hand-written
The compiler SHALL derive the `[NEXT]` guidance lines in the protocol block from
`inject-workflow-state.sh`'s guidance table at build time, so hook and protocol cannot
drift. Enforcement: `cmd` — existing hook-SKILL lockstep test pattern extended: a vitest
test parses both and asserts phase→guidance parity.

#### Scenario: state summary parity
- **WHEN** the same `.agents/` fixture is read via the hook (Tier A) and via the protocol instructions (Tier B/C, simulated by running the block's steps manually in a fixture)
- **THEN** the `[WORKFLOW STATE]` line content is identical (fixture-diff check in CI, reusing run-scenario.sh fixtures)

#### Requirement: honest autonomy ceiling
Tier B/C documentation SHALL state that gate enforcement is instruction-level (not
hook/skill-enforced) and recommend `AUTONOMY=LOW|MID` on those CLIs; G1/G2 human sign-off
rule text ships verbatim in the instruction block. Enforcement: `checklist` — block contains
the two gate rules + autonomy recommendation (grep-countable strings).

**Cut-line:** cutting F3 downgrades B/C to "reference library only" (skills readable, no
orchestration). Legitimate minimal ship, but state protocol is the feature's soul — keep.

---

### F4 — Multi-Target Installer

**WHY:** one curl command per CLI is the product. Everything else is plumbing behind it.

**Design:** `install.sh` / `install.ps1` gain `--cli <target>` (env `CLI_TARGET` for pipe-to-bash;
default `claude` — full back-compat). Dest map from the target record: claude → `.claude/…`
(unchanged); codex/copilot → shared bundle dir (e.g. `.agents/toolset/` — OQ-3) + managed-block
merge into the repo's `AGENTS.md` / `.github/copilot-instructions.md` + prompt stubs into the
CLI's prompt dir when supported. Version marker per target (`.toolset-version.<target>`)
so mixed-CLI repos upgrade independently.

#### Scenario: managed block is idempotent
- **WHEN** the installer runs twice for the same target and version
- **THEN** `AGENTS.md` contains exactly one managed block, byte-identical after the second run (cmd: `verify-install.mjs` extended with a double-install assertion)

#### Scenario: default install is untouched
- **WHEN** the installer runs with no `--cli` flag
- **THEN** the result is byte-identical to today's claude install (existing install-parity check must stay green with zero fixture changes)

#### Scenario: user content outside the block survives
- **WHEN** the target repo already has an `AGENTS.md` with user content and the installer runs
- **THEN** user content is preserved above/below the managed block; only the block is written

**Cut-line:** without F4, bundles ship but install is manual unzip + README. Acceptable for
an R-slice checkpoint, not for release.

---

### F5 — Conformance Harness + Docs

**WHY:** "it installed" ≠ "the method works there." Conformance must be checkable by a weak
model from files; live-driving three CLIs in CI is not feasible in v1.

**Design — two rings:**
- **Ring 0 (CI, deterministic):** static bundle conformance — per target: zip structure matches
  target record, managed block parses, state-protocol block present, prompt stubs point at
  files that exist in the bundle, no Claude-only artifacts leaked (hooks/`settings.json`/
  caveman twins absent from B/C). Enforcement: `cmd` — new `scripts/tests/target-conformance.test.mjs`.
- **Ring 1 (manual, per release):** smoke checklist per CLI in `docs/cli-capability-matrix.md`
  appendix — install into scratch repo, open the CLI, verify skill index visible, state line
  produced, one `/prompt` (where supported) runs. Enforcement: `checklist` — release notes
  link the completed checklist; unchecked rows block the GitHub Release step in the runbook.

#### Scenario: leaked Claude artifact fails CI
- **WHEN** a future manifest edit routes a hook into the codex bundle
- **THEN** `target-conformance` test fails naming the file and the violated rule

Docs: USER_GUIDE.md gains a per-CLI quickstart (install command, what you get at that tier,
what you don't — degradation table verbatim from §3.1).

**Cut-line:** Ring 1 can shrink to Codex-only if Copilot probe (R0) shows weak surfaces;
Ring 0 is non-negotiable once F2 exists.

---

## 5. Rollout — thin slices, each one openspec change

| slice | change name | contains | depends on |
|---|---|---|---|
| R0 | `cli-capability-probe` | probe checklist run against live Codex + Copilot CLIs; `docs/cli-capability-matrix.md` committed; tier hypotheses confirmed/corrected; go/no-go per CLI | — |
| R1 | `target-registry-and-compiler` | F1 contract (`targets.mjs`) + F2 compiler + three-bundle build + Ring 0 conformance tests | R0 |
| R2 | `portable-state-protocol` | F3 generated block + parity test + autonomy-ceiling docs | R1 |
| R3 | `multi-target-installer` | F4 flags + managed-block merge + double-install idempotency + parity guard | R1 |
| R4 | `cli-conformance-and-docs` | F5 Ring 1 checklist + USER_GUIDE quickstarts + release runbook update | R2, R3 |

R0 is deliberately first and cheap: if a CLI's surfaces are too weak (e.g. Copilot has no
usable repo-instruction + prompt combo), its target is cut at R0 for the cost of one probe
session, not five slices.

---

## 6. Metrics

| metric | source | direction |
|---|---|---|
| Surfaces compiled per target ÷ surfaces marked `full`+`partial` in matrix | Ring 0 test output | = 100% |
| State-summary parity (hook vs protocol on shared fixtures) | F3 parity test | = identical (gate) |
| Install idempotency + claude back-compat | verify-install + install-parity CI | green (gate) |
| Ring 1 smoke checklist completion per release | matrix appendix | 100% rows before GH Release |
| Tier B/C adoption (installs by target, if telemetry ever exists) | n/a v1 | informational only |

---

## 7. Risks

| risk | mitigation |
|---|---|
| CLI surfaces change under us (both products move monthly) | Matrix has probe-date + CLI version; release runbook re-probes on CLI major versions; adapter contract isolates blast radius to one target record |
| Instruction-only gate enforcement gets ignored by non-Claude models | Honest autonomy ceiling (F3); degradation table in user docs; never claim parity |
| AGENTS.md merge conflicts with user's own content | Managed-block pattern (proven by dogfood gitignore block); user content never touched; idempotency test |
| Bundle divergence (fix lands in Claude skill, B/C forgets) | Single-source rule (F2 cmd check) + compiler regenerates everything from `src/` every build — there is no per-target content to forget |
| Scope creep into MCP server | NG2; §9 records the trigger for revisiting |
| Codex/Copilot ship their own skill formats later | Adapter contract = data record; new surface = new emit rule in one place |

---

## 8. Worked example — one skill through the pipeline

`ts-orchestrate` today: `SKILL.md` + `commands/{start,status,next}.md`, Claude-dispatched.

| step | claude (A) | codex (B) | copilot (C) |
|---|---|---|---|
| compile | passthrough into `skills/ts-orchestrate/` | body → `toolset/ts-orchestrate.md`; index row + state protocol in `AGENTS.md` block; `prompts/ts-orchestrate-start.md` stub (≤15 lines → points at module) | same module; index row in `copilot-instructions.md` block; prompt stub only if R0 matrix says supported |
| install | `.claude/skills/…` (unchanged) | bundle dir + managed block merge + `~/.codex/prompts/` stubs | bundle dir + `.github/copilot-instructions.md` block |
| session entry | `/ts-orchestrate:start …` | `/ts-orchestrate-start` custom prompt → reads module → follows F3 protocol | user types "start ts-orchestrate session" → instructions route via index |
| state each turn | hook injects `[WORKFLOW STATE]` | model reads state files per protocol, restates line | same as B |
| gates | skill+hook enforced, never auto-signed | instruction-enforced, autonomy ceiling MID | same as B, ceiling LOW–MID |

---

## 9. Deferred alternatives

- **MCP server as the unification layer** (skills/state served over MCP to all CLIs): the
  cleaner long-term architecture — one runtime, live state, real enforcement hooks possible.
  Deferred because it is a new server to build/version/support and v1's file compilation
  reuses 100% of existing pipeline. **Revisit trigger:** either (a) two Tier B/C conformance
  cycles show instruction-only state protocol failing in practice, or (b) a third CLI target
  is approved. Entry path: the F1 target record gains a `transport: mcp` variant.
- **Gemini CLI / Cursor targets:** NG3 for v1; each is one target record + probe when wanted.
- **Per-model content tuning** (rewriting skills for GPT/Copilot model families): rejected —
  violates single-source rule; F8-style feedback data would have to prove necessity first.

---

## 10. Open questions (recommended defaults — answer or override)

| # | question | recommendation & why |
|---|---|---|
| OQ-1 | Bundle shape: three zips vs one zip with `targets/` subdirs? | Three zips. Installer downloads only what it needs; GH Release assets stay listable; `release.zip` name keeps back-compat. |
| OQ-2 | Copilot CLI: target `AGENTS.md` or `.github/copilot-instructions.md` as primary? | Decide at R0 by probe. Bias: `AGENTS.md` if honored — one file serves Codex too. |
| OQ-3 | Shared bundle install dir for B/C: `.agents/toolset/` vs `docs/toolset/`? | `.agents/toolset/` — `.agents/` is already the toolset's workspace root; scaffolder owns seeding it. Gitignore stance decided at R3 (lean: commit it, it is content not state). |
| OQ-4 | Codex prompt stubs: one per slash command (start/status/next × N skills) or one per skill? | One per skill entry point only (start-level). Per-command explosion = maintenance tax; status/next reachable via protocol instructions. |
| OQ-5 | Autonomy ceiling on Tier B/C: hard-document LOW, or MID with warning? | MID with warning + G1/G2 verbatim rules. LOW makes the port useless for real work; the gates text is the actual control. |
| OQ-6 | R0 probe: manual session or scripted? | Manual with the versioned checklist (`probe-cli-surfaces.md`). Scripting against two moving CLIs is R-negative ROI today. |
| OQ-7 | Does `ts-project-scaffolder` scaffold differ per CLI? | v1: no — scaffold stays CLI-neutral (`.agents/`, docs, AGENTS.md seed). Claude-specific scaffold bits (`.claude/`) emit only for Tier A installs (one conditional in F4 dest map). |

---

## 11. What this PRD deliberately did NOT do

No implementation started; no repo files modified. Each R-slice converts to one openspec
change with scenarios drafted in §4. Intended next step after review: answer OQs, then
`/spectra-propose` R0 (`cli-capability-probe`) seeded from F1 + §5.
