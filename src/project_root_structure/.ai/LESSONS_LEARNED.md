# LESSONS_LEARNED.md

## How to use
Record only durable lessons that will improve future work in this repository.
Do not log temporary chatter.
Prefer compact entries.

---

## Entry Template

### [YYYY-MM-DD] Short title
- Context:
- Mistake or friction:
- Missed signal:
- Better rule:
- Reusable fix:
- Should we create a script, template, test, or agent?:

---

## Lessons

### [2026-04-28] Clarify data contract before coding
- Context: API integration task
- Mistake or friction: Started implementation before confirming response shape.
- Missed signal: Endpoint behavior and sample payload were not explicit.
- Better rule: Require sample payloads or schema before implementing transformations.
- Reusable fix: Add an API contract checklist template.
- Should we create a script, template, test, or agent?: Create an API contract reviewer agent.