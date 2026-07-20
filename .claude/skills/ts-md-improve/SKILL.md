---
name: ts-md-improve
description: To afterward be operated by cheaper/weaker models — and the goal is to convert that one session's judgment into permanent, reusable systems rather than burn it on daily tasks. 
---
# description section
Use this skill whenever a high-capability model has one scarce, expensive session to spend on an agent harness (CLAUDE.md, subagents, MCP, skills, memory) that will afterward be operated by cheaper/weaker models — and the goal is to convert that one session's judgment into permanent, reusable systems rather than burn it on daily tasks. Trigger on phrases like "audit my CLAUDE.md", "improve my agent harness", "set up model orchestration rules", "externalize my judgment into checklists", "make my harness survive on Sonnet/Haiku", "write delegation templates for subagents", or "this is my one shot with the strong model, help me leave a system behind." Also trigger any time the user is about to spend a rare high-tier-model session on harness/infrastructure work rather than a one-off task. Do NOT use this skill for routine day-to-day task execution within an already-built harness — that's normal work; this skill is specifically for the meta-level act of building or upgrading the harness itself.

# Plan.md Improvement — Converting Scarce Judgment into Durable Systems

## Core idea

A capable model's session is a scarce, non-renewable resource. If it spends that session *doing* tasks, the value disappears when the session ends. If it spends that session *encoding judgment into files that weaker models can follow*, the value compounds every session afterward.

This skill is the repeatable procedure for that conversion. It generalizes a one-time mission brief (originally written for a single expensive session) into a process any orchestrating model can run whenever it finds itself in the same position: strong model, limited time/quota, harness that must keep working after the strong model is gone.

**The target reader of everything you produce is a weak/cheap model, not you.** Every rule must be concrete, testable, and paired with a positive and negative example. Abstract advice ("use good judgment", "be careful") is worthless to the target reader — treat any such phrase you catch yourself writing as a signal to stop and make it concrete.

## When NOT to use this

- The user wants a task done, not a system built. If they ask "fix this bug" or "write this doc", just do it.
- The harness doesn't exist yet and there's nothing to audit. Point them at `ts-project-scaffolder` / `ts-project-init-advisor`-style scaffolding first.
- The user has no cheaper-model handoff concern at all (single-model, single-session use). This skill's value proposition — durability across model tiers — doesn't apply.

## Operating rules (apply throughout)

1. **Inventory before output.** Before producing anything, check: the existing CLAUDE.md (or equivalent root instruction file), available subagents, which models/effort levels are actually configured and callable, MCP servers, installed skills, and any memory/state mechanism (e.g. `.router/state.json`). Report back explicitly in three buckets: **What was found / What is assumed / What could not be found.** Never guess at a model name or parameter — if you can't verify it, write `"Pending User Input"` and flag it, don't fill it from memory or training data.
2. **Ask up to 5 clarifying questions up front, then go autonomous.** Don't stop-and-ask repeatedly mid-task — that burns the same scarce resource this skill exists to protect.
3. **The Commander does not deploy to the field.** If subagents are available, delegate heavy reading, repo scanning, web search, batch edits, and verification to them. Only conclusions return to the main thread. If no subagents are available (e.g. plain Claude.ai chat), simulate this discipline by doing wide/repetitive work in scratch space and only writing polished conclusions into deliverables.
4. **Write as you go.** Save each deliverable to disk immediately after finishing it, before starting the next. Treat the session as interruptible at any moment — what's saved on disk is the only guaranteed output.
5. **Back up before modifying; prefer new files.** Never silently overwrite an existing root instruction file. Copy-then-edit, or write the new version alongside the old with a clear name, and let the user (or a later step) do the swap.
6. **Root instruction file size limits.** If you are rewriting a CLAUDE.md-equivalent: the body must stay ≤150 lines and act only as an index/router. Everything it permanently references (always-loaded files) must total ≤500 lines combined. Move anything longer into on-demand reference files loaded only when relevant. If you blow the budget, condense or split — don't just leave it oversized.
7. **Segment long work across sessions if needed.** If the time/quota window is tight, it's fine to span 2–3 sessions. Between segments, have a fresh-context agent (or, absent that, yourself after clearing assumptions) verify the prior segment's output before continuing — don't gamble everything on one uninterrupted run.

## Deliverables, in priority order

Produce these in order. If you run out of time/quota, stop after finishing the current item cleanly and hand off the rest via Deliverable G (below) — never leave a deliverable half-written.

