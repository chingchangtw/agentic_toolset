# EPIC-PLDD-ENFORCEMENT-KERNEL — Think Framing

## Goal

Build Phase A portable enforcement kernel entirely below `src/*`: architecture/placement checks, stable diagnostics, contract-id parity, versioned ownership relations, scenario compilation, and fixture verification.

## In scope

- Zero-new-dependency, fail-closed TypeScript/JavaScript import checker.
- Explicit supported import syntax in Phase A spec.
- `layers.map.json` schema and stable rule ids.
- Contract ids and violation-test identity checks.
- `ownership_relations_v1` with legacy arrays preserved.
- Deterministic scenario skeleton and event-coverage checks.
- Host-neutral golden fixture outputs that later Codex/Claude adapters must reproduce.

## Out of scope

- Root `package.json`, lockfile, hooks, router, live registry, or project configuration changes.
- Consumer adapters, cards, templates, and installer behavior; owned by Phase B.
- Dogfood activation; separate later approval.
- Persistent Build station state.

## Key risk

Parser credibility. Phase A must enumerate supported static/dynamic import forms and return a stable unsupported-syntax diagnostic instead of silently accepting uncertain input.

## Invariants

1. Every implementation change remains under `src/*`.
2. No new npm dependency.
3. Repeated host-neutral fixture runs produce the same normalized rule id, diagnostic, and exit code; Phase B owns host-adapter parity.
4. Existing Discovery string arrays retain their types.
5. Unsupported syntax fails closed.

## G1 evidence

- STRIDE: local file input → parser/checker → JSON/text diagnostic and exit code. Tampering risk is malformed manifest/source designed to bypass checks; mitigate with schema validation, path containment, fail-closed parsing, and deterministic diagnostics. Spoofing, repudiation, information disclosure, denial of service, and elevation introduce no new remote/auth boundary; bound input to fixture/project root and reject traversal.
- Privacy: source paths and rule ids only; no credentials, PII collection, telemetry, or network transmission.
- Auth: none; local CLI over caller-authorized files.
- Blast radius: `src/*` deliverables and isolated fixtures only.
- Recovery: revert Phase A files or remove generated fixture output; no live configuration/state migration.
- Never automate: see `never_automate.md`.
