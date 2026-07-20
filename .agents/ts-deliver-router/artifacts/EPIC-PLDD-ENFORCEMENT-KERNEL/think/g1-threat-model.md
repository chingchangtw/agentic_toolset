# G1 Threat Model — PLDD Enforcement Kernel

## Data flow

```text
project source + layers manifest
          ↓ validate/parse within project root
portable enforcement kernel
          ↓
stable diagnostic + process exit code
```

## STRIDE summary

| Category | Exposure | Control |
|---|---|---|
| Spoofing | No identity boundary | N/A; local caller authority |
| Tampering | Crafted paths, manifests, imports | schema checks, root containment, fail-closed syntax |
| Repudiation | Diagnostic provenance ambiguity | stable rule id, source path, deterministic output |
| Information disclosure | Source paths in diagnostics | project-relative paths only; no source content/secret emission |
| Denial of service | Excessive files or cycles | bounded traversal and deterministic cycle handling |
| Elevation of privilege | No command execution from parsed content | parser never evaluates source or manifest values |

## Approval boundary

G1 approves planning Phase A only. It does not approve implementation, dependency installation, Phase B activation, or dogfood activation.

