# module: registry (CHECKS REGISTRY + DIAL detail)

Loaded when: listing checks for a phase, adding a check, or resolving autonomy behavior.

## DIAL (autonomy) — full behavior
| Level | Name | Behavior |
|---|---|---|
| HIGH | Auto | Run chain end-to-end. Stop only for taste + security/destructive gates. Print artifacts + token cost per phase boundary. NEVER auto-signs a security gate. |
| MID | Recommend | Name current phase + recommended next skill(s)/checks; wait for approval each step. **DEFAULT.** |
| LOW | Suggest | Name the phase only — no skill names. |

First use, no saved pref → ask `"Autonomy? HIGH/MID/LOW"`, wait, persist to
`.ai/ts-deliver-router/autonomy`. Switch anytime (update file): "go auto"/"full auto"/"just run
it"→HIGH; "recommend"/"ask me each step"→MID; "suggestions only"/"just tell me
where i am"/"stop naming skills"→LOW. Downshift LOW always ok; upshift HIGH
re-confirms before next destructive/security step. Dial = convenience, never safety.

## CHECKS REGISTRY
Spine is fixed; activities = one row each. Types: **always** (continuous,
non-blocking) · **gate** (blocks phase exit until pass/sign-off) · **rec**
(surfaced, skippable).

| id            | phase   | type   | trigger                  | skill/cmd                          | block |
|---------------|---------|--------|--------------------------|------------------------------------|-------|
| premise-check | think   | always | during framing           | critical-thinker                   | -     |
| frame-hats    | think   | rec    | ambiguous/multi-stakeholder problem | six-thinking-hats-coach   | -     |
| first-princ   | think   | rec    | novel/contested problem  | first-principles-agent             | -     |
| strat-fit     | think   | rec    | portfolio/product scope  | tows-strategy-analyst              | -     |
| threat-model  | think   | gate   | before any spec (G1)     | NAMED CHECKLIST (security-gates.md)| yes\* |
| reverse-spec  | plan    | rec    | refactor entry only      | code-review-graph (map→reverse-spec) | -   |
| brainstorm    | plan    | rec    | open solution space      | superpowers:brainstorming          | -     |
| write-plan    | plan    | rec    | before leave plan        | superpowers:writing-plans          | -     |
| design-review | plan    | gate   | before leave plan        | council-advisor, gstack:/plan-eng-review | yes |
| prompt-opt    | plan    | rec    | before delegating to muscle | the-master-prompt-optimization-architect | - |
| xmodel-plan   | plan    | rec    | before Build             | gstack:/codex or Copilot/Gemini    | -     |
| tdd           | build   | always | code change              | superpowers:test-driven-development| -     |
| subagent-dev  | build   | rec    | parallelizable work      | superpowers:subagent-driven-development | - |
| incr-review   | build   | always | each change              | code-review-graph + review         | -     |
| sast          | build   | always | code change              | `<SAST tool>`                      | -     |
| dep-scan      | build   | always | dependency change        | `<dep/secrets scanner>`            | -     |
| ts-tooling    | build   | rec    | TypeScript stack         | mattpocock/skills                  | -     |
| fe-tooling    | build   | rec    | frontend stack           | addyosmani/agent-skills            | -     |
| coverage      | build   | gate   | before leave build       | coverage >= `<X>%`                 | yes   |
| mutation      | build   | rec    | high-risk module         | `<mutation tool>`                  | -     |
| staff-review  | review  | gate   | before leave review      | gstack:/review                     | yes   |
| council-rev   | review  | rec    | high-stakes/risky change | council-advisor                    | -     |
| xmodel-review | review  | rec    | risky module             | Copilot/Gemini                     | -     |
| acceptance    | test    | gate   | before leave test        | run Given/When/Then (Spectra BDD)  | yes   |
| integration-qa| test    | gate   | before leave test        | integration suite                  | yes   |
| e2e-qa        | test    | rec    | user-facing change       | e2e suite                          | -     |
| perf-qa       | test    | rec    | perf-sensitive change    | load/perf (addyosmani if frontend) | -     |
| sec-review    | ship    | gate   | before release (G2)      | NAMED CHECKLIST (security-gates.md)| yes\* |
| notes-tone    | ship    | rec    | external release notes   | adaptive-communication-architect   | -     |
| notes-polish  | ship    | rec    | external release notes   | business-english-enhancer          | -     |
| retro         | reflect | always | end of cycle             | gstack:/retro, gstack:/learn       | -     |
| harvest-skill | reflect | rec    | retro yields a reusable pattern | skill-creator               | -     |

