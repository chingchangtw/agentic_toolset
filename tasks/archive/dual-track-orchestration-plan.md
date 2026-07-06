# RUNBOOK — Dual-Track Orchestration (weak-model-executable)

> **Who executes this:** any Claude model (Haiku/Sonnet/Opus). All design judgment is
> already encoded below. Your job is transcription, anchored editing, and running the
> verify commands. **Do not redesign. Do not re-open decisions in §0.**
>
> **Prepared by:** Fable 5 session, 2026-07-05. Every path and line ref below was
> verified against the working tree on that date (§1). If an anchor string is not
> found verbatim, follow the STOP protocol (§2.4) — do not improvise a similar edit.

---

## How to use this document

1. Read §0–§2 fully. Skim §3 task list. Execute tasks **in order** T1 → T12
   (T9.5 sits between T9 and T10 — added post-review, see its own section for why).
2. Per task: make the change → run the task's **Verify** → run `npm run type-check`.
   Both green → commit per §4 plan → next task.
3. Task tags: **[MECH]** = copy content verbatim, zero judgment (Haiku-safe).
   **[GUIDED]** = anchored edits, low judgment (Haiku/Sonnet). **[JUDGE]** = requires
   reading + adaptation (Sonnet or better; if you are Haiku, stop and hand off).
4. Any verify fails twice on the same task → STOP protocol (§2.4).

---

## §0 Locked decisions — DO NOT re-open, DO NOT ask the user again

| # | Decision | Status |
|---|---|---|
| D1 | Two DDD helpers built as **sub-agents** (`.md` prompt files), NOT skills. Live in new `src/agents/`, installed to `<project>/.claude/agents/`. | user-confirmed |
| D2 | `ts-event-storming-facilitator` **required to exit** `/ts-discover explore` (status stays `idea` until `exploration_output` populated). | user-approved recommendation |
| D3 | `ts-ddd-tactical-validator` **required before** `/ts-discover decide build`. Runs in `validate` when validate runs; `decide` invokes it directly if validate was skipped. FAIL blocks the build decision. | user-approved recommendation |
| D4 | WORK_TYPE set: `FEATURE \| BUGFIX \| HOTFIX \| REFACTOR \| CHORE \| PATCH \| SPIKE \| POC \| OPS`. No `EPIC` (epic = plan slice, not work type) and no `DISCOVERY` (Discovery entry is via FEATURE-unvalidated / POC). | user-confirmed |
| D5 | Spines: feature `Think→Plan→Build→Review→Test→Ship`; bugfix/hotfix `Think→Build→Ship`; chore `Build→Ship`; patch `Build→Test→Ship`; spike `Think→Build→Reflect`; ops `Think→Build→Review→Ship`; refactor/epic unchanged. `poc` has NO deliver spine (Discovery-only). | user-confirmed table |
| D6 | Gates: G1 = feature, refactor, epic (blocks Think→Plan). G2 = epic, ops, and patch-when-security-related (blocks Ship). bugfix/hotfix/chore/spike: none. Never auto-signed. | user-confirmed table |
| D7 | ts-orchestrate SKILL.md gets TWO tables: **Workflow Guidance** (3 cols: Track \| Phase/State \| Guidance — strictly per-state, both tracks) and **Workflow Routing** (2 cols: Work type \| Route — track named inline, states one by one). They are different things; do not merge them. | user-corrected ×3 — final shape below |
| D8 | Planner's `Workflow Routing` section (ts-project-planner/SKILL.md:79-93) slims to Discovery-internal routing + pointer to ts-orchestrate. Its two HARD RULES move to ts-orchestrate as canonical. | user-directed |
| D9 | Hook keeps executable copies of guidance strings (bash can't import md). Lockstep enforced by hook tests. Accepted duplication. | design decision |
| D10 | `ubiquitous_language_terms[]` added to `exploration_output` schema (facilitator emits it; validator consumes it). | design decision |
| D11 | Focus-idea heuristic in hook: priority `validating > exploring > idea > ready`, first match wins, one [NEXT] line only. | design decision |
| D12 | Fix pre-existing `.ai`→`.agents` test breakage in passing (both files touched anyway). Declared in proposal.md — not silent scope creep. | design decision |

Out of scope — do NOT fix even if you notice them (list in proposal.md Non-Goals):
- Hook reads `gates["sec-review"]` but live state.json uses key `G2` (`src/hook/inject-workflow-state.sh:23`).
- `work-unit-profiles.md` refactor spine contradicts SKILL.md refactor spine.
- `ts-spec-validator` / `ts-mutation-analyst` agents (sub-agents.md §2/§4) stay unbuilt.

---

## §1 Verified facts (checked 2026-07-05 against working tree)

**Found / confirmed:**
- `src/utils/phase-routing.ts` = 10 lines, union `'bugfix' | 'refactor' | 'epic'`, switch returns spines. Full replacement in T4.
- Tests exist: `src/tests/unit/{phase-routing,hook-output,gate-enforcement,state-schema,golden-templates}.test.ts`.
- `src/tests/unit/hook-output.test.ts:22-24,110-111` writes fixtures under `.ai/` but hook reads `.agents/` → delivery-phase tests are **currently failing before you start**. Expected. T8 fixes.
- Fixtures: `tests/orchestration/fixtures/iteration-state/{bugfix,epic,refactor}-{high,mid,low}.json` (9 files).
- `scripts/generate-manifest.mjs` scans only `src/skills/` + `src/hook/`; manifest shape `{ version, skills[], hooks[] }`. Manifest is **regenerated on every build** — never hand-edit `scripts/release-manifest.json`.
- `scripts/build-release.mjs` sections: 1 skills, 2 hooks, 3 manifest stamp, 4 commands, 5 scaffold, 6 golden parity, 7 zip.
- `scripts/dogfood.mjs` `mirrorTargets()` at line ~48 (skills+hooks+load-skill.md); `--from-zip` branch at line ~109.
- `release/install.sh` manifest-driven skills/hooks install inside `if [[ -f manifest.json ]]`; uses `${PYTHON_BIN} -c` + tab-separated `while read` loops. `release/install.ps1` exists (unread — see T3 [JUDGE]).
- `scripts/{ring0-check,verify-install}.mjs` exist (internals unread — T3/T2 instructions handle both cases).
- Sub-agent build specs: `src/skills/ts-deliver-router/references/sub-agents.md` §1 (line 8, facilitator) and §3 (line 97, validator) — full purpose/IO/prompt sketches.
- Planner refs verified verbatim: `references/commands.md` (explore steps 1-6, validate 1-6, decide blocks), `references/discovery-state.md` (schema + transitions), `references/agents.md` (table, facilitator row = line 4).
- `src/skills/ts-orchestrate/` = `SKILL.md` (59 lines) + `commands/{start,status,next}.md`.
- `src/skills/ts-project-planner/SKILL.md:79-93` = `## Workflow Routing` section incl. 2 HARD RULES (91, 93).
- Staged-but-uncommitted diff on `src/skills/ts-orchestrate/SKILL.md` = **one added blank line only** (checked with `git diff --cached`). No rebase hazard; T6 replaces the file wholesale.
- npm scripts: `type-check`, `test`, `release`, `ring0`, `dogfood`, `dogfood:rollback` all exist.
- Backup of the original plan exists: `tasks/dual-track-orchestration-plan copy.md` (user-made). Do not delete.

**Unconfirmed — verify during the task, never assume:**
- `verify-install.mjs` assertions (T2 tells you to read it first).
- `install.ps1` internal structure (T3 tells you to read it first).
- `ring0-check.mjs` manifest handling (T2 tells you to read it first).

---

## §2 Global rules

### 2.1 Hard rules (from CLAUDE.md — enforced)
- `npm run type-check` after **every** code change.
- No cross-skill imports. Doc *mentions* of other skills/agents are fine.
- Never edit: `dist/`, `.env`, `scripts/release-manifest.json` (generated), anything in `.claude/` directly (only `npm run dogfood` writes there).
- Conventional commit prefixes; one logical change per commit (§5).

### 2.2 Edit protocol
- Every [GUIDED] task gives an **anchor** (exact string from the file). Locate it with
  exact-match search. Found once → apply edit. Found zero times or 2+ times → STOP (§2.4).
- Every [MECH] block marked `>>> FILE:` is complete file content — copy verbatim,
  including frontmatter and trailing newline. Do not "improve" wording.

### 2.3 Delegation (if you can spawn subagents)
- You may delegate a whole numbered task, never a fraction of one.
- Delegation must include: the task's full text from §3, the acceptance criteria,
  and required report format: `DONE + verify output` or `STUCK + exact error`.
- Subagents return conclusions + `path:line` only — never full file dumps.

### 2.4 STOP protocol (mandatory escalation)
Trigger: same task fails verify twice · anchor not found/ambiguous · a §1 "unconfirmed"
item contradicts a task's instructions · you're about to edit a file not listed in the task.
Action: (1) revert the task's partial edits (`git checkout -- <file>` for tracked files,
delete new untracked files created by this task only); (2) append to `## Blockers` at the
bottom of THIS file: task id, what you tried, exact error output; (3) tell the user; wait.
Never push through, never widen scope, never "fix" out-of-scope items from §0.

