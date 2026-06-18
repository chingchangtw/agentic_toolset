# Setup Gaps — Installation Instructions

When `/ts-deliver status` or routing logic detects a `tier=pending-setup` tool,
direct the user here for setup steps.

---

## GitHub MCP

**Role:** Branch/PR/release operations across Plan→Build→Review→Test→Ship

**Setup:**
```bash
# Option A — official MCP server
npx @modelcontextprotocol/server-github

# Option B — via Claude Code MCP config
# Add to .claude/mcp.json:
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your PAT>"
      }
    }
  }
}
```

**Required PAT scopes:** `repo`, `read:org`, `workflow`

**Resolve in registry:**
```json
{ "id": "github-mcp", "tier": "active" }
```

---

## Semgrep (SAST)

**Role:** Static analysis — Build (always) + Review G1 gate

**Setup:**
```bash
# Install
pip install semgrep

# Run with OWASP ruleset
semgrep --config=p/owasp-top-ten src/

# Run with auto-detect ruleset
semgrep --config=auto src/

# CI integration — zero-exit on high/critical
semgrep --config=auto --severity=ERROR src/ --error
```

**STRIDE-mapped rules:** `p/default`, `p/owasp-top-ten`, `p/secrets`

**Resolve in registry:**
```json
{ "id": "semgrep", "tier": "active" }
```

---

## Trivy (Dependency + Secrets Scan)

**Role:** dep/secrets scan — Build (always) + Test G2 gate

**Setup:**
```bash
# Install (macOS)
brew install aquasecurity/trivy/trivy

# Install (Linux)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Scan dependencies
trivy fs --scanners vuln .

# Scan secrets
trivy fs --scanners secret .

# Combined CI scan (fail on HIGH+)
trivy fs --scanners vuln,secret --severity HIGH,CRITICAL --exit-code 1 .
```

**Resolve in registry:**
```json
{ "id": "trivy", "tier": "active" }
```

---

## Stryker Mutator (TypeScript / JavaScript)

**Role:** Mutation testing — Test G2 gate

**Setup:**
```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/typescript-checker \
  @stryker-mutator/jest-runner

npx stryker init

npx stryker run
```

**Minimum `stryker.config.mjs`:**
```javascript
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  mutate: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/index.ts"],
  thresholds: { high: 80, low: 60, break: 50 }
};
```

**Resolve in registry:**
```json
{ "id": "stryker", "tier": "active", "threshold": 85 }
```

---

## PITest (Java)

**Role:** Mutation testing — Test G2 gate

**Setup (Maven):**
```xml
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>1.15.3</version>
  <configuration>
    <targetClasses><param>com.yourpackage.domain.*</param></targetClasses>
    <targetTests><param>com.yourpackage.domain.*Test</param></targetTests>
    <mutators><mutator>STRONGER</mutator></mutators>
    <outputFormats><outputFormat>HTML</outputFormat></outputFormats>
  </configuration>
</plugin>
```

```bash
mvn org.pitest:pitest-maven:mutationCoverage
```

**Resolve in registry:**
```json
{ "id": "pitest", "tier": "active", "threshold": 85 }
```

---

## mutmut (Python)

**Role:** Mutation testing — Test G2 gate

**Setup:**
```bash
pip install mutmut

# Run
mutmut run

# View results
mutmut results

# Show surviving mutant diff
mutmut show <id>
```

**Resolve in registry:**
```json
{ "id": "mutmut", "tier": "active", "threshold": 85 }
```

---

## code-review-graph MCP

**Role:** Incremental code review — Build (always) + Review (always)

**Setup:**
```bash
# Clone and install
git clone https://github.com/tirth8205/code-review-graph
cd code-review-graph
npm install

# Add to .claude/mcp.json:
{
  "mcpServers": {
    "code-review-graph": {
      "command": "node",
      "args": ["<path-to-code-review-graph>/index.js"]
    }
  }
}
```

**Note:** This is a required tool. If not configured, the router will surface a
blocking setup gap warning before entering Build phase.

**Resolve in registry:**
```json
{ "id": "code-review-graph", "tier": "active" }
```

---

## Sub-Agents (build tasks)

See `references/sub-agents.md` for full build specs.

Quick summary of where each agent file lives once built:

| Agent | File path |
|---|---|
| ts-event-storming-facilitator | `.claude/agents/ts-event-storming-facilitator.md` |
| ts-spec-validator | `.claude/agents/ts-spec-validator.md` |
| ts-ddd-tactical-validator | `.claude/agents/ts-ddd-tactical-validator.md` |
| ts-mutation-analyst | `.claude/agents/ts-mutation-analyst.md` |

**Resolve in registry after building:**
```json
{ "id": "<agent-id>", "tier": "active" }
```
