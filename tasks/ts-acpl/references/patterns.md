# Pattern Catalogue — AI Coding Pattern Language

> Full reference for all 20 ACPL patterns. Each entry includes:
> intent, structure, code template, test strategy, and mutation sensitivity note.

---

## Table of Contents

1. Guard Clause
2. Value Object
3. Assertion Gate
4. Null Object
5. Pure Function
6. Policy Object
7. Specification
8. Decision Table
9. State Machine
10. Command Object
11. Event Sourcing Slice
12. Dependency Injection
13. Repository Interface
14. Clock Injection
15. Logger Seam
16. Result / Either
17. Typed Error Hierarchy
18. Explicit Empty
19. Aggregate Root (bonus — for DDD contexts)
20. Anti-Corruption Layer (bonus — for external API contexts)

---

## 1. Guard Clause

**Intent**: Reject invalid preconditions at the top of a function.
Never nest the happy path inside conditionals.

**Structure**:
```
function doWork(input):
  GUARD: if invalid(input) → throw / return Error early
  GUARD: if missing(dependency) → throw early
  // happy path — never indented under a guard
```

**Code Template** (TypeScript):
```typescript
function processPayment(amount: number, accountId: string): Result<Receipt, PaymentError> {
  // Guards first
  if (amount <= 0) return Err(new PaymentError("Amount must be positive"));
  if (!accountId.trim()) return Err(new PaymentError("Account ID required"));

  // Happy path — flat, not nested
  const receipt = charge(accountId, amount);
  return Ok(receipt);
}
```

**Test Strategy**:
- One test per guard that passes an invalid input and asserts the error type.
- One test with all-valid input asserting the happy-path return.

**Mutation Sensitivity Note**:
- `<=` → `<` is killed by a test with `amount = 0`.
- Guard removal is killed by the guard's dedicated test.

---

## 2. Value Object

**Intent**: Wrap a primitive in a type that enforces invariants at construction time.

**Structure**:
```
class ValueObject:
  private constructor(readonly value: PrimitiveType)
  static create(raw): Result<ValueObject, ValidationError>
  equals(other: ValueObject): boolean
```

**Code Template** (TypeScript):
```typescript
class EmailAddress {
  private constructor(readonly value: string) {}

  static create(raw: string): Result<EmailAddress, ValidationError> {
    const trimmed = raw.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed))
      return Err(new ValidationError(`Invalid email: ${raw}`));
    return Ok(new EmailAddress(trimmed));
  }

  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }
}
```

**Test Strategy**:
- Test valid input → Ok with normalized value.
- Test each invalid input class → Err with correct message.
- Test `equals` with same/different values.

**Mutation Sensitivity Note**:
- Regex removal is killed by invalid-input tests.
- `toLowerCase()` removal is killed by a case-insensitive equality test.

---

## 3. Assertion Gate

**Intent**: Embed explicit precondition/postcondition checks in production code as
living documentation and mutation targets.

**Code Template** (Python):
```python
def calculate_discount(price: float, tier: str) -> float:
    # Preconditions
    assert price > 0, f"price must be positive, got {price}"
    assert tier in VALID_TIERS, f"unknown tier: {tier}"

    result = DISCOUNT_TABLE[tier] * price

    # Postcondition
    assert 0 <= result <= price, f"discount {result} outside valid range"
    return result
```

**Mutation Sensitivity Note**:
- Removing the precondition assert is killed by a test that passes `price=0`.
- Removing the postcondition is killed by a property-based test on the return range.

---

## 4. Null Object

**Intent**: Return a do-nothing object instead of null. Eliminate null checks in callers.

**Code Template** (TypeScript):
```typescript
interface Logger {
  log(msg: string): void;
}

class ConsoleLogger implements Logger {
  log(msg: string) { console.log(msg); }
}

class NullLogger implements Logger {
  log(_msg: string) { /* intentionally empty */ }
}

// Usage — callers never check for null
function processOrder(order: Order, logger: Logger = new NullLogger()) {
  logger.log(`Processing ${order.id}`);
  // ...
}
```

