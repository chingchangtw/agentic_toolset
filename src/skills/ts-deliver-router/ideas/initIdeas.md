# Ideas — Agentic Dev Workflow Design Session

Reference record of the Six Thinking Hats session that produced the `ts-deliver-router` skill. Kept so the *reasoning* behind the design survives, not just the artifact.

---

## Goal

Build a set of workflows to develop **and** manage software products with agentic coding agents (Claude Code, Copilot, Gemini).

Constraints gathered:
- Operator is **not** a craft agentic-coding dev — the flow must *guide*, not just execute.
- Must deliver: speed, quality, consistency across team, onboarding, governance.
- Full lifecycle including **idea discovery**; flexible start point.
- **Claude Code primary** (agentic hub); Copilot/Gemini alongside.
- Must use **Spectra** + the listed skill libraries.
- Any software domain. Personal → maybe team. Mixed-skill, mid-level engineers.
- Both **single-change** and **portfolio** scope.

---

## Toolkit (White Hat facts)

| Resource | What it is | Layer |
|---|---|---|
| **Spectra** | SDD app + skills. discuss→propose→apply→ingest→archive. OpenSpec format. Cross-agent. | Spec / intent spine |
| **superpowers** (obra) | Full dev methodology as skills: brainstorm→worktrees→plans→subagent-dev→TDD→review→finish. TDD-first. | End-to-end process |
| **gstack** (Garry Tan) | 23+ role-based slash commands: office-hours→CEO/eng/design review→build→review→QA→ship→retro. GBrain memory, /learn, /retro. | End-to-end process |
| **code-review-graph** | Tree-sitter knowledge graph via MCP. Feeds agents only relevant context (6.8×–49× token cut). | Context-efficiency layer |
| **anthropics/skills**, **mattpocock/skills**, **addyosmani/agent-skills** | Curated skill libraries (official; TS; frontend/web-perf). | Skill component supply |

**Key tension:** Spectra, superpowers, and gstack are three *competing* process spines. Pick one, harvest the others.

---

## Decisions that emerged

1. **Spectra = spine** (full BDD lifecycle), local to the repo, no Jira/Confluence required.
2. **Claude Code = agentic hub.**
3. Other tools = **organs nested per phase** / a parts bin — never run as competing spines.
4. Priority order when harvesting: **Spectra > gstack > superpowers + mattpocock/skills.**
5. The real design requirement is a **next-step recommender (GPS)** — "use a skill, then ask what stage and skills come next" — not a fixed pipeline.
6. **Autonomy dial: HIGH (auto) / MID (recommend) / LOW (suggest).** Same SOP serves operator, teammate, rookie.
7. **Token-tiered agent division:** Claude Code = judgment/orchestration; Copilot/Gemini = cheap implementation, docs, git, Spectra mechanical work.
8. **Two security gates** (early threat/privacy + pre-deploy /cso + url-safety) — pause for human sign-off **even in HIGH mode**.
9. **Review by three signals:** artifacts + token cost + chain of AI chat.
10. **Refactor entry:** code-review-graph maps codebase → reverse-spec → feeds `propose`.
11. **Monthly refresh** of spine + organs (upstream churn).
12. **Privacy-skill gap** noted — build a small `privacy-review` skill, or fold into `/cso` + `critical-thinker`.

---

## Pilot (chosen to prove the workflow)

Atlassian-admin productivity tool:
- Execute Atlassian REST APIs from JSON/CSV input (bulk housekeeping).
- Record admin browser activity → convert into repeatable browser steps (for manual-only console operations).

**Why well-chosen:** plays to the operator's deepest expertise (Atlassian admin) → can judge agent output expertly.

**Sharp risk the workflow must catch:** irreversible bulk operations on a production admin console + browser-record/replay as a classic injection/credential-leak surface. → This is *why* the two security gates exist. Note: operator's gut read was "no risk," which diverges from the design's two gates — so the gates are designed to worry on the operator's behalf.

---

## Hat-by-hat highlights

- **White:** mapped layers; surfaced the three-spine tension.
- **Green:** "one spine, many organs" shape; the recommender as the real requirement; greenfield vs refactor entries; nested loops (portfolio ⊃ change).
- **Yellow:** GPS layer lets a non-expert operate near-expert; spec-as-context kills context-switch loss; pilot plays to expertise; cross-agent = cheap second opinion.
- **Black:** thin hands-on hours vs ambitious design; recommender is least-proven yet central; three spines fragile to upstream churn; pilot's real production danger; "optimizing the factory before making one product" risk.
- **Red:** energized, all-go; one honest divergence (two gates vs "no risk").

---

## Open items / next actions

1. Codify SOP as one page (`SKILL.md` / `README.md`). — done in this package.
2. Build `ts-deliver-router` skill, **MID mode first**; add HIGH/LOW after it proves out.
3. Smallest experiment this week: run the Atlassian pilot through **only `discuss` + Security Gate #1** on one real function (the REST-API-from-CSV piece). Prove the front of the pipe before building the whole factory.
4. Decide the **privacy-review** skill: build vs fold into `/cso` + `critical-thinker`.
5. Cross-tool portability confirmed: same `SKILL.md` runs in Claude Code, Copilot CLI, and VS Code agent mode — place at `.claude/skills/ts-deliver-router/SKILL.md`.

---

## Extension model (added)

TDD / code-review / QA / security activities are **not** hardcoded into the spine. They live in a **CHECKS REGISTRY** where each row = (phase, type, trigger, skill, blocks-exit). Three types: **always** (continuous, non-blocking), **gate** (blocks phase exit), **rec** (surfaced, skippable). The two security gates are just the first two gate rows. Adding any future check = append one row; the spine and router never change. QA's contract is the Given/When/Then scenarios from `propose` — acceptance tests are derived from the spec, not bolted on.
