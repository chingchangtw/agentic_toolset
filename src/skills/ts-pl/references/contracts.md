# Stable Contracts

Use always-on `requires`, `ensures`, and `invariant` calls:

```ts
requires(hours <= capacity, 'TIMESHEET-HOURS-CAPACITY', 'hours exceed capacity');
```

Signature: `(condition, id, message)`. IDs are unique uppercase hyphenated project
identities. Violation tests name the exact id in an `it(...)` or `test(...)` title:

```ts
it('rejects TIMESHEET-HOURS-CAPACITY', () => { /* violation assertion */ });
```

Run one or more `--source` and `--test` paths:

```text
node src/scripts/pl-contract-check.mjs --root <project> --source <path> --test <path> --format json
```

Checker reports duplicate declarations, declarations missing violation tests, and
test ids lacking declarations. Identity decides parity; assertion counts do not.

