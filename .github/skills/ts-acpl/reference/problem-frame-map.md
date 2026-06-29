# Problem Frame → Pattern Decision Map

> Use this file when you have a Problem Frame spec and need to select the right
> pattern group before generating code.

---

## Problem Frame Primer (for AI agent context)

Michael Jackson's Problem Frames classify problems by the nature of the relationship
between software and the world it affects. The five canonical frames:

| Frame | Core Question | World Relationship |
|---|---|---|
| **Commanded Behaviour** | "Do this when I say so" | User triggers discrete actions |
| **Information Display** | "Show me what's happening" | System observes and reports |
| **Workpiece** | "Help me create/edit this thing" | User manipulates a document/entity |
| **Transformation** | "Convert this data" | Batch pipeline, no user interaction |
| **Control** | "Keep this under control" | System manages a physical/external process |

---

## Decision Tree

```
START: What is the primary relationship between code and world?

├── User triggers an action (command/request)
│   └── COMMANDED BEHAVIOUR
│       ├── Is input validation critical? → Guard Clause + Value Object
│       ├── Is the action reversible/auditable? → Command Object
│       ├── Does the action change state? → State Machine
│       └── Return success/failure to caller? → Result / Either

├── System reads and reports data
│   └── INFORMATION DISPLAY
│       ├── Query has complex filter logic? → Specification
│       ├── Output must never return null? → Explicit Empty + Null Object
│       └── Calculation is pure? → Pure Function

├── User edits a document or domain entity
│   └── WORKPIECE
│       ├── Entity has invariants across child objects? → Aggregate Root
│       ├── Entity has a lifecycle with states? → State Machine
│       ├── Edit operations need audit trail? → Event Sourcing Slice
│       └── Validations are complex? → Guard Clause + Value Object

├── Batch data pipeline (no interactive user)
│   └── TRANSFORMATION
│       ├── Each step is a pure transform? → Pure Function
│       ├── Steps have different policies? → Policy Object
│       ├── Input from external system? → Anti-Corruption Layer
│       └── Output must be typed? → Result / Either + Typed Error Hierarchy

└── System controls external process or device
    └── CONTROL
        ├── State transitions are safety-critical? → State Machine (strict)
        ├── Commands go to external system? → Command Object + Repository Interface
        ├── Timing matters? → Clock Injection
        └── Logging is an audit requirement? → Logger Seam
```

---

## Frame + Scenario → Recommended Pattern Bundle

### Commanded Behaviour — Bulk REST API Execution
*(Your pilot: Atlassian admin bulk executor)*

```
Problem Frame: Commanded Behaviour
Scenario:      User submits JSON/CSV of Jira REST requests;
               system executes in batch, reports per-item results.

Recommended Bundle:
  Value Object        → IssueKey, ProjectKey — validate at parse time
  Guard Clause        → reject malformed entries early
  Result / Either     → per-item success/failure, no exceptions
  Command Object      → each REST call as an executable command
  Repository Interface → Jira client behind interface; fake for tests
  Typed Error Hierarchy → ValidationError vs ApiError vs NetworkError
  Logger Seam         → audit log of every executed command

Mutation targets:
  Boundary guards (key format regex) → killed by invalid-key tests
  Per-item Result shape → killed by asserting error.code on failure
  Command.execute() body → killed by spy asserting API call was made
```

### Workpiece — Confluence Page Template Editor
```
Problem Frame: Workpiece
Recommended Bundle:
  Aggregate Root      → Page owns Sections; section count limit is invariant
  Value Object        → PageTitle, SectionContent
  State Machine       → Draft → Published → Archived
  Command Object      → EditSection, PublishPage (reversible)
  Result / Either     → all mutations return typed result
```

### Information Display — Jira Dashboard Query
```
Problem Frame: Information Display
Recommended Bundle:
  Specification       → composable issue filter predicates
  Pure Function       → metric calculation (e.g., cycle time)
  Explicit Empty      → queries return [] not null
  Null Object         → missing assignee = UnassignedUser object
  Repository Interface → JiraQueryRepository; fake for tests
```

### Transformation — JSM → Google Sheets Export
```
Problem Frame: Transformation
Recommended Bundle:
  Anti-Corruption Layer → translate JSM response to domain model
  Pure Function         → row mapping, aggregation
  Policy Object         → column selection policy (configurable)
  Result / Either       → per-row transform result
  Typed Error Hierarchy → ParseError vs MappingError vs ExportError
```

---

## Pattern Compatibility Matrix

Some patterns are natural pairs; others conflict. Use this table to avoid awkward
combinations.

| Pattern | Pairs Well With | Avoid Combining With |
|---|---|---|
| Guard Clause | Value Object, Result/Either | Decision Table (redundant) |
| Value Object | Guard Clause, Specification | Aggregate Root at same level |
| Pure Function | Policy Object, Specification | Command Object (Commands have side effects) |
| State Machine | Command Object, Event Sourcing | Pure Function (state = side effect) |
| Repository Interface | DI, Command Object, Result/Either | Anti-Corruption Layer (separate concerns) |
| Anti-Corruption Layer | Value Object, Pure Function | Repository Interface (ACL lives outside repo) |
| Result / Either | Typed Error Hierarchy, Guard Clause | Null Object (choose one empty strategy) |

---

## Common Spec Signals → Pattern Trigger Words

| Spec says... | Apply this pattern |
|---|---|
| "validate that X is..." | Guard Clause + Value Object |
| "user can trigger..." | Commanded Behaviour + Command Object |
| "display a list of..." | Specification + Explicit Empty |
| "track the status of..." | State Machine |
| "keep a history of..." | Event Sourcing Slice |
| "integrate with external..." | Anti-Corruption Layer + Repository Interface |
| "apply different rules for..." | Policy Object + Decision Table |
| "report errors per item" | Result / Either + Typed Error Hierarchy |
| "must not depend on time" | Clock Injection |
| "audit log required" | Logger Seam + Command Object |