**Mutation Sensitivity Note**:
- Swapping `NullLogger` for a throwing implementation is caught by callers that
  inject `NullLogger` and assert no error is thrown.

---

## 5. Pure Function

**Intent**: A function whose output is determined solely by its inputs. No reads from
external state, no writes to anything external.

**Checklist for AI code generation**:
```
[ ] No Date.now(), Math.random(), or global reads inside function body
[ ] No mutation of input arguments
[ ] No I/O (no console.log, no DB calls)
[ ] Return value fully determined by parameters
```

**Code Template** (TypeScript):
```typescript
// Pure — testable, mutation-hostile
function applyTaxPolicy(
  subtotal: number,
  taxRate: number,
  discountCents: number
): number {
  const discounted = subtotal - discountCents / 100;
  return discounted * (1 + taxRate);
}
```

**Mutation Sensitivity Note**:
- Every arithmetic operator mutation (`+` → `-`, `*` → `/`) is killed by a single
  numeric assertion test.

---

## 6. Policy Object

**Intent**: Encapsulate a single business rule as an injectable object.
Replaces feature flags and nested conditionals.

**Code Template** (TypeScript):
```typescript
interface ShippingPolicy {
  isEligibleForFreeShipping(order: Order): boolean;
}

class StandardShippingPolicy implements ShippingPolicy {
  isEligibleForFreeShipping(order: Order): boolean {
    return order.totalCents >= 5000;
  }
}

class PremiumMemberPolicy implements ShippingPolicy {
  isEligibleForFreeShipping(_order: Order): boolean {
    return true; // premium members always qualify
  }
}

// Usage
class OrderService {
  constructor(private readonly shippingPolicy: ShippingPolicy) {}

  checkoutSummary(order: Order): Summary {
    const freeShipping = this.shippingPolicy.isEligibleForFreeShipping(order);
    return buildSummary(order, freeShipping);
  }
}
```

**Mutation Sensitivity Note**:
- The `>=` boundary is killed by a test with `totalCents = 4999` vs `5000`.
- Policy injection seam lets tests substitute a spy policy to assert it was called.

---

## 7. Specification

**Intent**: A named boolean predicate for a domain concept. Composable.

**Code Template** (TypeScript):
```typescript
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

class ActiveAccountSpec implements Specification<Account> {
  isSatisfiedBy(account: Account): boolean {
    return account.status === "ACTIVE";
  }
  and(other: Specification<Account>) { return new AndSpec(this, other); }
  or(other: Specification<Account>)  { return new OrSpec(this, other); }
  not()                               { return new NotSpec(this); }
}

// Composite usage
const eligibleSpec = new ActiveAccountSpec().and(new VerifiedEmailSpec());
const isEligible = eligibleSpec.isSatisfiedBy(account);
```

**Mutation Sensitivity Note**:
- Status string comparison killed by test with `status = "INACTIVE"`.
- AND/OR logic killed by tests combining two specs in opposite combinations.

---

## 8. Decision Table

**Intent**: Replace nested `if/else` or `switch` with a data-driven lookup table.

**Code Template** (TypeScript):
```typescript
type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
type Action = "APPROVE" | "REVIEW" | "REJECT";

const RISK_DECISION_TABLE: Record<RiskLevel, Action> = {
  LOW:    "APPROVE",
  MEDIUM: "REVIEW",
  HIGH:   "REJECT",
};

function decideAction(risk: RiskLevel): Action {
  const action = RISK_DECISION_TABLE[risk];
  if (!action) throw new Error(`Unknown risk level: ${risk}`);
  return action;
}
```

**Mutation Sensitivity Note**:
- Each table entry can be mutated independently → one test per entry kills each mutant.
- Missing-key guard killed by test with an unexpected risk value.

---

## 9. State Machine

**Intent**: Represent state as an explicit enum and transitions as a table.
No implicit boolean flag combinations.