### 2.5 Baseline (run before T1)
```bash
npm run type-check && npx vitest run src/tests/unit/phase-routing.test.ts src/tests/unit/state-schema.test.ts
npx vitest run src/tests/unit/hook-output.test.ts; echo "expect FAILURES here (known .ai breakage, §1)"
```
Record baseline output in Blockers section if anything OTHER than hook-output/gate-enforcement fails → STOP before starting.

---

## §3 Tasks

### T1 [MECH] Create the two sub-agent files

Create `src/agents/` directory with exactly these two files.

>>> FILE: `src/agents/ts-event-storming-facilitator.md`

````markdown
---
name: ts-event-storming-facilitator
description: Event Storming facilitator for the Discovery track. Required to exit /ts-discover explore. Produces exploration_output (domain_events, commands, aggregates, bounded_contexts, acpl_pattern_group, ubiquitous_language_terms) for .agents/discovery.json. Read-only — the caller writes state.
tools: Read, Grep, Glob
---

You are an Event Storming facilitator. Given a project or idea description, run a
structured Event Storming session and extract the domain model.

## Procedure

1. **Domain events** (orange stickies): things that happened, past tense
   (e.g. `OrderPlaced`, `PaymentCaptured`). Concrete to THIS domain — no generic examples.
2. **Commands** (blue stickies): what triggers each event (e.g. `PlaceOrder`).
   Every event must have exactly one triggering command.
3. **Aggregates** (yellow stickies): what handles each command and owns the invariants.
   Every command maps to exactly one aggregate.
4. **Bounded contexts**: group aggregates where language changes meaning. Flag any
   context that talks to an external system (candidate for Anti-Corruption Layer).
5. **Problem Frame** (Michael Jackson): classify as
   `Commanded | Information | Workpiece | Transformation | Control`.
6. **ACPL pattern group**: map the frame via the ts-acpl skill's
   `references/problem-frame-map.md` if present in the project
   (search path: `**/ts-acpl/references/problem-frame-map.md`); if the file is absent,
   set `"acpl_pattern_group": "UNMAPPED"` — do not invent a group.
7. **Ubiquitous language**: list every domain term used in events/commands/aggregates.
   One meaning per term; if a term has two meanings, split it per bounded context
   (e.g. `Account(Billing)`, `Account(Auth)`).

If the domain is unclear, ask at most one clarifying question, then proceed with
stated assumptions listed under `"assumptions"`.

## Output contract

Return exactly one fenced JSON block, keys exactly as below (caller merges it into
`idea.exploration_output` in `.agents/discovery.json`):

```json
{
  "domain_events": ["..."],
  "commands": ["..."],
  "aggregates": ["..."],
  "bounded_contexts": ["..."],
  "acpl_pattern_group": "G2+G3",
  "ubiquitous_language_terms": ["..."],
  "problem_frame": "Commanded",
  "assumptions": []
}
```

Rules: arrays non-empty for `domain_events`, `commands`, `aggregates`,
`bounded_contexts` — if you cannot fill one, say why in prose ABOVE the JSON and
leave the array empty; the caller will keep the idea in `status=idea` and re-run you.
````

>>> FILE: `src/agents/ts-ddd-tactical-validator.md`

````markdown
---
name: ts-ddd-tactical-validator
description: DDD tactical-pattern and ubiquitous-language validator. Required before /ts-discover decide build (Discovery Mode A); also usable at Delivery Review phase against code (Mode B). Read-only — the caller writes state.
tools: Read, Grep, Glob
---

You are a DDD tactical design validator with two modes.

**Mode selection:** if the caller provides a codebase path containing source files,
run Mode B. Otherwise (input is an `exploration_output` JSON from
`.agents/discovery.json`), run Mode A. State which mode you ran in your output.

## Mode A — Discovery (no code yet): validate `exploration_output`

Checks, in order:

| # | Check | Severity if violated |
|---|---|---|
| A1 | Every command maps to exactly one aggregate | violation |
| A2 | Every domain_event is producible by an identifiable aggregate | violation |
| A3 | No term appears in two bounded_contexts with different meanings unless suffixed per context | warning |
| A4 | Every aggregate name is a domain noun and plausibly owns invariants (not a service/manager name like `OrderManager`) | warning |
| A5 | Every bounded_context touching an external system is flagged for Anti-Corruption Layer | warning |
| A6 | `ubiquitous_language_coverage` = fraction of `ubiquitous_language_terms` appearing in at least one event, command, or aggregate name | metric |

Recommendation rule (mechanical — do not deviate):
- any A1 or A2 violated, or coverage < 0.5 → `FAIL`
- only A3/A4/A5 warnings, coverage ≥ 0.5 → `NEEDS_ATTENTION`
- all green, coverage ≥ 0.8 → `PASS` (0.5–0.8 with no warnings → `NEEDS_ATTENTION`)

