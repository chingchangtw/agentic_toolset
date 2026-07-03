# Mutation Testing Guide — ACPL Output

> How to run mutation testing on ACPL-generated code, interpret results,
> and fix surviving mutants by selecting better patterns.

---

## What is Mutation Testing?

Mutation testing inserts deliberate bugs (mutants) into source code and checks whether
your test suite kills them (tests fail). A surviving mutant = a gap in test coverage
that a normal line-coverage metric would miss.

ACPL patterns are designed to **maximize mutant kill rate** from the first generation.

---

## Tools by Language

| Language | Tool | Install |
|---|---|---|
| TypeScript / JavaScript | **Stryker Mutator** | `npm install --save-dev @stryker-mutator/core` |
| Java | **PITest** | Maven/Gradle plugin |
| Python | **mutmut** | `pip install mutmut` |
| Go | **go-mutesting** | `go install github.com/zimmski/go-mutesting/cmd/go-mutesting@latest` |
| C# | **Stryker.NET** | `dotnet tool install -g dotnet-stryker` |

---

## Stryker Quick-Start (TypeScript)

```bash
# 1. Install
npm install --save-dev @stryker-mutator/core @stryker-mutator/typescript-checker \
  @stryker-mutator/jest-runner

# 2. Init config
npx stryker init

# 3. Run
npx stryker run

# 4. View HTML report
open reports/mutation/mutation.html
```

**`stryker.config.mjs` for ACPL projects**:
```javascript
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  mutate: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/index.ts",        // barrel files — skip
    "!src/**/*.dto.ts",        // DTOs — skip pure data structures
  ],
  thresholds: {
    high: 80,
    low:  60,
    break: 50,   // fail CI below 50% mutation score
  },
};
```

---

## PITest Quick-Start (Java / Maven)

```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>1.15.3</version>
  <configuration>
    <targetClasses>
      <param>com.yourpackage.domain.*</param>
    </targetClasses>
    <targetTests>
      <param>com.yourpackage.domain.*Test</param>
    </targetTests>
    <mutators>
      <mutator>STRONGER</mutator>
    </mutators>
    <outputFormats>
      <outputFormat>HTML</outputFormat>
      <outputFormat>XML</outputFormat>
    </outputFormats>
    <failWhenNoMutations>false</failWhenNoMutations>
  </configuration>
</plugin>
```

```bash
mvn org.pitest:pitest-maven:mutationCoverage
# report: target/pit-reports/
```

---

## mutmut Quick-Start (Python)

```bash
# Run
mutmut run

# View results
mutmut results

# Show surviving mutant diffs
mutmut show <id>

# Apply surviving mutant to file (inspect what survived)
mutmut apply <id>
```

---

## Reading Results — What to Look For

### High-Priority Surviving Mutants

These indicate critical test gaps. Fix immediately:

| Surviving Mutant Type | Pattern to Apply |
|---|---|
| Boundary condition (`>` → `>=`) | Guard Clause + Value Object |
| Return value replaced with null | Explicit Empty + Result/Either |
| Conditional deleted (whole `if` removed) | Specification (named predicate) |
| Method call removed | Dependency Injection + spy test |
| State assignment removed | State Machine + transition assertion |

### Acceptable Surviving Mutants

These are low-risk and commonly surviving; document why they're acceptable:

| Surviving Mutant | Why Acceptable |
|---|---|
| String literal replaced in error message | Message content is cosmetic |
| Log statement removed | Logging is informational, not correctness |
| `console.log` / debug trace removed | Same as above |
| Unreachable `default` in exhaustive switch | TypeScript compiler handles exhaustiveness |

---

## Linking Surviving Mutants Back to ACPL Patterns

When a mutant survives, run this diagnosis:

```
1. What code was mutated?
   → Look at the mutant diff.

2. What pattern *should* govern that code?
   → Check SKILL.md Pattern Groups.

3. Is the pattern applied correctly?
   → Check references/patterns.md for the pattern's Test Strategy section.

4. What test is missing?
   → The pattern's Mutation Sensitivity Note lists exactly which test kills it.

5. Add the missing test → re-run mutation testing.
```

---

## Target Mutation Score by Phase (ACPL + ts-deliver-router)

| ts-deliver-router Phase | Target Mutation Score | Notes |
|---|---|---|
| Build (initial) | ≥ 60% | Early pass — patterns applied, basic tests |
| Review | ≥ 75% | After code review, add missing assertions |
| Test | ≥ 85% | Required to pass G2 security gate |
| Ship | ≥ 85% | Maintained; CI fails below 50% |

---

## CI Integration (GitHub Actions example)

```yaml
name: Mutation Testing
on:
  pull_request:
    branches: [main]

jobs:
  stryker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx stryker run
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: mutation-report
          path: reports/mutation/
```

---

## ACPL + Mutation Testing Workflow Summary

```
Problem Frame Spec
       ↓
ACPL pattern selection (SKILL.md + problem-frame-map.md)
       ↓
AI code generation (Claude Code, patterns applied)
       ↓
BDD tests generated (Spectra Given/When/Then)
       ↓
Unit tests + spy assertions added per pattern
       ↓
Stryker / PITest run
       ↓
Surviving mutants diagnosed → missing pattern or test identified
       ↓
Pattern reapplied or test added
       ↓
Re-run → score ≥ 85% → proceed to G2 gate
```