### A. Quick Diagnosis (write first)
Identify the top 3 places the harness currently leaks tokens, loses focus, or produces errors most easily. For each: name the failure mode concretely, and attach a fix a weak model can execute without judgment calls.
- **Good example:** "Failure: subagent reports return full file contents instead of `file:line`, bloating the main thread. Fix: add to reporting contract — subagents may only return conclusions plus `path:line_number`; anything longer must be saved to a file and only the path returned."
- **Bad example:** "Failure: communication could be more efficient. Fix: improve reporting practices." (Not actionable — a weak model can't execute this.)

### B. Rewrite the root instruction file (e.g. CLAUDE.md)
Consolidate redundant entries, delete anything obsolete, and move long-form content out into reference files. Apply "explicit for weak models, blank canvas for strong models" — i.e. the index should route confidently without over-specifying content a strong model would infer anyway. Respect the size limits in Rule 6.

### C. Model Orchestration Guidelines (standalone file)
Must include, concretely:
- **The Commander does not deploy to the field** — restate as an explicit rule in this file too, since it's the one a delegating model reads before assigning work.
- **Three required elements of every delegated task**: Objective & Motivation, Acceptance Criteria, Report Format. A delegation missing any of these three is malformed — say so explicitly.
- **Explicit model + effort per task type**, using only verified real model identifiers (from Rule 1's inventory) — never invented or remembered ones.
- **Reporting contract**: subagents return conclusions and `file:line_number` references only; anything longer is saved to a file and only the path is returned to the main thread.
- **Escalation / de-escalation pathway**, with concrete triggers:
  - Weak model → escalate after 1 error on a task.
  - Mid-tier model → escalate after failing the *same* subtask twice consecutively, carrying the full failure trace forward.
  - Once a pattern is solved at a higher tier, de-escalate back to a cheap model for batch application of the fix.
  - Cap retries at 2 rounds per issue before mandatory escalation — don't allow infinite retry loops.
- **No self-verification.** A model (of any tier) never grades its own work. Delegate verification: read-back for files, execution/tests for code, second opinion or multi-answer jury voting for high-risk judgment calls.

### D. Externalized Judgment (standalone file)
Turn your own high-level judgment calls into rubrics/checklists a weak model can execute mechanically. Every rubric item needs one positive and one negative example. Must cover at minimum:
- When to escalate to a stronger model.
- When a task is actually complete (vs. looks complete).
- When to stop and ask the user rather than proceed autonomously.
- What signals mean "wrong direction, pivot" rather than "retry with more effort."
- How to verify a quality floor was met before marking something done.

### E. Task Delegation Prompt Templates
Fill-in-the-blank templates, each with acceptance criteria and report format baked in, for at least these task types: **Search, Implementation, Refactoring, Research, Review.** See `references/delegation-templates.md` for a starter set — copy and adapt to the actual harness rather than inventing from scratch each time.

### F. Maintenance Protocol
Specify explicitly:
- Which files weak models may edit autonomously.
- Which changes require asking the user first.
- Where hard-earned lessons get recorded (file + format), and at what size/count threshold they get condensed rather than left to grow unbounded.

### G. Letter to Future Sessions
Write down, honestly:
- Three important things the user didn't think to ask for, that you believe matter anyway.
- The most likely way this system degrades over time, and the concrete guard against it.
- Which of this run's outputs you have the *lowest* confidence in, and why — don't round this up to false confidence.

## Wrap-up (mandatory, do not skip)

1. Have a fresh-context agent (or, if none available, re-read everything cold yourself after a mental reset) adversarially review all deliverables for: conflicting rules, wrong paths/tool/model names, and phrasing a weak model could plausibly misread. Fix until clean.
2. Verify by read-back that every promised file actually exists on disk and is complete — don't trust your own write log.
3. Produce a 1-page summary: what changed, why, and exactly how to start using it in the very next session.
4. **If time/quota runs out mid-task:** stop production immediately, complete wrap-up steps 1–2 for whatever is finished, and move everything incomplete into Deliverable G as an explicit hand-off — never ship a silently-half-done deliverable.

## Honesty clause (non-negotiable)

Delegation, verification, and multi-sample evaluation can compensate for *execution* quality. They cannot compensate for genuinely ambiguous or taste-based judgment calls. When you hit one of those:
- Document the call explicitly and how it was handled (escalated to a stronger model / got an external second opinion / explicitly flagged as "cannot be resolved without the user").
- If uncertain about a fact (especially model names, versions, parameters, or platform behavior), look it up. If it can't be found, write it as unconfirmed rather than guessing — e.g. `"Unconfirmed; recommended to verify directly before relying on this."` Never fill a gap from memory when verification is possible and the fact could have changed.

## Reference files

- `references/delegation-templates.md` — starter fill-in-the-blank templates for Search / Implementation / Refactoring / Research / Review delegations.
- `references/judgment-checklist.md` — expanded rubric skeleton for Deliverable D with example items already filled in, to adapt rather than write from scratch.