## Mode B — Delivery Review (code exists): validate code against ES output

| # | Check |
|---|---|
| B1 | Every Aggregate identified in ES has a corresponding class/struct in code |
| B2 | Every Aggregate Root enforces its own invariants (no external mutation) |
| B3 | Every Repository is behind an interface (testable via fake) |
| B4 | Every Domain Event in ES has a corresponding event type in code |
| B5 | Bounded Context boundaries respected — no cross-context direct calls |
| B6 | Ubiquitous Language terms from ES appear in code identifiers |

Report each violation with `file:line`. PASS = all green. NEEDS_ATTENTION = warnings
only. FAIL = any B1–B5 violation.

## Output contract

Return exactly one fenced JSON block (caller stores it at
`idea.validation_output.ddd_validation`):

```json
{
  "mode": "A",
  "recommendation": "PASS",
  "violations": [
    { "check": "A1", "detail": "<what>", "location": "<term or file:line>" }
  ],
  "ubiquitous_language_coverage": 0.85
}
```

`recommendation` must be exactly one of `PASS | NEEDS_ATTENTION | FAIL`.
Do not attempt to fix anything — report only.
````

**Acceptance:** both files exist; frontmatter has exactly `name`, `description`, `tools`.
**Verify:** `ls src/agents/ && head -5 src/agents/*.md`

---

### T2 [GUIDED] Packaging: manifest → build → dogfood → ring0

**File 1: `scripts/generate-manifest.mjs`** — 4 edits:

a. Anchor `const HOOK_SRC = join(ROOT, 'src', 'hook');` → add line after:
```js
const AGENTS_SRC = join(ROOT, 'src', 'agents');
```
b. Anchor `for (const dir of [SKILLS_SRC, HOOK_SRC]) {` → replace with:
```js
for (const dir of [SKILLS_SRC, HOOK_SRC, AGENTS_SRC]) {
```
c. Anchor `const manifest = { version: '1', skills, hooks };` → replace with the block:
```js
// Scan agents (sub-agent prompt files installed to <project>/.claude/agents/)
const agents = [];
for (const entry of readdirSync(AGENTS_SRC).sort()) {
  const full = join(AGENTS_SRC, entry);
  if (!statSync(full).isFile()) continue;
  if (!entry.endsWith('.md') || entry === 'README.md') continue;
  agents.push({ name: entry.replace(/\.md$/, ''), src: relative(ROOT, full), dest: `agents/${entry}` });
}

const manifest = { version: '1', skills, hooks, agents };
```
d. Anchor `(${skills.length} skills, ${hooks.length} hooks)` → replace with
`(${skills.length} skills, ${hooks.length} hooks, ${agents.length} agents)`.

**File 2: `scripts/build-release.mjs`** — 1 edit. Anchor (start of section 3):
```js
// ── 3. manifest.json at zip root (stamped with the release version) ──────────
```
Insert BEFORE that line:
```js
// ── 2b. agents (manifest-driven) ──────────────────────────────────────────────

console.log('── agents ───────────────────────────────────────────────────────────────────');
for (const entry of manifest.agents ?? []) {
  const srcPath = join(ROOT, entry.src);
  const destPath = join(BUILD, entry.dest);
  cp(srcPath, destPath);
  if (existsSync(srcPath)) console.log(`  agent: ${entry.name}`);
}

```

**File 3: `scripts/dogfood.mjs`** — 2 edits.
a. In `mirrorTargets()`, anchor:
```js
  for (const e of manifest.hooks) {
    targets.push({ src: join(ROOT, e.src), dest: join(CLAUDE_DIR, e.dest), dir: false, zipPath: e.dest });
  }
```
Add directly after:
```js
  for (const e of manifest.agents ?? []) {
    targets.push({ src: join(ROOT, e.src), dest: join(CLAUDE_DIR, e.dest), dir: false, zipPath: e.dest });
  }
```
b. In the `--from-zip` branch, anchor:
```js
    for (const e of zipManifest.hooks) {
      targets.push({ src: join(extract, e.dest), dest: join(CLAUDE_DIR, e.dest), dir: false });
    }
```
Add directly after:
```js
    for (const e of zipManifest.agents ?? []) {
      targets.push({ src: join(extract, e.dest), dest: join(CLAUDE_DIR, e.dest), dir: false });
    }
```

**File 4: `scripts/ring0-check.mjs`** — read it first. If it iterates `manifest.skills`
/ `manifest.hooks` for existence checks, add the same loop over `manifest.agents ?? []`
(existence check only — agents are prompts, not executables, no smoke-run). If it does
not touch the manifest at all, make no change and note that in the commit message.

**Acceptance:** manifest regenerates with `agents` array of length 2; build zip contains `agents/`.
**Verify:**
```bash
node scripts/generate-manifest.mjs && node -e "const m=require('./scripts/release-manifest.json'); if(m.agents?.length!==2) process.exit(1); console.log('agents ok')"
npm run ring0
npm run release && unzip -l dist/release.zip | grep 'agents/'
```

---

### T3 [JUDGE] Installers: install.sh + install.ps1 + verify-install

**File 1: `release/install.sh`** — anchor (end of the manifest-driven hooks loop):
```bash
for e in m['hooks']:
    print(e['dest'] + '\t' + e['scope'] + '\t' + e['name'])
")
```
Insert directly after (still inside the `if [[ -f manifest.json ]]` branch):
```bash

  # ── agents (manifest-driven; key absent in older zips → loop is a no-op) ─────

  echo "→ Installing agents → ${PROJECT_CLAUDE_DIR}/agents/"
  mkdir -p "${PROJECT_CLAUDE_DIR}/agents"
  while IFS=$'\t' read -r dest_path name; do
    [[ -z "${dest_path}" ]] && continue
    cp "${dest_path}" "${PROJECT_CLAUDE_DIR}/agents/${name}.md"
    echo "   ✓ agent: ${name}"
  done < <("${PYTHON_BIN}" -c "
import json
m = json.load(open('manifest.json'))
for e in m.get('agents', []):
    print(e['dest'] + '\t' + e['name'])
")
```
No change to the legacy (no-manifest) fallback branch — old zips have no agents.

**File 2: `release/install.ps1`** — READ IT FIRST. Find its manifest-driven hooks
section and replicate the same pattern for agents: read `agents` key with a
missing-key-safe accessor, copy each entry's `dest` file to
`<project>/.claude/agents/<name>.md`. Match the file's existing style exactly
(same JSON parsing approach it already uses). If install.ps1 has no manifest-driven
section at all → STOP protocol, report what you found.

**File 3: `scripts/verify-install.mjs`** — READ IT FIRST. If it asserts parity
between install.sh and install.ps1 by category, add `agents` to whatever category
list it checks. If it doesn't enumerate categories, no change.

