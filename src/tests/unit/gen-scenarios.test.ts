import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkEventCoverage, compileScenarios } from '../../scripts/gen-scenarios.mjs';

function tenRelations() {
  const commands = Array.from({ length: 10 }, (_, index) => `Command ${index + 1}`);
  const domain_events = Array.from({ length: 10 }, (_, index) => `Event ${index + 1}`);
  const aggregates = Array.from({ length: 10 }, (_, index) => `Aggregate ${index + 1}`);
  return {
    commands,
    domain_events,
    aggregates,
    ownership_relations_v1: commands.map((command, index) => ({
      command,
      aggregate: aggregates[index],
      event: domain_events[index],
    })),
  };
}

describe('scenario generation', () => {
  it('emits ten deterministic skeletons without mutating legacy arrays', () => {
    const input = tenRelations();
    const before = structuredClone(input);
    const result = compileScenarios(input);
    expect(result.exitCode).toBe(0);
    expect(result.coverageChecked).toBe(false);
    expect(result.output.match(/^#### Scenario:/gm)).toHaveLength(10);
    expect(input).toEqual(before);
  });

  it('matches the duplicate-ownership golden diagnostic', () => {
    const root = fileURLToPath(new URL('../fixtures/pl-sample-app/ownership-failing/', import.meta.url));
    const input = JSON.parse(readFileSync(join(root, 'exploration.json'), 'utf8'));
    const expected = JSON.parse(readFileSync(join(root, 'expected.json'), 'utf8'));
    expect(compileScenarios(input)).toMatchObject({ exitCode: 2, diagnostics: expected });
  });

  it('rejects missing ownership, unknown versions, and non-exact references', () => {
    const missing = tenRelations();
    missing.ownership_relations_v1.pop();
    expect(compileScenarios(missing)).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-SCENARIO-OWNERSHIP' }],
    });

    const unknown = { ...tenRelations(), ownership_relations_v2: [] };
    expect(compileScenarios(unknown)).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-SCENARIO-OWNERSHIP' }],
    });

    const wrong = tenRelations();
    wrong.ownership_relations_v1[0].aggregate = 'Not an aggregate';
    expect(compileScenarios(wrong)).toMatchObject({ exitCode: 2 });
  });
});

describe('completed scenario coverage', () => {
  const input = {
    commands: ['Start Loan', 'Return Item'],
    domain_events: ['Loan Started', 'Item Returned'],
    aggregates: ['Loan', 'Item'],
    ownership_relations_v1: [
      { command: 'Start Loan', aggregate: 'Loan', event: 'Loan Started' },
      { command: 'Return Item', aggregate: 'Item', event: 'Item Returned' },
    ],
  };

  it('reports each event missing from completed THEN clauses', () => {
    expect(checkEventCoverage(input, `
      #### Scenario: start
      - **WHEN** Start Loan
      - **THEN** Loan Started
    `)).toMatchObject({
      exitCode: 1,
      coverageChecked: true,
      diagnostics: [{ rule_id: 'PL-SCENARIO-MISSING-EVENT', message: expect.stringContaining('Item Returned') }],
    });
  });

  it('passes only when every completed THEN clause covers all events', () => {
    expect(checkEventCoverage(input, `
      - **THEN** Loan Started
      - **THEN** Item Returned
    `)).toEqual({ exitCode: 0, diagnostics: [], output: '', coverageChecked: true });
  });

  it('does not treat generated placeholders as completed coverage', () => {
    const generated = compileScenarios(input);
    expect(checkEventCoverage(input, generated.output)).toMatchObject({
      exitCode: 1,
      diagnostics: [
        { rule_id: 'PL-SCENARIO-MISSING-EVENT', message: expect.stringContaining('Loan Started') },
        { rule_id: 'PL-SCENARIO-MISSING-EVENT', message: expect.stringContaining('Item Returned') },
      ],
    });
  });

  it('matches event assertions exactly and rejects empty identifiers', () => {
    const overlapping = {
      commands: ['Create'],
      domain_events: ['Order'],
      aggregates: ['Order'],
      ownership_relations_v1: [{ command: 'Create', aggregate: 'Order', event: 'Order' }],
    };
    expect(checkEventCoverage(overlapping, '- **THEN** OrderCreated')).toMatchObject({ exitCode: 1 });

    const invalid = structuredClone(overlapping);
    invalid.domain_events = [''];
    invalid.ownership_relations_v1[0].event = '';
    expect(compileScenarios(invalid)).toMatchObject({ exitCode: 2 });
  });
});
