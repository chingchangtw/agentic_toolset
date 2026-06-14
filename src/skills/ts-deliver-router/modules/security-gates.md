# module: security-gates (named checklists, not "lean on")

Loaded when: exiting Think (G1), entering Ship (G2), or any gate sign-off (algo step 5).

Both gates BLOCK regardless of autonomy. HIGH never auto-signs. Checklist incomplete = red gate.
Results write to `state.gates[id].checklist_results`.
Dry-run: checklists display, CANNOT be signed →
`[DRY-RUN] cannot sign security gate in dry-run mode`. No write to state.gates.

Pass condition: `status = signed_off` AND every item `true` AND `signed_by` + `signed_at` recorded.

## G1 — threat-model (end of Think)
- [ ] STRIDE applied per identified data flow.
- [ ] Privacy data inventory: collected/stored/transmitted; retention per class. (Surfaces unresolved linked Discovery ideas; resolve or accept risk in state.gates.G1.notes)
- [ ] Authentication/authorization model documented.
- [ ] Never-automate list: explicit, enumerated irreversible operations.
- [ ] Blast-radius bounds: rate limits + scope limits stated.
- [ ] Recovery path documented for every irreversible operation.
- [ ] Human sign-off (`signed_by` + `signed_at`).

## G2 — sec-review (start of Ship)
- [ ] OWASP Top 10 per category (incl. LLM-specific if AI-facing).
- [ ] All external URLs validated by `url-safety-validator`.
- [ ] Input validation/sanitization at every entry point.
- [ ] No hardcoded credentials; secrets via secure store; rotation policy stated.
- [ ] Logging excludes PII/credentials; audit trail in place.
- [ ] Rollback path tested.
- [ ] Rate limiting / circuit breakers in place.
- [ ] Every irreversible operation requires explicit confirmation.
- [ ] Human sign-off (`signed_by` + `signed_at`).

## Known gap
No dedicated privacy skill. Checklist items carry the load. Open decision:
build `privacy-review` check vs. fold into gstack:/cso + critical-thinker.