**Acceptance:** local-zip install places both agent files.
**Verify:**
```bash
npm run release
TMP=$(mktemp -d) && cd "$TMP" && ZIP_FILE=<REPO_ROOT>/dist/release.zip bash <REPO_ROOT>/release/install.sh && ls .claude/agents/ && cd - 
# expect: ts-ddd-tactical-validator.md  ts-event-storming-facilitator.md
node scripts/verify-install.mjs
```
(Replace `<REPO_ROOT>` with the absolute repo path. The install patches settings.json
inside $TMP only — it uses pwd; confirm you `cd "$TMP"` first.)

---

### T4 [MECH] phase-routing.ts — full file replacement

>>> FILE: `src/utils/phase-routing.ts` (replace entire file)

```ts
// 'poc' is intentionally absent: PoC is Discovery-only and never initializes a
// deliver spine. 'epic' is retained for existing iteration.json state (plan
// slices), though it is no longer an end-user WORK_TYPE.
export function getPhaseList(
  epicType:
    | 'epic'
    | 'feature'
    | 'bugfix'
    | 'hotfix'
    | 'refactor'
    | 'chore'
    | 'patch'
    | 'spike'
    | 'ops'
): string[] {
  switch (epicType) {
    case 'bugfix':
    case 'hotfix':
      return ['Think', 'Build', 'Ship'];
    case 'chore':
      return ['Build', 'Ship'];
    case 'patch':
      return ['Build', 'Test', 'Ship'];
    case 'spike':
      return ['Think', 'Build', 'Reflect'];
    case 'ops':
      return ['Think', 'Build', 'Review', 'Ship'];
    case 'feature':
      return ['Think', 'Plan', 'Build', 'Review', 'Test', 'Ship'];
    case 'refactor':
      return ['Think', 'Plan', 'Build', 'Review', 'Ship', 'Reflect'];
    case 'epic':
      return ['Think', 'Plan', 'Build', 'Review', 'Test', 'Ship', 'Reflect'];
  }
}
```

**Then extend `src/tests/unit/phase-routing.test.ts`:** read the file; copy its
existing test style; add one test per new type asserting the exact arrays above
(feature, hotfix, chore, patch, spike, ops). Do not delete existing tests.

**Acceptance/Verify:** `npx vitest run src/tests/unit/phase-routing.test.ts` — all pass.

---

### T5 [MECH] Fixtures for new work types

Read `tests/orchestration/fixtures/iteration-state/bugfix-high.json`. For each
type in `feature hotfix chore patch spike ops` and each dial in `high mid low`,
create `<type>-<dial>.json` as a copy of `bugfix-<dial>.json` with every
occurrence of the type value `"bugfix"` replaced by `"<type>"` and any epic id
string containing `bugfix`/`BUGFIX` adjusted to the new type (case-matched).
18 new files.

Then open `src/tests/unit/state-schema.test.ts`, find the `FIXTURE_NAMES` array,
and append the 18 new names (keep existing ordering style).

**Acceptance/Verify:** `npx vitest run src/tests/unit/state-schema.test.ts` — all pass.

---

### T6 [MECH] ts-orchestrate SKILL.md — full file replacement

>>> FILE: `src/skills/ts-orchestrate/SKILL.md` (replace entire file; note this file
has a trivial staged diff — replacing wholesale is intended, see §1)

````markdown
---
name: ts-orchestrate
description: Dual-track orchestrator — session entry point, unified status, gate enforcement. Reads [WORKFLOW STATE] hook context and routes end-user work types across the Discovery and Delivery tracks.
---

# ts-orchestrate

Passive orchestration skill. Reads `[WORKFLOW STATE]` context injected by the hook
(`inject-workflow-state.sh`). Does not read raw state files directly.

## Entry Gate

Applies to **Delivery-entry** work types only (BUGFIX, HOTFIX, REFACTOR, CHORE,
PATCH, SPIKE, OPS, and FEATURE with an already-validated idea).

If hook output shows `active epic: none`:

```
[BLOCKED] No active epic in iteration.json.active_epic.
Options: /ts-project:plan --new  ·  /ts-discover idea "<desc>" (start Discovery)
```

**Discovery-entry is exempt:** `WORK_TYPE=POC`, FEATURE without a validated idea,
and all `/ts-discover *` commands are never blocked by this gate.

**HARD RULE:** Never run `/ts-deliver:init` without an epic in
`iteration.json.active_epic`.

## Workflow Routing

Keyed by the type of work the end-user wants to do. The Route names the track
inline and walks its states one by one.

| Work type | Route |
|---|---|
| Feature | **Discovery:** `/ts-discover idea` → `explore` (event-storming) → `validate` (if H-risk; ddd-validator) → `decide build` → `/ts-project:plan --sync` → `/ts-iteration:start` → `/ts-iteration:next` → **Delivery:** Think → Plan[G1] → Build → Review → Test → Ship. Idea already validated? Enter at `/ts-iteration:next`. |
| Bugfix & Hotfix | **Delivery:** Think → Build → Ship (no gates; HOTFIX = distinct audit tag, expedited) |
| Refactor | **Delivery:** Think → Plan[G1] → Build → Review → Ship → Reflect |
| Chore & Tech debt | **Delivery:** Build → Ship (no gates, no Think; large tech debt → route as Refactor) |
| Patch (dependency/security bump) | **Delivery:** Build → Test → Ship (G2 sec-review when security-related) |
| Spike (timeboxed tech question) | **Delivery:** Think → Build → Reflect → **Discovery:** learning entry written to discovery.json (no Ship) |
| PoC (idea feasibility) | **Discovery only:** `/ts-discover idea` → `explore` (event-storming) → `validate` (throwaway prototype + ddd-validator) → `decide` build/kill/reduce-scope (never ships) |
| Ops/Infra (CI/CD, deploy, config) | **Delivery:** Think → Build → Review → Ship[G2] (infra touches the security surface) |
| *(Epic — plan slice, not a work type)* | Reached via `/ts-iteration:next` on a synced epic: Think → Plan[G1] → Build → Review → Test → Ship[G2] → Reflect |

Spike vs PoC: a Spike answers a technical question inside Delivery and feeds the
learning back; a PoC validates idea feasibility entirely inside Discovery.

After any Delivery completion: `/ts-iteration:next` (or `/ts-iteration:close` if
last epic) → `/ts-discover status` (feedback loop).

## Gate Rules

| Gate | Required for | Blocks |
|---|---|---|
| G1 (threat-model sign-off) | feature, refactor, epic | Think → Plan |
| G2 (sec-review sign-off) | epic, ops, patch (security-related only) | Ship |

Both gates: **NEVER auto-signed at any autonomy level.**

**HARD RULE:** Never mark an epic done without its required gate sign-offs.

## Workflow Guidance (Dual-Track)

Canonical per-state guidance. Routing (above) = which path; Guidance (below) =
what to do inside each state. The hook's `[NEXT]` lines mirror this table.

