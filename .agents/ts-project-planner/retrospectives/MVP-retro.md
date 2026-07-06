# Iteration Retrospective — MVP

Closed: 2026-07-05

## Summary
- Epics shipped: 1 (EPIC-GOLDEN-TEMPLATES)
- Epics deferred: 0
- Release exit criteria: 4/4 pass (verified 2026-07-05; criteria 1&2 rest on manual scratch-project verification at Build time, no automated regression harness — SKILL.md prose logic, not compiled code)

## Epic detail

### EPIC-GOLDEN-TEMPLATES — Golden agent-context templates, recommended-to-add by ts-project-init-advisor
- Type: epic | Priority: high | Mutation score: 100% (61/61 killed)
- Shipped: 2026-07-04 (commits bb298a1, 950a9fc, plus 1b395c0, f135276, 46a7952)
- G1 (threat-model): signed_off — ctony, 2026-07-04
- G2 (sec-review): signed_off — ctony, 2026-07-05, via **explicit human-approved deviation**. OWASP checklist items and SAST (semgrep) were not individually run; epic had already merged before sign-off. trivy dep-scan (0 secrets, 0 misconfigs, 9 transitive dev-dependency vulns) and stryker mutation (100%) are the only automated verification behind this gate. Not a template for future epics — see carry-forward risk below.
- Full narrative retro: `.agents/ts-deliver-router/artifacts/reflect/retro.md`

## Registry/tooling changes this iteration
- trivy and stryker moved pending-setup → active (both genuinely runnable now)
- semgrep, github-mcp, and 3 sub-agent build specs remain pending-setup

## Carry-forward risk (into next release)
- trivy's 9 dependency vulns (1 critical, 2 high, 4 medium, 2 low, all transitive devDependencies in vitest/vite/stryker chain) — time-bounded risk acceptance, not a permanent waiver. Revisit when stryker-vitest-runner supports vitest >=2.0.0.
- G2 gate ran retroactively (post-ship), not before Ship as the spine intends. Process gap, not a code gap — future epics should not repeat this ordering.
- Discovery idea-001's unvalidated M-risk assumptions (MODIFY gap-analysis distinguishing customization from drift; golden-set maintenance commitment; installer/advisor coexistence) remain open — no incidents yet, revisit if advisor MODIFY recommendations generate user complaints.

## Discovery status
idea-001 marked shipped, source_epic linked. No other ready ideas queued at close. Run `/ts-discover:status` to check for new ready items for the next release.
