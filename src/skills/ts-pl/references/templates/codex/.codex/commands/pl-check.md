# pl-check (Codex)

Runs the portable PLDD enforcement kernel against the current project and
displays its output unchanged.

## Invocation

The kernel owns every rule, diagnostic, and exit-code decision. This command
only selects the kernel command to run and prints what it returns:

- Architecture check: run the kernel's architecture command against the
  project's layer manifest.
- Contract check: run the kernel's contract command against the project's
  source and violation-test files.
- Scenario compilation: run the kernel's scenario command against the
  project's exploration model.

Exit code and stdout/stderr come directly from the kernel command. This
adapter does not remap exit codes or add host-specific advice on top of the
kernel's diagnostics.

## Display

Passthrough — the kernel's JSON or text diagnostics are shown as-is.