| Track | Phase/State | Guidance |
|---|---|---|
| Discovery | idea | Run `/ts-discover explore <id>` (WIP limit 3 in exploring+validating) |
| Discovery | exploring | `ts-event-storming-facilitator` output required to exit; then `/ts-discover validate <id>` (mandatory if any H-risk assumption) or `/ts-discover decide <id> build` |
| Discovery | validating | council-advisor + tows-strategy-analyst + `ts-ddd-tactical-validator`; then `/ts-discover decide <id>` |
| Discovery | ready | Run `/ts-project plan --sync` to move epic(s) into the backlog |
| Discovery | keep-learning | Back to exploring, keep_learning_count++; at 3 → forced `/ts-discover decide` |
| Discovery | killed | ADR written; entry retained for audit — no further action |
| Discovery | reduce-scope | Idea split into new `idea` entries; explore each separately |
| Delivery | think | Spectra:discuss + G1 threat-model sign-off (if required) → `/ts-deliver:refine` |
| Delivery | plan | Spectra:propose + design review → `/ts-deliver:refine` |
| Delivery | build | Spectra:apply + test coverage gate → `/ts-deliver:refine` |
| Delivery | review | staff-review report → `/ts-deliver:refine` |
| Delivery | test | acceptance + integration gates → `/ts-deliver:refine` |
| Delivery | ship | Spectra:archive + G2 sec-review sign-off (if required) → `/ts-deliver:refine` |
| Delivery | reflect | `/ts-iteration:next` (or `/ts-iteration:close` if last epic); spike: write learning entry to discovery.json first |

## Feedback Loop

After epic completion (Reflect phase), write feedback to `discovery.json`:

1. Mark epic status `"done"` in iteration.json.
2. Add entry to discovery.json with `source_epic` field referencing the completed epic id.
3. Run `/ts-iteration:next` (or `/ts-iteration:close` if last epic in release).
4. Discovery resumes with the completed epic as context.

## Commands

- `/ts-orchestrate:start` — entry point; sets active_epic + dial, routes per Workflow Routing
- `/ts-orchestrate:status` — cross-layer view (Discovery + Delivery)
- `/ts-orchestrate:next` — enforced phase advancement with gate checks

## Autonomy Levels

| Level | Behavior |
|---|---|
| HIGH | Auto-advance after gate sign-off; never auto-sign gates |
| MID | Recommend next action; user confirms phase advances |
| LOW | Wait for explicit user command at every step |
````

**Acceptance:** file contains both tables; `grep -c '| Discovery |' src/skills/ts-orchestrate/SKILL.md` → 7; `grep -c '| Delivery |'` → 7.
**Verify:** greps above + `npm run type-check` (no-op for md, but keep the habit).

---

### T7 [GUIDED] ts-orchestrate commands/start.md + next.md

**File 1: `src/skills/ts-orchestrate/commands/start.md`** — replace entire file:

````markdown
# /ts-orchestrate:start

Entry point for beginning work of any type, on either track.

## Parameters

- `WORK_TYPE`: `FEATURE | BUGFIX | HOTFIX | REFACTOR | CHORE | PATCH | SPIKE | POC | OPS`
- `AUTONOMY`: `HIGH | MID | LOW` — how autonomously the agent proceeds

## Behavior

1. Validate `WORK_TYPE` and `AUTONOMY` are provided.
2. Write `dial` to `iteration.json` based on `AUTONOMY` (all work types, both tracks).
3. **Discovery entry** — if `WORK_TYPE=POC`, or `WORK_TYPE=FEATURE` with no
   validated idea in discovery.json: do NOT write `active_epic`, do NOT create
   ts-deliver-router/state.json. Route to `/ts-discover` (idea → explore → …,
   per SKILL.md Workflow Routing) and stop here.
4. **Delivery entry** — all other cases: write `active_epic` to `iteration.json`
   (or prompt user to select/create one via `/ts-project:plan`).
5. Route to the phase spine for the work type (see SKILL.md → Workflow Routing;
   spines are defined in `src/utils/phase-routing.ts`).
6. Initialize ts-deliver-router/state.json with the spine's first phase
   (lower-cased, e.g. `"think"`; chore/patch start at `"build"`).
7. Output `[WORKFLOW STATE]` context for the current phase.

## Usage

```
/ts-orchestrate:start WORK_TYPE=BUGFIX AUTONOMY=MID
/ts-orchestrate:start WORK_TYPE=POC AUTONOMY=LOW
```

## Notes

- Routing and gate tables live in SKILL.md (single source — do not duplicate here).
- G1/G2 always require human sign-off regardless of AUTONOMY.
- If no epic exists in iteration.json for a Delivery work type, create one via
  `/ts-project:plan` first (Entry Gate, SKILL.md).
````

**File 2: `src/skills/ts-orchestrate/commands/next.md`** — read the file. Wherever it
describes phase advancement or gate checks, ensure it states (edit minimally, keep
existing structure): (a) gate matrix = SKILL.md Gate Rules table is canonical;
(b) spike's final phase is Reflect → write learning entry to discovery.json, then
`/ts-iteration:next`; (c) types without Reflect (feature, bugfix, hotfix, chore,
patch, ops) go straight from Ship to `/ts-iteration:next`. If next.md contains its
own copy of the spine table, replace that copy with the sentence:
"Spines and gates: see SKILL.md → Workflow Routing / Gate Rules (canonical)."

**Acceptance:** start.md lists 9 work types; next.md contains no spine table of its own.
**Verify:** `grep -c 'POC' src/skills/ts-orchestrate/commands/start.md` ≥ 2.

---

### T8 [GUIDED] Hook: `.agents` test fix + Discovery [NEXT] branch

**File 1: `src/hook/inject-workflow-state.sh`** — replace the final `elif` block.
Anchor (the ENTIRE current block, lines 41-45):
```bash
elif [ -f "$ITERATION" ]; then
  DIAL=$(jq -r '.dial // "MID"' "$ITERATION" 2>/dev/null) || exit 0
  EPIC=$(jq -r 'if .active_epic then .active_epic else "none" end' "$ITERATION" 2>/dev/null) || EPIC="none"
  echo "[WORKFLOW STATE] Discovery | dial: $DIAL | active_epic: $EPIC"
fi
```
Replace with:
```bash
elif [ -f "$ITERATION" ]; then
  DIAL=$(jq -r '.dial // "MID"' "$ITERATION" 2>/dev/null) || exit 0
  EPIC=$(jq -r 'if .active_epic then .active_epic else "none" end' "$ITERATION" 2>/dev/null) || EPIC="none"
  echo "[WORKFLOW STATE] Discovery | dial: $DIAL | active_epic: $EPIC"

  DISCOVERY="$PROJ/.agents/discovery.json"
  FOCUS=""
  if [ -f "$DISCOVERY" ]; then
    # Focus idea priority: validating > exploring > idea > ready (first match).
    FOCUS=$(jq -r '
      (.ideas // []) as $i |
      ( first($i[] | select(.status == "validating"))
        // first($i[] | select(.status == "exploring"))
        // first($i[] | select(.status == "idea"))
        // first($i[] | select(.status == "ready"))
        // empty ) | "\(.status)\t\(.id)"' "$DISCOVERY" 2>/dev/null) || FOCUS=""
  fi
  STATUS="${FOCUS%%$'\t'*}"
  ID="${FOCUS#*$'\t'}"
  case "$STATUS" in
    idea)       echo "[NEXT] Run /ts-discover explore $ID (WIP limit 3)" ;;
    exploring)  echo "[NEXT] Run /ts-discover validate $ID (required if H-risk) or /ts-discover decide $ID build" ;;
    validating) echo "[NEXT] Run /ts-discover decide $ID — ts-ddd-tactical-validator must not FAIL" ;;
    ready)      echo "[NEXT] Run /ts-project plan --sync" ;;
    *)          echo "[NEXT] Run /ts-discover idea \"<desc>\" or /ts-project:plan --new" ;;
  esac
fi
```
(Keep `$'\t'` exactly — bash ANSI-C quoting. The script runs `set -euo pipefail`;
every new command above is `|| `-guarded or a parameter expansion, which is safe.)

