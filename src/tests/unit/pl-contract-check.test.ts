import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkContracts } from '../../scripts/pl-contract-check.mjs';

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function fixture(source: string, test: string) {
  const root = mkdtempSync(join(tmpdir(), 'pl-contract-'));
  temporary.push(root);
  const sourcePath = join(root, 'src', 'order.ts');
  const testPath = join(root, 'tests', 'order.test.ts');
  for (const [path, content] of [[sourcePath, source], [testPath, test]]) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  return { root, sourcePath, testPath };
}

describe('contract identity checker', () => {
  it('matches declaration ids to ids in test names', () => {
    const input = fixture(
      "requires(hours <= capacity, 'TIMESHEET-HOURS-CAPACITY', 'too many');",
      "it('rejects TIMESHEET-HOURS-CAPACITY', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });
  });

  it('matches the golden missing-test diagnostic', () => {
    const root = fileURLToPath(new URL('../fixtures/pl-sample-app/contract-failing/', import.meta.url));
    const result = checkContracts({
      root,
      sourceFiles: [join(root, 'src')],
      testFiles: [join(root, 'tests')],
    });
    expect(result).toEqual({
      exitCode: 1,
      diagnostics: JSON.parse(readFileSync(join(root, 'expected.json'), 'utf8')),
    });
  });

  it('reports duplicate declarations without count parity', () => {
    const input = fixture(`
      requires(one, 'ORDER-ID-VALID', 'bad');
      ensures(two, 'ORDER-ID-VALID', 'bad');
    `, "test('rejects ORDER-ID-VALID', () => { expect(() => run()).toThrow(); });");
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    expect(result.exitCode).toBe(1);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ rule_id: 'PL-CONTRACT-DUPLICATE-ID' }),
    ]);
  });

  it('reports orphan test ids and ignores comments and ordinary strings', () => {
    const input = fixture(
      "// requires(value, 'IGNORED-CONTRACT-ID', 'x')\nconst text = \"requires(x, 'IGNORED-STRING-ID', 'x')\";",
      "it('rejects ORPHAN-CONTRACT-ID', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toMatchObject({ exitCode: 1, diagnostics: [{ rule_id: 'PL-CONTRACT-ORPHAN-TEST' }] });
  });

  it('accepts imported contract aliases without losing identity proof', () => {
    const input = fixture(
      "import { requires as req } from '../utils/contracts';\nreq(valid, 'ORDER-ID-VALID', 'bad');",
      "it('rejects ORDER-ID-VALID', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });
  });

  it('rejects contract evidence outside project root', () => {
    const input = fixture(
      "requires(valid, 'ORDER-ID-VALID', 'bad');",
      "it('rejects ORDER-ID-VALID', () => {});",
    );
    const outside = mkdtempSync(join(tmpdir(), 'pl-contract-outside-'));
    temporary.push(outside);
    const outsideTest = join(outside, 'fake.test.ts');
    writeFileSync(outsideTest, "it('rejects ORDER-ID-VALID', () => { expect(() => run()).toThrow(); });");
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [outsideTest] }))
      .toMatchObject({ exitCode: 2, diagnostics: [{ rule_id: 'PL-CONTRACT-PATH-ESCAPE' }] });
  });

  it('rejects an empty source/test selection instead of claiming parity', () => {
    const input = fixture('export const value = true;', "it('smoke', () => {});");
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toMatchObject({ exitCode: 2, diagnostics: [{ rule_id: 'PL-CONTRACT-NO-EVIDENCE' }] });
  });

  it('rejects an empty callback as violation-test evidence', () => {
    const input = fixture(
      "requires(valid, 'ORDER-ID-VALID', 'bad');",
      "it('rejects ORDER-ID-VALID', () => {});",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toMatchObject({ exitCode: 1, diagnostics: [{ rule_id: 'PL-CONTRACT-EMPTY-TEST' }] });
  });
});
