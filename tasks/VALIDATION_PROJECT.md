# Validation Project — Equipment Lending Board

## Purpose

Use a small, real-world, web-native product to validate both:

- PLDD multi-scale architecture constraints.
- Current dual-track Discovery and Delivery workflow.
- Portable execution across Codex and Claude Code.

This project is a validation vehicle, not part of `agenticToolset` product scope.

## Product

Neighborhood residents list equipment they can lend. Other residents request reservations for date ranges. Owners approve or reject requests. Simple email login arrives only after core domain behavior is proven.

Domain progression:

```text
Catalog → Reservation → Identity
```

Before real authentication exists, a seeded development identity supplies an `ActorId`. Domain and application code depend on a `CurrentActor` port from iteration 1; iteration 3 replaces only its adapter.

## Iteration 1 — Equipment Catalog

### User outcomes

- Browse equipment.
- Add equipment.
- View equipment details.
- Mark owned equipment available or unavailable.

### Domain model

- Aggregate: `Equipment`
- Value objects: `EquipmentId`, `ActorId`, `EquipmentName`
- Commands: `AddEquipment`, `ChangeAvailability`
- Events: `EquipmentAdded`, `EquipmentAvailabilityChanged`

### Validation goals

- Compile Event Storm output into scenarios.
- Produce placement rows for domain, application, adapters, and infrastructure.
- Confirm architecture guard rejects persistence imports from domain code.
- Confirm contracts reject blank names and invalid availability transitions.
- Exercise one complete epic through dual-track workflow and seven-phase Delivery spine.
- Run identical portable checks under Codex and Claude Code.

### Success evidence

- Complete vertical slice works.
- Deliberately planted layer violation fails on both hosts with same rule ID and exit code.
- G1 and G2 remain human-controlled.

## Iteration 2 — Reservation Lifecycle

### User outcomes

- Request equipment for a date range.
- Approve or reject a request as equipment owner.
- Prevent overlapping approved reservations.
- View requests made by current actor.
- View requests against current actor's equipment.

### Domain model

- Aggregate: `Reservation`
- Value object: `DateRange`
- Commands: `RequestReservation`, `ApproveReservation`, `RejectReservation`
- Events: `ReservationRequested`, `ReservationApproved`, `ReservationRejected`
- Separate command handlers and query read models.

### Validation goals

- Exercise a meaningful domain invariant: approved date ranges cannot overlap.
- Validate light CQRS separation.
- Validate contract violations and mutation sensitivity.
- Exercise Spectra ingest when requirements change during Delivery.
- Exercise station failure loop-back and WIP limit of one scenario.
- Record architecture, contract, scenario, and orchestration failures in pattern feedback.

### Success evidence

- Scenario coverage gate catches a missing domain event assertion.
- Mutation gate catches a planted boundary defect.
- Architecture checks remove need for human placement corrections.
- Discovery findings can feed Delivery without competing state authority.

## Iteration 3 — Email Identity and Authorization

### User outcomes

- Request an email sign-in link or one-time code.
- Maintain a browser session.
- Restrict equipment changes to its owner.
- Restrict reservation approval or rejection to equipment owner.
- Prevent requester from approving their own request.

### Architecture

```text
Email identity provider
        ↓ adapter
CurrentActor port
        ↓
Application authorization
        ↓
Domain commands
```

### Validation goals

- Replace seeded identity adapter without rewriting aggregates or use cases.
- Confirm domain code never imports authentication framework code.
- Distinguish unauthenticated and unauthorized failures through contracts.
- Exercise external dependency intake and substantive G1 threat analysis.
- Verify session, secret, and authorization checks at G2.
- Confirm Codex and Claude Code agents consume identical schemas and command results.

### Success evidence

- Identity integration changes adapter and composition code only.
- Same acceptance scenarios pass under both host workflows.
- Host-specific hooks contain no unique business or architecture rules.

## Portable Architecture Contract

Portable core:

- Node scripts and npm commands with decisive exit codes.
- JSON and JSONL schemas.
- `layers.map.json` and generated dependency rules.
- OpenSpec scenarios and placement artifacts.
- Stable diagnostic rule IDs.

Host adapters:

- Claude Code hooks, commands, and tool frontmatter.
- Codex `AGENTS.md`, skills, and workspace instructions.

Host adapters may display state and invoke portable commands. They must not contain unique domain, architecture, contract, or gate rules.

## Scope Limits

Exclude:

- Payments.
- General notifications beyond login email.
- Chat.
- Ratings or reviews.
- Recurring reservations.
- Organizations or multi-tenancy.
- Image uploads.
- Calendar integration.
- Event sourcing.
- Password recovery, profiles, social login, or admin console.

## Recommended Technical Shape

- TypeScript web application.
- Server-rendered web UI.
- SQLite persistence.
- Browser-level acceptance tests.
- Cross-platform Node scripts for all portable enforcement.

Exact web framework remains a later decision. Framework selection must not alter domain model or portable validation contracts.

## Conclusion

Use Equipment Lending Board as parked validation project. Execute iterations in order:

1. Equipment Catalog proves workflow mechanics and baseline enforcement.
2. Reservation Lifecycle stresses PLDD through invariants, CQRS, contracts, mutation, and requirement change.
3. Email Identity proves adapter boundaries, authorization, external dependency handling, and Codex/Claude Code portability.

