---
name: ts-pl
description: "Portable PLDD enforcement kernel"
---

# Pattern Language Delivery Discipline

Use this skill when validating project layer imports, stable design-by-contract
identities, or Discovery ownership-to-scenario coverage. Phase A is a portable
kernel: run commands directly against a project or isolated fixture.

## Kernel contract

<!-- PL-KERNEL-CONTRACT:START -->
```text
COMMAND pl-arch-check: node src/scripts/pl-arch-check.mjs --root <project> --manifest <layers.map.json> --format json
COMMAND pl-contract-check: node src/scripts/pl-contract-check.mjs --root <project> --source <path> --test <path> --format json
COMMAND gen-scenarios: node src/scripts/gen-scenarios.mjs --input <exploration.json> [--scenarios <spec.md>] [--format json]
DIAGNOSTIC: {version, rule_id, severity, file, dependency, message}; project-relative paths
EXIT: 0 compliant; 1 rule violation; 2 invalid input or unsupported syntax
RULE_IDS: PL-ARCH-MANIFEST-VERSION, PL-ARCH-INVALID-MANIFEST, PL-ARCH-UNSUPPORTED-GLOB, PL-ARCH-UNMATCHED-LAYER, PL-ARCH-AMBIGUOUS-LAYER, PL-ARCH-UNSUPPORTED-SYNTAX, PL-ARCH-PATH-ESCAPE, PL-ARCH-UNRESOLVED-ALIAS, PL-ARCH-UNRESOLVED-IMPORT, PL-ARCH-EXTERNAL-IMPORT, PL-ARCH-FORBIDDEN-IMPORT, PL-CONTRACT-UNSUPPORTED-SYNTAX, PL-CONTRACT-DUPLICATE-ID, PL-CONTRACT-MISSING-TEST, PL-CONTRACT-ORPHAN-TEST, PL-SCENARIO-OWNERSHIP, PL-SCENARIO-MISSING-EVENT
ACTIVATION: none; direct commands and fixtures only; no hooks, router entries, live registry, or dogfood
HOST: neutral Phase A outputs; Codex/Claude parity is not claimed
```
<!-- PL-KERNEL-CONTRACT:END -->

## Workflow

1. Read `references/layers-map.md`; run architecture check.
2. Read `references/contracts.md`; run contract identity check.
3. Read `references/scenario-compile.md`; generate skeletons or check completed coverage.
4. Treat exit 2 as invalid input requiring correction before rule violations.

Phase A installs no workflow integration and changes no consumer configuration.