**Code Template** (TypeScript):
```typescript
type OrderState = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
  PENDING:   ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED",   "CANCELLED"],
  SHIPPED:   ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

class Order {
  constructor(
    readonly id: string,
    private _state: OrderState = "PENDING"
  ) {}

  get state(): OrderState { return this._state; }

  transition(next: OrderState): Result<void, TransitionError> {
    if (!VALID_TRANSITIONS[this._state].includes(next))
      return Err(new TransitionError(
        `Cannot transition from ${this._state} to ${next}`
      ));
    this._state = next;
    return Ok(undefined);
  }
}
```

**Mutation Sensitivity Note**:
- Every transition entry killed by a test asserting that an illegal transition fails.
- State assignment killed by asserting `order.state` equals `next` after transition.

---

## 10. Command Object

**Intent**: Encapsulate a mutation as an object with `execute()` and optionally
`undo()`. Enables logging, queueing, and reversal.

**Code Template** (TypeScript):
```typescript
interface Command<T> {
  execute(): Promise<Result<T, CommandError>>;
  describe(): string;
}

class UpdateIssuePriorityCommand implements Command<void> {
  constructor(
    private readonly jira: JiraClient,
    private readonly issueKey: string,
    private readonly priority: Priority
  ) {}

  describe(): string {
    return `Set ${this.issueKey} priority to ${this.priority}`;
  }

  async execute(): Promise<Result<void, CommandError>> {
    return this.jira.updatePriority(this.issueKey, this.priority);
  }
}
```

**Mutation Sensitivity Note**:
- `execute()` body deletion killed by asserting `jira.updatePriority` was called
  with the correct arguments (spy test).

---

## 11. Event Sourcing Slice

**Intent**: Append domain events; derive current state from replaying them.
Useful when auditability matters or state history is a requirement.

**Code Template** (TypeScript):
```typescript
type DomainEvent =
  | { type: "ORDER_PLACED";    payload: { amount: number } }
  | { type: "ORDER_CANCELLED"; payload: { reason: string } };

function projectOrderState(events: DomainEvent[]): OrderReadModel {
  return events.reduce((state, event) => {
    switch (event.type) {
      case "ORDER_PLACED":
        return { ...state, status: "ACTIVE", amount: event.payload.amount };
      case "ORDER_CANCELLED":
        return { ...state, status: "CANCELLED", cancelReason: event.payload.reason };
      default:
        return state;
    }
  }, { status: "EMPTY", amount: 0 } as OrderReadModel);
}
```

**Mutation Sensitivity Note**:
- Each case branch killed by a test that emits only that event type and asserts the
  resulting state field.

---

## 12. Dependency Injection

**Intent**: Pass all collaborators into a function or class constructor.
Never `new`, `import`, or reach into globals inside business logic.

**Rules for AI code generation**:
```
NEVER inside business logic:
  new DatabaseClient()
  fetch("https://...")
  Date.now()
  Math.random()
  process.env.XXX

ALWAYS inject via constructor or parameter.
```

---

## 13. Repository Interface

**Intent**: Decouple storage behind a typed interface.
Business logic depends on the interface, not the implementation.

**Code Template** (TypeScript):
```typescript
interface IssueRepository {
  findById(id: string): Promise<Issue | null>;
  save(issue: Issue): Promise<void>;
  findByProject(projectKey: string): Promise<Issue[]>;
}

// Fake for tests
class InMemoryIssueRepository implements IssueRepository {
  private store = new Map<string, Issue>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(issue: Issue)   { this.store.set(issue.id, issue); }
  async findByProject(key: string) {
    return [...this.store.values()].filter(i => i.projectKey === key);
  }
}
```

---

## 14. Clock Injection

**Intent**: Eliminate `Date.now()` / `new Date()` from business logic.
All time-based logic receives a clock as a parameter.

