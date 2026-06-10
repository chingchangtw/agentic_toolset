# lifecycle-router

**The GPS layer for agentic software development.** It reads the current state of a Spectra spec-driven (BDD) project and tells the operator **where they are** in the lifecycle and **what to do next** — at a chosen autonomy level.

> One file, three tools. The same `SKILL.md` runs in **Claude Code**, **GitHub Copilot CLI**, and **VS Code agent mode**.

---

## The model

| Part | Plays the role of |
|---|---|
| **Spine** | Spectra's spec-driven (BDD) lifecycle: `discuss → propose → apply → ingest → archive` |
| **Hub** | Claude Code — orchestrates, judges, runs review + security gates |
| **Organs** | superpowers, gstack, code-review-graph, mattpocock/skills, your own skills — harvested **into each phase**, never run as competing spines |
| **Muscle** | Copilot / Gemini — cheap implementation, doc generation, git + Spectra mechanical work |

Why a router and not a fixed pipeline: the operator isn't a craft agentic-coding dev. The flow's job is partly to **teach you where you are** and recommend the next move — adjustable from full-auto to hint-only.

---

## Install

Place the skill folder at **`.claude/skills/lifecycle-router/`** in your repo. That single path is read by all three tools:

| Tool | Reads from | Notes |
|---|---|---|
| **Claude Code** | `.claude/skills/` (project) or `~/.claude/skills/` (personal) | Loads on session start. |
| **Copilot CLI** | `.github/skills`, `.claude/skills`, `.agents/skills` (project); `~/.copilot/skills`, `~/.agents/skills` (personal) | Run `/skills reload`, then `/skills info lifecycle-router` to confirm. Use latest CLI. |
| **VS Code** | same project paths, **agent mode** | Stable support since early 2026. |

Trigger by asking naturally ("what's next?", "where am I?", "which skill?") or explicitly with `/lifecycle-router`. Matching is driven by the `description` in the YAML frontmatter — identical mechanism across all three tools.

> **Cross-tool state:** Claude Code and Copilot keep separate sessions and don't share chat history. They stay consistent by reading the same on-disk autonomy file (`openspec/.router/autonomy`).

---

## The autonomy dial

The same SOP drives all three levels — only how much the router *does for you vs. tells you* changes.

| Level | Name | Behavior |
|---|---|---|
| **HIGH** | Auto | Runs the chain end-to-end. Stops only for taste decisions + the two security gates. Reports artifacts + token cost at each phase boundary. |
| **MID** | Recommend | Names current stage **and** recommended next skill(s); waits for approval each step. **(Default.)** |
| **LOW** | Suggest | Names the **lifecycle stage only** — no skill names. Pure "you are here." |

- **Asks** on first use in a project (no saved preference).
- **Remembers** by writing `HIGH`/`MID`/`LOW` to `openspec/.router/autonomy`.
- **Switches** anytime: "go auto" → HIGH, "recommend mode" → MID, "suggestions only" → LOW. Downshift to LOW always allowed; upshift to HIGH re-confirms before the next destructive/security step.
- **Safety override:** the two security gates pause for human sign-off **regardless of level**, even HIGH. The dial controls convenience, never safety.

---

## The lifecycle map

```
discuss   → office-hours, first-principles-agent, critical-thinker, council-advisor
            🔒 SECURITY GATE #1 (early): threat-model + privacy/data-flow  (/cso, critical-thinker)
propose   → spec + Given/When/Then (BDD); plan gates: council-advisor, /plan-eng-review, /plan-ceo-review
            (refactor: code-review-graph maps codebase → reverse-spec feeds here)
apply     → superpowers brainstorming→writing-plans→TDD→subagent-driven-development;
            mattpocock/skills (TS); code-review-graph always-on; Copilot/Gemini = muscle
            checks: tdd, incremental review, SAST, dep-scan (always) · coverage, acceptance (gates)
ingest    → reqs change mid-build → propose delta + council-advisor re-check (stop scope drift)
archive   → /review → integration-QA → 🔒 SECURITY GATE #2 (/cso + url-safety-validator + privacy)
            → /document-release → merge specs
```

**Refactor entry:** code-review-graph maps the codebase → gather product/function description → produce a **reverse-spec** (what the code does now) → feed `propose`.

**Known gap:** no dedicated privacy skill yet; gates lean on `/cso` + `critical-thinker`. Decide whether to build a small `privacy-review` skill.

---

## Extending it: the checks registry

The five Spectra phases are **fixed**. Every TDD / code-review / QA / security activity is a *check* attached to a phase via a registry — so adding a new activity means **appending one row**, never editing the spine or the router.

Each check has a **type** that tells the router how to handle it:

| Type | Behavior |
|---|---|
| **always** | Runs continuously inside a phase, never blocks (e.g. code-review-graph context, SAST, dependency/secrets scan, incremental AI review). |
| **gate** | Blocks exit from its phase until it passes or gets sign-off (coverage threshold, acceptance tests, staff review, integration QA, the two security gates). |
| **rec** | Router surfaces it; operator may skip (mutation testing, cross-model review, e2e/perf QA). |

Your two security gates are simply the first two `gate` rows — they stop being special-cased and become the model you extend everything else with.

**Where the four families land:**
- **TDD** → mostly `apply`: red-green-refactor (always), coverage (gate), mutation/property (rec).
- **code-review** → design review at `propose`, incremental AI review (always) in `apply`, staff review (gate) in `archive`, optional cross-model challenge.
- **QA** → integration (gate) + e2e/perf (rec) in `archive` — but its *contract* is the Given/When/Then scenarios written back in `propose`. **Acceptance tests are derived from the spec, not bolted on.**
- **security** → the two gates, plus continuous SAST/dependency/secrets scans (always) in `apply` so issues surface early, not at G2.

**The router gains one step:** at each phase it runs the `always` checks, surfaces the `rec` checks (per autonomy level), and requires every `gate` check to pass or be signed off before phase exit. A red gate blocks at every autonomy level; security/destructive gates pause for a human even in HIGH and even when green.

**Recipe to add any future activity:**
1. Pick its **phase** (discuss→propose→apply→ingest→archive).
2. Pick its **type** (always / gate / rec).
3. Define its **trigger** (what makes it relevant).
4. Name the **skill/command** that runs it.
5. Append one row to the `CHECKS REGISTRY` in `SKILL.md`. Done.

> The shipped registry uses placeholders (`<SAST tool>`, `<dep/secrets scanner>`, `<mutation tool>`, `coverage >= <X>%`). Swap these for your real stack when wiring up a project.

## Review & audit

The rookie follows the SOP; you review by three signals (no need to watch live):
1. **Artifacts** — specs, scenarios, reverse-specs, review + security-gate records.
2. **Token cost** per phase — anomalies flag problems (e.g. `apply` burning tokens ⇒ missing code-review-graph context).
3. **Chain of AI chat** — catch a bad recommendation before it costs a day.

In LOW/MID the router never fabricates a skill it isn't confident about — it says "stage unclear, manual review" instead.

---

## Maintenance

Review the spine + harvested organs **monthly** (gstack/superpowers churn). Update the per-phase skill names in `SKILL.md` when an upstream change breaks a harvested part.

---

## Package contents

| File | Purpose |
|---|---|
| `SKILL.md` | The skill itself — token-compact ("caveman") form for low context cost. |
| `README.md` | This file — human-readable documentation. |
| `Ideas.md` | Reference record of the design session and decisions behind the skill. |
