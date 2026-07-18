import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkContracts } from '../../scripts/pl-contract-check.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/pl-contract-check.mjs', import.meta.url));

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

function tree(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'pl-contract-tree-'));
  temporary.push(root);
  for (const [relPath, content] of Object.entries(files)) {
    const full = join(root, relPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
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

  it('recognizes invariant() as a contract declaration on its own', () => {
    const input = fixture(
      "invariant(balance >= 0, 'ORDER-INVARIANT-ONLY', 'bad');",
      "it('rejects ORDER-INVARIANT-ONLY', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });
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

describe('source/test file expansion', () => {
  it('walks nested directories, sorts entries, filters by supported extension, and dedupes overlapping selections', () => {
    const root = tree({
      'src/b/two.ts': "requires(x, 'ORDER-B-TWO', 'bad');",
      'src/a/one.ts': "requires(x, 'ORDER-A-ONE', 'bad');",
      'src/notes.md': 'not a source file',
      'tests/one.test.ts': "it('rejects ORDER-A-ONE', () => { expect(() => run()).toThrow(); });\nit('rejects ORDER-B-TWO', () => { expect(() => run()).toThrow(); });",
    });
    // Pass the src directory twice — the visited-set dedup must still walk it exactly once.
    const result = checkContracts({
      root,
      sourceFiles: [join(root, 'src'), join(root, 'src')],
      testFiles: [join(root, 'tests')],
    });
    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
  });

  it('recognizes every supported extension and excludes unsupported ones', () => {
    const root = tree({
      'src/a.ts': "requires(x, 'ORDER-EXT-TS', 'bad');",
      'src/b.tsx': "requires(x, 'ORDER-EXT-TSX', 'bad');",
      'src/c.js': "requires(x, 'ORDER-EXT-JS', 'bad');",
      'src/d.jsx': "requires(x, 'ORDER-EXT-JSX', 'bad');",
      'src/e.mts': "requires(x, 'ORDER-EXT-MTS', 'bad');",
      'src/f.cts': "requires(x, 'ORDER-EXT-CTS', 'bad');",
      'src/g.mjs': "requires(x, 'ORDER-EXT-MJS', 'bad');",
      'src/h.cjs': "requires(x, 'ORDER-EXT-CJS', 'bad');",
      'src/i.json': "requires(x, 'ORDER-EXT-JSON-IGNORED', 'bad');",
      'tests/all.test.ts': [
        'ORDER-EXT-TS', 'ORDER-EXT-TSX', 'ORDER-EXT-JS', 'ORDER-EXT-JSX',
        'ORDER-EXT-MTS', 'ORDER-EXT-CTS', 'ORDER-EXT-MJS', 'ORDER-EXT-CJS',
      ].map((id) => `it('rejects ${id}', () => { expect(() => run()).toThrow(); });`).join('\n'),
    });
    const result = checkContracts({ root, sourceFiles: [join(root, 'src')], testFiles: [join(root, 'tests')] });
    expect(result).toEqual({ exitCode: 0, diagnostics: [] });
  });

  it('supports test() in addition to it()', () => {
    const input = fixture(
      "requires(x, 'ORDER-TEST-FN', 'bad');",
      "test('rejects ORDER-TEST-FN', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });
  });
});

describe('call-argument scanning edge cases', () => {
  it('treats a non-string second argument as an unsupported-syntax violation', () => {
    const input = fixture(
      "requires(valid, someVariable, 'bad');",
      "it('rejects ORDER-UNRELATED', () => { expect(() => run()).toThrow(); });",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ rule_id: 'PL-CONTRACT-UNSUPPORTED-SYNTAX' }),
    );
  });

  it('does not count a comma nested inside a parenthesized/bracketed/braced first argument', () => {
    const input = fixture(
      "requires(fn(a, b, c), 'ORDER-NESTED-COMMA', 'bad');",
      "it('rejects ORDER-NESTED-COMMA', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });
  });

  it('does not count a comma nested inside array/object literal first arguments', () => {
    const input = fixture(
      "requires([a, b].includes(c), 'ORDER-ARRAY-COMMA', 'bad');",
      "it('rejects ORDER-ARRAY-COMMA', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });

    const objInput = fixture(
      "requires({ a: 1, b: 2 }.a > 0, 'ORDER-OBJECT-COMMA', 'bad');",
      "it('rejects ORDER-OBJECT-COMMA', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: objInput.root, sourceFiles: [objInput.sourcePath], testFiles: [objInput.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });
  });

  it('ignores a contract-like call with no opening parenthesis at all', () => {
    const input = fixture(
      'const requires = 1;',
      "it('smoke', () => {});",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toMatchObject({ exitCode: 2, diagnostics: [{ rule_id: 'PL-CONTRACT-NO-EVIDENCE' }] });
  });
});

describe('alias tracking', () => {
  it('follows a chained assignment alias, not just a direct one', () => {
    const input = fixture(
      "const req = requires;\nconst reqAlias = req;\nreqAlias(valid, 'ORDER-CHAINED-ALIAS', 'bad');",
      "it('rejects ORDER-CHAINED-ALIAS', () => { expect(() => run()).toThrow(); });",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toEqual({ exitCode: 0, diagnostics: [] });
  });

  it('does not treat an assignment to an unrelated value as a contract alias', () => {
    const input = fixture(
      "const notAContract = someOtherThing;\nnotAContract(valid, 'ORDER-NOT-ALIAS', 'bad');",
      "it('smoke', () => {});",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    // No declarations recognized at all (only the direct CONTRACTS names and their aliases count),
    // and no test ids either, so this falls through to PL-CONTRACT-NO-EVIDENCE.
    expect(result).toMatchObject({ exitCode: 2, diagnostics: [{ rule_id: 'PL-CONTRACT-NO-EVIDENCE' }] });
  });
});

describe('violation-test evidence detection', () => {
  it('treats a callback containing only "async" as having no real evidence', () => {
    const input = fixture(
      "requires(valid, 'ORDER-ASYNC-ONLY', 'bad');",
      "it('rejects ORDER-ASYNC-ONLY', async () => {});",
    );
    expect(checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] }))
      .toMatchObject({ exitCode: 1, diagnostics: [{ rule_id: 'PL-CONTRACT-EMPTY-TEST' }] });
  });

  it('ignores a test whose name string contains no contract-shaped id', () => {
    const input = fixture(
      "requires(valid, 'ORDER-ID-VALID', 'bad');",
      "it('smoke test with no id', () => { expect(() => run()).toThrow(); });",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ rule_id: 'PL-CONTRACT-MISSING-TEST' }));
  });

  it('ignores a call whose name is not it/test even if it looks similar', () => {
    const input = fixture(
      "requires(valid, 'ORDER-ID-VALID', 'bad');",
      "xit('rejects ORDER-ID-VALID', () => { expect(() => run()).toThrow(); });",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ rule_id: 'PL-CONTRACT-MISSING-TEST' }));
  });
});

describe('violation deduplication and diagnostic ordering', () => {
  it('reports a duplicate-id violation only once even with three declarations', () => {
    const input = fixture(
      `
      requires(one, 'ORDER-TRIPLE', 'bad');
      ensures(two, 'ORDER-TRIPLE', 'bad');
      invariant(three, 'ORDER-TRIPLE', 'bad');
      `,
      "it('rejects ORDER-TRIPLE', () => { expect(() => run()).toThrow(); });",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    const duplicateEntries = result.diagnostics.filter((d: { rule_id: string }) => d.rule_id === 'PL-CONTRACT-DUPLICATE-ID');
    expect(duplicateEntries).toHaveLength(1);
  });

  it('dedups by rule_id AND message, not by message text alone', () => {
    // A test named the same as a duplicated declaration id produces an
    // EMPTY-TEST violation whose message happens to contain that id — if the
    // dedup check only matched on message substring (ignoring rule_id), it
    // would wrongly treat that as "duplicate-id already reported" and skip
    // pushing the real PL-CONTRACT-DUPLICATE-ID entry.
    const input = fixture(
      `
      requires(one, 'ORDER-DUP-A', 'bad');
      ensures(two, 'ORDER-DUP-A', 'bad');
      `,
      "it('rejects ORDER-DUP-A', () => {});",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ rule_id: 'PL-CONTRACT-DUPLICATE-ID', message: expect.stringContaining('ORDER-DUP-A') }),
    );
  });

  it('reports a missing-test violation exactly once even when the id is declared twice', () => {
    const input = fixture(
      `
      requires(one, 'ORDER-DUP-B', 'bad');
      ensures(two, 'ORDER-DUP-B', 'bad');
      `,
      "it('unrelated', () => { expect(() => run()).toThrow(); });",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    const missingForId = result.diagnostics
      .filter((d: { rule_id: string; message: string }) => d.rule_id === 'PL-CONTRACT-MISSING-TEST' && d.message.includes('ORDER-DUP-B'));
    expect(missingForId).toHaveLength(1);
  });

  it('reports an orphan-test violation exactly once even when the same orphan id appears in two tests', () => {
    const input = fixture(
      "requires(x, 'ORDER-SEED-ONLY', 'bad');",
      [
        "it('rejects ORDER-ORPHAN-DUP', () => { expect(() => run()).toThrow(); });",
        "it('also rejects ORDER-ORPHAN-DUP', () => { expect(() => run()).toThrow(); });",
      ].join('\n'),
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    const orphanForId = result.diagnostics
      .filter((d: { rule_id: string; message: string }) => d.rule_id === 'PL-CONTRACT-ORPHAN-TEST' && d.message.includes('ORDER-ORPHAN-DUP'));
    expect(orphanForId).toHaveLength(1);
  });

  it('orphan dedup matches by rule_id AND message, not by message text alone', () => {
    // An empty-callback orphan test produces both an EMPTY-TEST violation and
    // (separately) an ORPHAN-TEST violation for the same id; a message-only
    // dedup check would wrongly suppress the ORPHAN-TEST entry.
    const input = fixture(
      '',
      "it('rejects ORDER-ORPHAN-EQ', () => {});",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ rule_id: 'PL-CONTRACT-ORPHAN-TEST', message: expect.stringContaining('ORDER-ORPHAN-EQ') }),
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ rule_id: 'PL-CONTRACT-EMPTY-TEST', message: expect.stringContaining('ORDER-ORPHAN-EQ') }),
    );
  });

  it('sorts diagnostics by file, then rule_id, then message', () => {
    const input = fixture(
      "requires(a, 'ORDER-AAA', 'bad');\nrequires(b, 'ORDER-ZZZ', 'bad');",
      "it('unrelated', () => { expect(() => run()).toThrow(); });",
    );
    const result = checkContracts({ root: input.root, sourceFiles: [input.sourcePath], testFiles: [input.testPath] });
    const ids = result.diagnostics.map((d: { message: string }) => d.message);
    expect(ids[0]).toContain('ORDER-AAA');
    expect(ids[ids.length - 1]).toContain('ORDER-ZZZ');
  });
});