**File 2: `src/tests/unit/hook-output.test.ts`** — two changes:
a. Replace ALL 5 occurrences of `'.ai'` with `'.agents'` (they are at the
   `setupDeliveryFixture` function and the malformed-json test; pattern
   `join(dir, '.ai', ...)` / `mkdirSync(join(dir, '.ai', ...)`).
b. Append this at the end of the file:
```ts
function setupDiscoveryFixture(ideas: unknown[] | null): string {
  const dir = mkdtempSync(join(tmpdir(), 'hook-disc-'));
  mkdirSync(join(dir, '.agents'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'iteration.json'), JSON.stringify({ active_epic: null, dial: 'MID' }));
  if (ideas !== null) {
    writeFileSync(join(dir, '.agents', 'discovery.json'), JSON.stringify({ project: 'x', ideas }));
  }
  return dir;
}

describe('inject-workflow-state.sh — discovery branch [NEXT]', () => {
  it('no discovery.json → seed suggestion', () => {
    const out = runHook(track(setupDiscoveryFixture(null)));
    expect(out).toContain('[WORKFLOW STATE] Discovery');
    expect(out).toContain('/ts-discover idea');
  });

  it('empty ideas → seed suggestion', () => {
    expect(runHook(track(setupDiscoveryFixture([])))).toContain('/ts-discover idea');
  });

  it('status=idea → explore with id', () => {
    const out = runHook(track(setupDiscoveryFixture([{ id: 'idea-001', status: 'idea' }])));
    expect(out).toContain('/ts-discover explore idea-001');
  });

  it('status=exploring → validate-or-decide with id', () => {
    const out = runHook(track(setupDiscoveryFixture([{ id: 'idea-002', status: 'exploring' }])));
    expect(out).toContain('/ts-discover validate idea-002');
  });

  it('validating outranks exploring (focus priority)', () => {
    const out = runHook(track(setupDiscoveryFixture([
      { id: 'idea-003', status: 'exploring' },
      { id: 'idea-004', status: 'validating' },
    ])));
    expect(out).toContain('/ts-discover decide idea-004');
  });

  it('status=ready → plan --sync', () => {
    const out = runHook(track(setupDiscoveryFixture([{ id: 'idea-005', status: 'ready' }])));
    expect(out).toContain('/ts-project plan --sync');
  });

  it('malformed discovery.json → state line still printed, no crash', () => {
    const dir = track(setupDiscoveryFixture(null));
    writeFileSync(join(dir, '.agents', 'discovery.json'), '{bad');
    const out = runHook(dir);
    expect(out).toContain('[WORKFLOW STATE] Discovery');
    expect(out).toContain('[NEXT]');
  });
});
```

**File 3: `src/tests/unit/gate-enforcement.test.ts`** — read it; replace all `'.ai'`
path segments with `'.agents'` (same pattern as File 2a). Make no other change.

**Acceptance/Verify:**
```bash
npx vitest run src/tests/unit/hook-output.test.ts src/tests/unit/gate-enforcement.test.ts
# manual smoke:
TMP=$(mktemp -d); mkdir -p $TMP/.agents
echo '{"active_epic":null,"dial":"MID"}' > $TMP/.agents/iteration.json
echo '{"project":"x","ideas":[{"id":"idea-001","status":"exploring"}]}' > $TMP/.agents/discovery.json
CLAUDE_PROJECT_DIR=$TMP bash src/hook/inject-workflow-state.sh
# expect: "[WORKFLOW STATE] Discovery ..." + "[NEXT] Run /ts-discover validate idea-001 ..."
```

---

### T9 [GUIDED] Planner references: wire the two agents in

All files under `src/skills/ts-project-planner/references/`.

**File 1: `commands.md`** — 3 anchored edits:

a. Anchor:
```
2. Run ts-event-storming-facilitator:
```
Replace with:
```
2. Run ts-event-storming-facilitator (REQUIRED — explore cannot exit without
   its output; installed at .claude/agents/ts-event-storming-facilitator.md):
```

b. Anchor (this is the FULL current block for `/ts-discover explore` step 4
through the end — replace the entire thing, not a fragment, so no separate
renumbering step is needed):
```
4. Write idea.exploration_output, idea.riskiest_assumptions
5. idea.status = "exploring"
6. Confirm: "idea-<NNN> explored. Riskiest: <top H-risk assumption, if any>.
   <Validation required|Validation optional — no H-risk assumptions>."
```
Replace with (full corrected block — note step 6 confirm message is now
step 7; there is no "renumber" step, this block already has the right
numbers):
```
4. Write idea.exploration_output, idea.riskiest_assumptions
5. GATE: if exploration_output.domain_events, .aggregates, or .bounded_contexts
   is empty → status stays "idea". Report the missing fields and re-run
   ts-event-storming-facilitator. Do NOT proceed to step 6.
6. idea.status = "exploring"
7. Confirm: "idea-<NNN> explored. Riskiest: <top H-risk assumption, if any>.
   <Validation required|Validation optional — no H-risk assumptions>."
```

c. Anchor (this is the FULL current block for `/ts-discover validate` step 1
through the end — replace the entire thing):
```
1. Run council-advisor: pressure-test each H-risk assumption
2. Run tows-strategy-analyst: assess strategic fit
3. Optionally run critical-thinker for sequencing/dependency challenges
4. Write idea.validation_output = { feasibility, council_verdict,
   decision_rationale }
5. idea.status = "validating"
6. Confirm: "idea-<NNN> validated — feasibility: <feasible|risky|infeasible>"
```
Replace with (full corrected block — steps 5 and 6 are already renumbered
to 6 and 7 below; there is no separate renumbering step):
```
1. Run council-advisor: pressure-test each H-risk assumption
2. Run tows-strategy-analyst: assess strategic fit
3. Run ts-ddd-tactical-validator (Mode A) on idea.exploration_output
   (installed at .claude/agents/ts-ddd-tactical-validator.md — always runs
   whenever validate runs)
4. Optionally run critical-thinker for sequencing/dependency challenges
5. Write idea.validation_output = { feasibility, council_verdict,
   decision_rationale, ddd_validation }
6. idea.status = "validating"
7. Confirm: "idea-<NNN> validated — feasibility: <feasible|risky|infeasible>"
```

