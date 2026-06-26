# module: phases (lifecycle map + sub-loops)

Loaded when: need phase map, skills/artifacts for a phase, ingest, or refactor entry.

## Map (gstack 7-phase, Spectra BDD nested)
1. **Think** — Spectra:discuss. Skills: gstack:/office-hours, council-advisor.
   discuss writes `.ai/context.md` (problem_framing, stakeholders, constraints,
   open_questions) — `context-captured` always-row warns (non-blocking) if missing on exit.
   Rec: deep-research (anthropics/skills, broad problems), ux-research
   (addyosmani/agent-skills, user-facing), frame-hats (six-thinking-hats-coach,
   ambiguous/multi-stakeholder), first-princ (first-principles-agent, novel problems),
   strat-fit (tows-strategy-analyst, portfolio scope).
   Artifacts: framing, capabilities, never_automate, context.
   Exit gates: **vision-check** (registry-think.md) + **threat-model (G1)** → security-gates.md.

2. **Plan** — Spectra:propose (spec + Given/When/Then; scenarios become acceptance tests in Test).
   propose reads `.ai/context.md` before generating the spec: spec must reference at least
   one `problem_framing` item; `open_questions` surface as unresolved risks.
   Skills: council-advisor, gstack:/plan-eng-review, gstack:/plan-ceo-review.
   Rec: brainstorm (superpowers:brainstorming), write-plan (superpowers:writing-plans),
   prompt-opt (the-master-prompt-optimization-architect), xmodel-plan (gstack:/codex),
   reverse-spec (code-review-graph, refactor entry only).
   Artifacts: spec, scenarios. Exit gate: design-review.

3. **Build** — Spectra:apply. Always: tdd (superpowers:test-driven-development),
   incr-review (code-review-graph), sast, dep-scan.
   Rec: subagent-dev (superpowers:subagent-driven-development, parallelizable work),
   ts-tooling (mattpocock/skills, TS only), fe-tooling (addyosmani/agent-skills, frontend only),
   mutation (high-risk modules). Delegate implementation/docs/mechanical → Copilot/Gemini.
   Gate: coverage. Cross-cut: spec change → INGEST.

4. **Review** — gstack:/review (staff-engineer bug pass). Artifact: report.
   Gate: staff-review. Rec: council-rev (council-advisor, high-stakes), xmodel-review (Copilot/Gemini).
   Spec gap surfaced → INGEST → Plan delta.

5. **Test** — Run Given/When/Then from Plan as acceptance tests.
   Artifacts: acceptance, integration. Gates: acceptance, integration-qa.
   Rec: e2e-qa, perf-qa (addyosmani if frontend), a11y-audit (addyosmani, user-facing/public).
   Broken spec assumptions → INGEST → Plan delta.

6. **Ship** — Spectra:archive (gstack:/document-release, merge specs).
   Artifacts: release_notes, merged.
   Rec: notes-tone (adaptive-communication-architect), notes-polish (business-english-enhancer).
   Exit gate: **sec-review (G2)** → security-gates.md.

7. **Reflect** — gstack:/retro, gstack:/learn. Artifact: retro.
   Rec: harvest-skill (skill-creator, ref: anthropics/skills patterns).
   Lessons feed registry + spine — the designed improvement loop.

## Ingest sub-loop (Spectra:ingest, cross-cutting — NOT a phase)
Triggered from Build/Review/Test when reality forces a spec change:
1. Spectra:ingest identifies affected spec/scenarios.
2. Write DELTA (changed parts only), not full re-propose.
3. council-advisor re-checks scope + risk.
4. New constraint not already in `.ai/context.md`? Prompt: "Update context.md
   open_questions with new constraint: <constraint>" — ingest is the one
   permitted mid-delivery writer of context.md.
5. Append entry to `state.ingest_log[]` (record context.md update path if written).
6. Resume triggering phase. Prevents scope drift.

## Discovery feedback hook detail
When Think or Build surfaces unresolved assumptions, trigger
`/ts-discover idea --from-router` only if one criterion matches:
1. blocks G1/G2 sign-off
2. affects more than one epic scope
3. introduces a new external dependency

Hook is non-blocking. Continue phase regardless; record outcome in state notes.
Minor single-epic implementation details do not trigger this hook.

## Refactor entry (feeds Plan)
1. code-review-graph maps codebase (MCP — surface as setup gap if not configured).
2. Gather product/function description from operator.
3. Produce reverse-spec (what code DOES now) → valid Plan artifacts.

## Agent division (token-tiered)
Hub = Claude Code: orchestrate, judge, phases+registry, gates, security, ingest, retro.
Muscle = Copilot/Gemini: implementation, doc gen, git, mechanical checks. Cheap tokens.
Optional: xmodel-plan/xmodel-review = 2nd-model cross-challenge.

## Audit (operator reviews, not live)
3 signals: state.json + artifact files (truth+trail) | token cost per phase | chat chain.