describe('pl-contract-check CLI', () => {
  it('rejects an unknown CLI argument', () => {
    const result = spawnSync(process.execPath, [SCRIPT, '--bogus'], { encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Unknown argument: --bogus');
  });

  it('requires at least one --source and --test', () => {
    const result = spawnSync(process.execPath, [SCRIPT, '--source', '.'], { encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('--source and --test are required');
  });

  it('does not run the CLI block when imported as a module rather than executed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pl-contract-import-'));
    temporary.push(dir);
    const probe = join(dir, 'probe.mjs');
    writeFileSync(probe, `import '${SCRIPT.replace(/\\/g, '\\\\')}';\nprocess.stdout.write('imported-ok');\n`);
    const result = spawnSync(process.execPath, [probe], { encoding: 'utf8' });
    expect(result.stdout).toBe('imported-ok');
    expect(result.status).toBe(0);
  });
});

describe('pl-contract-check CLI entrypoint guard (in-process)', () => {
  async function importFresh(bustTag: string) {
    return import(`${pathToFileURL(SCRIPT).href}?bust=${bustTag}`);
  }

  async function runCliInProcess(bustTag: string, extraArgs: string[]) {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    process.argv = [originalArgv[0], SCRIPT, ...extraArgs];
    process.exitCode = undefined;
    try {
      await importFresh(bustTag);
      return { exitCode: process.exitCode, stdout: stdoutSpy.mock.calls.map((c) => c[0]).join(''), stderr: stderrSpy.mock.calls.map((c) => c[0]).join('') };
    } finally {
      stdoutSpy.mockRestore();
      stderrSpy.mockRestore();
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  }

  it('runs the CLI block and writes text diagnostics when argv[1] resolves to this module', async () => {
    const root = tree({
      'src/order.ts': "requires(x, 'ORDER-INPROC', 'bad');",
      'tests/order.test.ts': "it('smoke', () => {});",
    });
    const result = await runCliInProcess('main-true', [
      '--root', root, '--source', join(root, 'src'), '--test', join(root, 'tests'),
    ]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('PL-CONTRACT-MISSING-TEST');
    expect(result.stdout).not.toContain('{');
  });

  it('writes JSON diagnostics when --format json is given', async () => {
    const root = tree({
      'src/order.ts': "requires(x, 'ORDER-INPROC-JSON', 'bad');",
      'tests/order.test.ts': "it('smoke', () => {});",
    });
    const result = await runCliInProcess('main-json', [
      '--root', root, '--source', join(root, 'src'), '--test', join(root, 'tests'), '--format', 'json',
    ]);
    expect(result.exitCode).toBe(1);
    const parsed = JSON.parse(result.stdout);
    expect(parsed[0]).toMatchObject({ rule_id: 'PL-CONTRACT-MISSING-TEST' });
  });

  it('defaults --root to the current working directory when --root is omitted', async () => {
    const root = tree({
      'src/order.ts': "requires(x, 'ORDER-INPROC-CWD', 'bad');",
      'tests/order.test.ts': "it('rejects ORDER-INPROC-CWD', () => { expect(() => run()).toThrow(); });",
    });
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
    try {
      const result = await runCliInProcess('main-cwd-default', [
        '--source', join(root, 'src'), '--test', join(root, 'tests'),
      ]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    } finally {
      cwdSpy.mockRestore();
    }
  });

  it('honors an explicit --root', async () => {
    const root = tree({
      'src/order.ts': "requires(x, 'ORDER-INPROC-ROOT', 'bad');",
      'tests/order.test.ts': "it('rejects ORDER-INPROC-ROOT', () => { expect(() => run()).toThrow(); });",
    });
    const result = await runCliInProcess('main-root', [
      '--root', root, '--source', join(root, 'src'), '--test', join(root, 'tests'),
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('reports an unknown CLI argument via the catch block with exit 2', async () => {
    const result = await runCliInProcess('unknown-arg', ['--bogus']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toBe('Unknown argument: --bogus\n');
  });

  it('reports missing --source/--test via the catch block with exit 2', async () => {
    const result = await runCliInProcess('missing-source', []);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('--source and --test are required');
  });

  it('requires --test even when --source is present (OR, not AND)', async () => {
    const result = await runCliInProcess('missing-test-only', ['--source', '.']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('--source and --test are required');
  });

  it('requires --source even when --test is present (OR, not AND)', async () => {
    const result = await runCliInProcess('missing-source-only', ['--test', '.']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('--source and --test are required');
  });

  it('does not run the CLI block when argv[1] is empty', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0]];
    process.exitCode = undefined;
    try {
      await importFresh('main-no-argv1');
      expect(process.exitCode).toBeUndefined();
    } finally {
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });

  it('does not run the CLI block when argv[1] resolves to a different module', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0], '/not/this/module.mjs'];
    process.exitCode = undefined;
    try {
      await importFresh('main-false');
      expect(process.exitCode).toBeUndefined();
    } finally {
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });
});