d. Anchor:
```
build:
  - idea.status = "ready"
```
Replace with:
```
build:
  - PRECONDITION: validation_output.ddd_validation exists with
    recommendation != "FAIL". If absent (validate was skipped — no H-risk),
    run ts-ddd-tactical-validator (Mode A) NOW and write
    validation_output.ddd_validation before deciding.
    If recommendation == "FAIL": STOP — surface violations; suggest
    keep-learning or reduce-scope instead.
  - idea.status = "ready"
```

**File 2: `discovery-state.md`** — 2 anchored edits:

a. Anchor:
```
      "exploration_output": {
        "domain_events": [], "commands": [], "aggregates": [],
        "bounded_contexts": [], "acpl_pattern_group": "G2+G3"
      },
```
Replace with:
```
      "exploration_output": {
        "domain_events": [], "commands": [], "aggregates": [],
        "bounded_contexts": [], "acpl_pattern_group": "G2+G3",
        "ubiquitous_language_terms": []
      },
```

b. Anchor:
```
      "validation_output": {
        "feasibility": "feasible|risky|infeasible",
        "council_verdict": "<summary>",
        "decision_rationale": "<why>"
      },
```
Replace with:
```
      "validation_output": {
        "feasibility": "feasible|risky|infeasible",
        "council_verdict": "<summary>",
        "decision_rationale": "<why>",
        "ddd_validation": {
          "mode": "A",
          "recommendation": "PASS|NEEDS_ATTENTION|FAIL",
          "violations": [],
          "ubiquitous_language_coverage": null
        }
      },
```

c. Anchor (end of the State Transitions / rules block):
```
**Dedup (`--from-router`):** Jaccard similarity > 0.5 vs existing titles → no new entry; append duplicate note to matched entry instead.
```
Add after:
```
**DDD gate:** `decide build` requires `validation_output.ddd_validation.recommendation != "FAIL"` (run ts-ddd-tactical-validator at decide time if validate was skipped).
```

**File 3: `agents.md`** — anchor (line 4):
```
| `ts-event-storming-facilitator` sub-agent | Layer D | Domain decomposition → exploration_output (events/commands/aggregates/bounded_contexts/pattern group) |
```
Replace with:
```
| `ts-event-storming-facilitator` sub-agent (`.claude/agents/ts-event-storming-facilitator.md`, shipped in release) | Layer D | Domain decomposition → exploration_output (events/commands/aggregates/bounded_contexts/pattern group/ubiquitous language). REQUIRED to exit /ts-discover explore |
| `ts-ddd-tactical-validator` sub-agent (`.claude/agents/ts-ddd-tactical-validator.md`, shipped in release) | Layer D + Layer 2 Review | Tactical DDD + ubiquitous-language validation of exploration_output; gate before decide build (FAIL blocks) |
```

**File 4: `work-unit-profiles.md`** [JUDGE] — read it; add profile blocks for
`feature`, `hotfix`, `chore`, `patch`, `spike`, `ops` matching the existing blocks'
format, using the D5 spines and D6 gates. Do NOT touch the existing refactor block
(its spine mismatch is out of scope, §0).

**File 5: `commands.md` again** — anchor:
```
4. Determine registry profile from epic.type (epic/refactor/bugfix)
```
Replace with:
```
4. Determine registry profile from epic.type
   (epic/feature/refactor/bugfix/hotfix/chore/patch/spike/ops)
```

**Acceptance:** grep checks below all return ≥1.
**Verify:**
```bash
grep -c 'ddd_validation' src/skills/ts-project-planner/references/commands.md      # ≥ 2
grep -c 'ubiquitous_language_terms' src/skills/ts-project-planner/references/discovery-state.md  # 1
grep -c 'ts-ddd-tactical-validator' src/skills/ts-project-planner/references/agents.md  # 1
```

---

### T9.5 [MECH] Regression test: phase-routing.ts vs work-unit-profiles.md

Added post-review (plan-eng-review pass, 2026-07-05) — closes the gap idea-002's
own `ddd_validation` follow-up #2 flagged: no test asserts the new work-type
spines stay in lockstep across `phase-routing.ts` and `work-unit-profiles.md`.
Placed after T9 (not near T4/T5) because it depends on T9's new profile blocks
existing in `work-unit-profiles.md`.

**Scope:** only the 6 new types (`feature`, `hotfix`, `chore`, `patch`, `spike`,
`ops`). Do NOT extend to `epic`/`refactor`/`bugfix` — those 3 already have a
known, out-of-scope spine contradiction between `work-unit-profiles.md` and
`SKILL.md`/`phase-routing.ts` (§0 Non-Goals). Asserting equality on them would
fail on a pre-existing issue this epic explicitly does not fix.

Create `src/tests/unit/spine-consistency.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { getPhaseList } from '../../utils/phase-routing';

const PROFILES = readFileSync(
  fileURLToPath(new URL('../../skills/ts-project-planner/references/work-unit-profiles.md', import.meta.url)),
  'utf8'
);

const NEW_TYPES: Record<string, string> = {
  Feature: 'feature',
  Hotfix: 'hotfix',
  Chore: 'chore',
  Patch: 'patch',
  Spike: 'spike',
  Ops: 'ops',
};

function activePhasesFor(sectionTitle: string): string[] {
  // Match "## <Title> (...)" then the next "Active phases:   a → b → c" line.
  const sectionRe = new RegExp(`## ${sectionTitle}[^\\n]*\\n[\\s\\S]*?Active phases:\\s*([^\\n]+)`);
  const match = PROFILES.match(sectionRe);
  if (!match) throw new Error(`No "Active phases:" line found for section "${sectionTitle}" in work-unit-profiles.md`);
  return match[1].split('→').map((p) => p.trim().toLowerCase()).filter(Boolean);
}

describe('phase-routing.ts vs work-unit-profiles.md — new work types stay in lockstep', () => {
  for (const [sectionTitle, routingKey] of Object.entries(NEW_TYPES)) {
    it(`${routingKey}: spine matches between phase-routing.ts and work-unit-profiles.md`, () => {
      const fromCode = getPhaseList(routingKey as any).map((p) => p.toLowerCase());
      const fromDocs = activePhasesFor(sectionTitle);
      expect(fromDocs).toEqual(fromCode);
    });
  }
});
```

This asserts the `work-unit-profiles.md` blocks T9 File 4 creates use the exact
`"Active phases:   a → b → c"` line format the existing epic/refactor/bugfix
blocks already use (`work-unit-profiles.md:10,33,65`) — if T9's new blocks
don't match that format, this test's regex fails loudly rather than silently
parsing nothing.

**Acceptance/Verify:** `npx vitest run src/tests/unit/spine-consistency.test.ts` — 6/6 pass.

---

### T10 [GUIDED] Planner SKILL.md: slim Workflow Routing + doc notes

**File 1: `src/skills/ts-project-planner/SKILL.md`** — anchor = the whole section
from `## Workflow Routing` through the final HARD RULE line
(`HARD RULE: Never mark epic done without G1 + G2 human sign-off.`). Replace the
entire section with:

````markdown
## Workflow Routing

Canonical work-type routing (both tracks) lives in **ts-orchestrate SKILL.md →
Workflow Routing** — start every session there. This skill owns only the
Discovery-internal state machine:

idea → exploring → validating → ready (see `references/discovery-state.md`),
with `keep-learning` looping back and `killed` / `reduce-scope` terminal.

Hard rules (enforced canonically by ts-orchestrate):
- Never start /ts-deliver:init without an epic in iteration.json.active_epic.
- Never mark epic done without required gate sign-off (G1/G2 per work type).
````

**File 2: `src/skills/ts-deliver-router/references/sub-agents.md`** — two edits:
a. Anchor `## 1. \`ts-event-storming-facilitator\`` → add line directly after:
```
> **Status: shipped.** Packaged in release as `agents/ts-event-storming-facilitator.md`, installed to `.claude/agents/`. No manual build needed. Source: `src/agents/`.
```
b. Anchor `## 3. \`ts-ddd-tactical-validator\`` → add line directly after:
```
> **Status: shipped.** Packaged in release as `agents/ts-ddd-tactical-validator.md`, installed to `.claude/agents/`. No manual build needed. Source: `src/agents/`.
```

**File 3: `tasks/ideasToImproveOrchestration.md`** — this file has unstaged user
edits. Read current content first; do not revert anything. Prefix these two lines
(if still present) with `[DONE — dual-track-orchestration] `:
- the `# NEXT must cover discover and deliver dual-track...` heading
- the `## ts-event-storming, ts-ddd-tactial-validator are optional...` line

**Acceptance/Verify:** `grep -c 'Status: shipped' src/skills/ts-deliver-router/references/sub-agents.md` → 2; planner SKILL.md contains `ts-orchestrate SKILL.md`.

---

### T11 [JUDGE] Spectra change proposal (openspec)

Create `openspec/changes/dual-track-orchestration/`. Copy the artifact shape from
`openspec/changes/archive/2026-06-30-inject-workflow-state-hook/` (read it first).

- `proposal.md`: Why = §Context of `tasks/dual-track-orchestration-plan copy.md`
  (the original narrative plan — use it as the source for prose).
  What Changes = one line per task T1–T10. Non-Goals = the three out-of-scope
  items in §0. Impact = files listed in tasks.
- `tasks.md`: numbered checklist = T1–T12 of this runbook, each with its Verify
  command. Mark T1–T10 complete only if actually done.
- `design.md`: record decisions D1–D12 from §0 verbatim (table is fine).
- Spec deltas under `specs/`: MODIFIED `workflow-routing-table`,
  `workflow-state-hook`, `phase-routing`, `release-manifest`, `dogfood-sync`,
  `ts-deliver-router-agent-scaffold`; ADDED `discovery-subagents`. Follow the
  delta format used in the archived change's `specs/` dir. If a named spec dir
  does not exist under `openspec/specs/`, note it in proposal.md instead of
  inventing a delta — then STOP protocol only if more than 2 are missing.

**Verify:** `ls openspec/changes/dual-track-orchestration/` shows proposal.md,
tasks.md, design.md, specs/. If a `spectra` CLI is available: `spectra validate
dual-track-orchestration` (skip silently if the CLI is absent).

---

### T12 [MECH] Full verification + dogfood

Run in order; ALL must pass before commit C6:

```bash
npm run type-check
npm test
npm run release && unzip -l dist/release.zip | grep 'agents/'   # 2 agent files listed
npm run dogfood && ls .claude/agents/                            # 2 files mirrored
```

Hook smoke (both tracks):
```bash
TMP=$(mktemp -d); mkdir -p $TMP/.agents/ts-deliver-router
echo '{"schema_version":"1","current_phase":"think"}' > $TMP/.agents/ts-deliver-router/state.json
echo '{"active_epic":"E1","dial":"MID"}' > $TMP/.agents/iteration.json
CLAUDE_PROJECT_DIR=$TMP bash src/hook/inject-workflow-state.sh    # expect think [NEXT]
rm -rf $TMP/.agents/ts-deliver-router
echo '{"project":"x","ideas":[{"id":"idea-001","status":"ready"}]}' > $TMP/.agents/discovery.json
CLAUDE_PROJECT_DIR=$TMP bash src/hook/inject-workflow-state.sh    # expect Discovery + plan --sync
```

If `npm run dogfood` was run: verify this session's own `.claude/skills/ts-orchestrate/SKILL.md`
now matches `src/` (`diff -q src/skills/ts-orchestrate/SKILL.md .claude/skills/ts-orchestrate/SKILL.md`).

---

## §4 Commit plan (in order; conventional prefixes; never bundle)

| # | After tasks | Message |
|---|---|---|
| C1 | T11 (may be written first or last — if last, commit first anyway) | `docs(openspec): propose dual-track-orchestration change` |
| C2 | T1–T3 | `feat(agents): ship ts-event-storming-facilitator + ts-ddd-tactical-validator via agents manifest category` |
| C3 | T4–T5 | `feat(routing): add feature/hotfix/chore/patch/spike/ops work-type spines` |
| C4 | T6–T7 | `feat(ts-orchestrate): dual-track workflow guidance + work-type routing tables` |
| C5 | T8 | `fix(hook-tests): .ai → .agents fixture paths; feat(hook): Discovery-branch [NEXT] guidance` — split into two commits if diff > 150 lines: `fix` first, then `feat` |
| C6 | T9–T10, T9.5, T12 green | `docs(planner): wire discovery sub-agents; slim Workflow Routing to ts-orchestrate pointer` |
| C7 | T9.5 (may fold into C6 if done together) | `test(spine): assert phase-routing.ts matches work-unit-profiles.md for new work types` |

Do NOT commit: `.agents/**` state files, `tasks/dual-track-orchestration-plan copy.md`,
`dist/**`. Check `git status` before every commit; stage listed files explicitly
(`git add <paths>`), never `git add -A`.

## §5 Definition of done

- [ ] T1–T12 + T9.5 all green, committed per §4.
- [ ] `npm test` fully green (including previously-failing hook tests).
- [ ] `unzip -l dist/release.zip` shows `agents/` with 2 files.
- [ ] `.claude/agents/` contains both files after dogfood.
- [ ] Blockers section below is empty OR every entry is resolved/handed off.
- [ ] Report to user: list of commits + any Blockers entries. No claim of done
      with anything skipped — fail loud.

## Blockers

(append entries here per §2.4 — never delete previous entries)
