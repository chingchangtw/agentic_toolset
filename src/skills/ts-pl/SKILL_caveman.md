---
name: ts-pl
description: "Portable PLDD enforcement kernel"
---

# PLDD Kernel

Need layer, contract, scenario truth. Run kernel direct. Read matching reference.

## Kernel contract

<!-- PL-KERNEL-CONTRACT:START -->
```text
COMMAND pl-arch-check: node src/scripts/pl-arch-check.mjs --root <project> --manifest <layers.map.json> --format json
COMMAND pl-contract-check: node src/scripts/pl-contract-check.mjs --root <project> --source <path> --test <path> --format json
COMMAND gen-scenarios: node src/scripts/gen-scenarios.mjs --input <exploration.json> [--scenarios <spec.md>] [--format json]
DIAGNOSTIC: {version, rule_id, severity, file, dependency, message}; project-relative paths
EXIT: 0 compliant; 1 rule violation; 2 invalid input or unsupported syntax
RULE_IDS: PL-ARCH-MANIFEST-VERSION, PL-ARCH-INVALID-MANIFEST, PL-ARCH-UNSUPPORTED-GLOB, PL-ARCH-UNMATCHED-LAYER, PL-ARCH-AMBIGUOUS-LAYER, PL-ARCH-UNSUPPORTED-SYNTAX, PL-ARCH-PATH-ESCAPE, PL-ARCH-UNRESOLVED-ALIAS, PL-ARCH-UNRESOLVED-IMPORT, PL-ARCH-EXTERNAL-IMPORT, PL-ARCH-FORBIDDEN-IMPORT, PL-CONTRACT-UNSUPPORTED-SYNTAX, PL-CONTRACT-DUPLICATE-ID, PL-CONTRACT-MISSING-TEST, PL-CONTRACT-ORPHAN-TEST, PL-SCENARIO-OWNERSHIP, PL-SCENARIO-MISSING-EVENT, PL-ADAPTER-PARITY, PL-ADAPTER-BOUNDARY
ACTIVATION: none; direct commands and fixtures only; no hooks, router entries, live registry, or dogfood
HOST: Codex and Claude Code fixture-only adapter parity proven, see references/host-adapters.md; no real-host or dogfood claim
```
<!-- PL-KERNEL-CONTRACT:END -->

## Route

Layer/import → `references/layers-map.md`.
Contract ids/tests → `references/contracts.md`.
Ownership/scenarios → `references/scenario-compile.md`.
Host adapter parity proof → `references/host-adapters.md`.
Exit 2 → fix input first.

Phase A/B. No consumer configuration change. Install tooling/dogfood = separate approved step.
