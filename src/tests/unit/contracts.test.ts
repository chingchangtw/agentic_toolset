import { describe, expect, it } from 'vitest';

import { ContractViolation, ensures, invariant, requires } from '../../utils/contracts';

describe('stable contracts', () => {
  it.each([
    ['requires', requires],
    ['ensures', ensures],
    ['invariant', invariant],
  ] as const)('%s remains on and identifies its violation', (kind, contract) => {
    expect(() => contract(false, 'ORDER-TOTAL-POSITIVE', 'total must be positive'))
      .toThrow(`[${kind}:ORDER-TOTAL-POSITIVE] total must be positive`);
    try {
      contract(false, 'ORDER-TOTAL-POSITIVE', 'total must be positive');
    } catch (error) {
      expect(error).toBeInstanceOf(ContractViolation);
      expect(error).toMatchObject({ kind, id: 'ORDER-TOTAL-POSITIVE' });
    }
    expect(() => contract(true, 'ORDER-TOTAL-POSITIVE', 'total must be positive')).not.toThrow();
  });
});