\* security/destructive gate → pause for human even in HIGH, even if green. HIGH never auto-signs.

## Pool coverage (what's wired, what's deliberately NOT)
Every local user-pool skill is accounted for — wired to a phase or explicitly
excluded with a reason. Excluding with a reason beats forcing a bad fit.

**Wired (above):** critical-thinker, six-thinking-hats-coach, first-principles-agent,
tows-strategy-analyst (Think); the-master-prompt-optimization-architect (Plan);
council-advisor (Plan gate + Review rec); adaptive-communication-architect,
business-english-enhancer (Ship); skill-creator (Reflect).

**Not a registry row — by design:**
- `url-safety-validator` — already a named item inside the G2 checklist
  (security-gates.md). One control, one home; no duplicate row.
- `atlassian-rest-api` — domain reference invoked *inside* Build work for the
  Atlassian pilot, not a lifecycle gate. Lives in the work, not the spine.
- `mastery-tutor` — learner-facing; outside the build lifecycle entirely.
- `anthropics/skills` (REFERENCE lib) — authoring catalog, NOT invoked at
  runtime per the harvest rules. It is reference material consulted by the
  `harvest-skill` rec row during Reflect, not an executable check. No runtime row.

## Upstream library coverage (HARVESTED / CONDITIONAL / REFERENCE)
Every upstream lib from the PLUGINS section is now accounted for in the registry
or explicitly excluded.

**HARVESTED — fully wired:**
- gstack (REQUIRED spine) — /office-hours, /plan-eng-review, /review, /retro,
  /learn, /codex, /document-release across phases; /cso inside G1/G2 checklists.
- Spectra (REQUIRED BDD) — discuss/propose/apply/archive nested per phase;
  ingest = cross-cutting sub-loop; Given/When/Then → acceptance gate in Test.
- superpowers — brainstorming + writing-plans (Plan rec), test-driven-development
  (Build always), subagent-driven-development (Build rec). All four named
  sub-skills now have rows. Do NOT import other superpowers parts as a spine.
- code-review-graph — incr-review (Build always, MCP) + reverse-spec (Plan rec,
  refactor entry only). MCP must be configured per project or incr-review can't run.

**CONDITIONAL — wired with stack triggers:**
- mattpocock/skills — ts-tooling (Build rec, trigger: TypeScript). Skip non-TS.
- addyosmani/agent-skills — fe-tooling (Build rec) + named inside perf-qa (Test
  rec). Both trigger only on frontend/web-perf work. Skip otherwise.

**Type discipline held:** no upstream lib was promoted to `gate`. Continuous
Build activity stays in the two existing always-rows (tdd, incr-review); every
harvested/conditional helper is `rec` so it never blocks flow — "add rigour,
never add scope."

## Type discipline (pool skills)
Only `critical-thinker` was added as `always` (continuous premise-challenge in
Think, non-blocking). Every other pool skill is `rec` — none promoted to `gate`.
Gates block flow; reasoning/communication aids must stay skippable.

## Add an activity (recipe)
Pick phase + type + trigger + skill → append ONE row. Never edit the spine or
the router. Swap placeholders (`<SAST tool>`, `<dep/secrets scanner>`,
`<mutation tool>`, `coverage >= <X>%`) for the real stack when wiring a project.
