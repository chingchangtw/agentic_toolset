export type ContractKind = 'requires' | 'ensures' | 'invariant';

export class ContractViolation extends Error {
  constructor(
    public readonly kind: ContractKind,
    public readonly id: string,
    message: string,
  ) {
    super(`[${kind}:${id}] ${message}`);
    this.name = 'ContractViolation';
  }
}

function enforce(condition: boolean, kind: ContractKind, id: string, message: string): asserts condition {
  if (!condition) throw new ContractViolation(kind, id, message);
}

export function requires(condition: boolean, id: string, message: string): asserts condition {
  enforce(condition, 'requires', id, message);
}

export function ensures(condition: boolean, id: string, message: string): asserts condition {
  enforce(condition, 'ensures', id, message);
}

export function invariant(condition: boolean, id: string, message: string): asserts condition {
  enforce(condition, 'invariant', id, message);
}