**Code Template** (TypeScript):
```typescript
interface Clock {
  now(): Date;
}

class SystemClock implements Clock {
  now() { return new Date(); }
}

class FixedClock implements Clock {
  constructor(private readonly fixed: Date) {}
  now() { return this.fixed; }
}

// Business logic — fully deterministic
function isTokenExpired(token: Token, clock: Clock): boolean {
  return clock.now() > token.expiresAt;
}

// Test
it("detects expired token", () => {
  const clock = new FixedClock(new Date("2026-01-02"));
  const token = { expiresAt: new Date("2026-01-01") };
  expect(isTokenExpired(token, clock)).toBe(true);
});
```

---

## 15. Logger Seam

**Intent**: Inject a logger so tests can assert on logged output without console noise.

**Code Template** (TypeScript):
```typescript
interface Logger {
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
}

// Spy for tests
class SpyLogger implements Logger {
  readonly messages: Array<{ level: string; msg: string }> = [];
  info(msg: string) { this.messages.push({ level: "info", msg }); }
  warn(msg: string) { this.messages.push({ level: "warn", msg }); }
  error(msg: string) { this.messages.push({ level: "error", msg }); }
}
```

---

## 16. Result / Either

**Intent**: Return a discriminated union of success | failure.
Never throw for expected domain errors.

**Code Template** (TypeScript):
```typescript
type Ok<T>  = { readonly ok: true;  readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E> = Ok<T> | Err<E>;

const Ok  = <T>(value: T): Ok<T>   => ({ ok: true,  value });
const Err = <E>(error: E): Err<E>  => ({ ok: false, error });

// Usage
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err("Division by zero");
  return Ok(a / b);
}

const result = divide(10, 0);
if (!result.ok) console.error(result.error);
else console.log(result.value);
```

**Mutation Sensitivity Note**:
- `b === 0` → `b !== 0` killed by test asserting `ok: false` on zero divisor.
- Return type shape mutation killed by asserting `result.value` type in success case.

---

## 17. Typed Error Hierarchy

**Intent**: Distinguish domain errors from infrastructure errors via a class hierarchy.

**Code Template** (TypeScript):
```typescript
abstract class AppError extends Error {
  abstract readonly code: string;
}

class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  constructor(readonly field: string, message: string) { super(message); }
}

class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  constructor(readonly resourceType: string, readonly id: string) {
    super(`${resourceType} ${id} not found`);
  }
}

class InfrastructureError extends AppError {
  readonly code = "INFRA_ERROR";
}
```

---

## 18. Explicit Empty

**Intent**: Return empty collections, empty strings, or zero values — never null.

**Rule**: `null` is only acceptable at the database boundary (raw query results).
All internal functions return typed empty values.

**Code Template**:
```typescript
// BAD
function getAssignees(issue: Issue): User[] | null { ... }

// GOOD
function getAssignees(issue: Issue): User[] {
  return issue.assignees ?? [];
}
```

---

## 19. Aggregate Root *(DDD bonus)*

**Intent**: A cluster of domain objects with a single entry point that enforces all
invariants across the cluster.

Use when: a spec describes an entity that owns child entities and enforces cross-child
rules (e.g., an Order owns OrderLines and enforces a line-count limit).

---

## 20. Anti-Corruption Layer *(External API bonus)*

**Intent**: Translate an external system's model into your domain model at the boundary.
Prevents external schema changes from leaking into business logic.

**Code Template** (TypeScript):
```typescript
// External Jira response shape (volatile — changes with API version)
interface JiraIssueRaw {
  id: string;
  fields: { summary: string; status: { name: string }; priority: { name: string } };
}

// Internal domain model (stable)
interface Issue {
  id: string;
  title: string;
  status: IssueStatus;
  priority: Priority;
}

// ACL — translation lives here only
function toIssue(raw: JiraIssueRaw): Issue {
  return {
    id:       raw.id,
    title:    raw.fields.summary,
    status:   parseStatus(raw.fields.status.name),
    priority: parsePriority(raw.fields.priority.name),
  };
}
```

**Mutation Sensitivity Note**:
- Each field mapping killed by a test asserting the translated domain field value.
