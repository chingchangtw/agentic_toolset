# Gate Checklists

## G1 — Security Review Gate (Review phase)

Human sign-off required. Results written to `state.gates.G1`.

### STRIDE Threat Model

For each trust boundary and data flow in scope:

```
[ ] Spoofing
    - Are all callers authenticated before accessing sensitive operations?
    - Are API keys / tokens validated on every request?

[ ] Tampering
    - Is all input validated and sanitized at the boundary (Value Objects / Guard Clauses)?
    - Are integrity checks in place for persisted data?

[ ] Repudiation
    - Are all state-changing operations logged with actor + timestamp?
    - Is the audit log tamper-resistant?

[ ] Information Disclosure
    - Are error messages free of stack traces / internal details in production?
    - Is PII excluded from logs?
    - Are secrets stored in env vars / vault, never in code?

[ ] Denial of Service
    - Are rate limits or input-size limits in place for expensive operations?
    - Are unbounded loops / queries guarded?

[ ] Elevation of Privilege
    - Are authorization checks on every protected route/action?
    - Is the principle of least privilege applied to service accounts and MCPs?
```

### OWASP Top 10 (relevant items for this project)

```
[ ] A01 Broken Access Control — authorization checked server-side, not client-side
[ ] A02 Cryptographic Failures — no plaintext secrets, TLS enforced
[ ] A03 Injection — parameterized queries, no string-concat SQL/JQL/CQL
[ ] A04 Insecure Design — threat model exists (STRIDE above)
[ ] A05 Security Misconfiguration — defaults hardened, debug off in prod
[ ] A06 Vulnerable Components — Trivy dep scan clean
[ ] A07 Auth Failures — session management reviewed
[ ] A08 Software Integrity — supply chain: only pinned deps
[ ] A09 Logging Failures — security events logged + monitored
[ ] A10 SSRF — outbound URLs validated (url-safety-validator skill)
```

### Tool results required

```
[ ] Semgrep: zero HIGH or CRITICAL findings
[ ] Trivy (secrets): zero findings
[ ] Privacy inventory reviewed: PII handling documented
```

### Sign-off record (written to state.gates.G1)

```json
{
  "status": "passed",
  "signed_off_by": "<name>",
  "signed_off_at": "<ISO datetime>",
  "stride_items_flagged": [],
  "owasp_items_flagged": [],
  "semgrep_findings": 0,
  "trivy_secrets_findings": 0,
  "notes": ""
}
```

---

## G2 — Quality Gate (Test phase)

Human sign-off required. Results written to `state.gates.G2`.

### BDD / Spectra

```
[ ] All Spectra scenarios pass (Given / When / Then green)
[ ] Scenarios archived (locked) — no post-archive edits
[ ] Scenario count matches Plan phase record in state.json
```

### Mutation Testing

```
[ ] Mutation tool run: Stryker (TS/JS) / PITest (Java) / mutmut (Python)
[ ] Mutation score ≥ registry threshold (see registry.json gates.G2)
[ ] Surviving mutant report reviewed
[ ] High-priority surviving mutants diagnosed:
    [ ] Boundary value mutants → Guard Clause / Value Object tests added?
    [ ] Return value mutants → Result/Either assertions added?
    [ ] Method removal mutants → DI spy tests added?
    [ ] State variable mutants → State Machine transition tests added?
```

### ACPL Post-Generation Checklist

```
[ ] Every branch has at least one test that dies if condition inverted
[ ] Every guard has at least one test that dies if guard removed
[ ] Every return value has a test asserting exact shape
[ ] Every state transition has a test asserting next state
[ ] No test passes trivially on empty function body
```

### Dependency re-scan

```
[ ] Trivy (dependencies + container): clean vs Review baseline
[ ] No new HIGH or CRITICAL CVEs introduced since G1
```

### Sign-off record (written to state.gates.G2)

```json
{
  "status": "passed",
  "signed_off_by": "<name>",
  "signed_off_at": "<ISO datetime>",
  "mutation_tool": "stryker|pitest|mutmut",
  "mutation_score": 0,
  "mutation_threshold": 85,
  "scenarios_total": 0,
  "scenarios_passing": 0,
  "trivy_new_findings": 0,
  "surviving_mutants_reviewed": true,
  "notes": ""
}
```
