import { describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkPhaseAScope, isMainModule } from '../../scripts/pl-scope-guard.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/pl-scope-guard.mjs', import.meta.url));

describe('Phase A scope guard', () => {
  it('permits src paths and the exact release-manifest exception', () => {
    expect(checkPhaseAScope([
      'src/scripts/pl-arch-check.mjs',
      'scripts/release-manifest.json',
    ])).toEqual([]);
  });

  it('rejects every other implementation path', () => {
    expect(checkPhaseAScope([
      'package.json',
      '.agents/registry.json',
      'src-other/not-allowed.ts',
      'scripts/dogfood.mjs',
    ])).toEqual([
      '.agents/registry.json',
      'package.json',
      'scripts/dogfood.mjs',
      'src-other/not-allowed.ts',
    ]);
  });

  it('rejects traversal disguised beneath src', () => {
    expect(checkPhaseAScope([
      'src/../../package.json',
      './src/../scripts/dogfood.mjs',
    ])).toEqual([
      '../package.json',
      'scripts/dogfood.mjs',
    ]);
  });

  it('normalizes backslash separators to forward slashes before the src/ check', () => {
    // Replacing '\\' with '/' (not '') is what lets a Windows-style path like
    // 'src\\sub\\file.ts' still resolve to 'src/sub/file.ts' and pass the guard.
    expect(checkPhaseAScope(['src\\sub\\file.ts'])).toEqual([]);
  });

  it('permits a declared allowedPaths entry and still rejects everything else outside src/', () => {
    expect(checkPhaseAScope(
      ['.agents/ts-deliver-router/registry.json', '.agents/other.json'],
      ['.agents/ts-deliver-router/registry.json'],
    )).toEqual(['.agents/other.json']);
  });

  it('treats an allowedPaths entry as a directory prefix, permitting nested paths beneath it', () => {
    expect(checkPhaseAScope(
      ['.claude/hooks/pldd/inject.mjs'],
      ['.claude/hooks/pldd'],
    )).toEqual([]);
  });

  it('keeps the zero-argument default behavior unchanged when allowedPaths is omitted', () => {
    expect(checkPhaseAScope([
      'package.json',
      '.agents/registry.json',
      'src-other/not-allowed.ts',
      'scripts/dogfood.mjs',
    ])).toEqual([
      '.agents/registry.json',
      'package.json',
      'scripts/dogfood.mjs',
      'src-other/not-allowed.ts',
    ]);
  });

  it('defaults allowedPaths to an empty array, not a permissive placeholder', () => {
    // Guards against the default parameter value being weakened to something
    // non-empty: a literal path matching that placeholder must still be rejected.
    expect(checkPhaseAScope(['Stryker was here'])).toEqual(['Stryker was here']);
  });

  it.each([
    ['', '.claude/x'],
    ['.', '.claude/x'],
    ['..', '.claude/x'],
    ['../escape', '.claude/x'],
  ])('rejects an unsafe allowedPaths entry %j instead of silently permitting everything', (unsafeEntry) => {
    expect(() => checkPhaseAScope(['.claude/x'], [unsafeEntry])).toThrow(/unsafe allowedPaths entry/);
  });

  it('normalizes backslash separators in allowedPaths entries too, not just in the checked paths', () => {
    expect(checkPhaseAScope(
      ['.claude/hooks/pldd/inject.mjs'],
      ['.claude\\hooks\\pldd'],
    )).toEqual([]);
  });
});

describe('isMainModule', () => {
  it('is true only when the module URL matches argv[1] resolved to a file URL', () => {
    expect(isMainModule('file:///a/b.mjs', '/a/b.mjs')).toBe(true);
  });

  it('is false when argv[1] points at a different file', () => {
    expect(isMainModule('file:///a/b.mjs', '/a/other.mjs')).toBe(false);
  });

  it('is false when argv[1] is undefined', () => {
    expect(isMainModule('file:///a/b.mjs', undefined)).toBe(false);
  });

  it('defaults the missing-argv1 case to the empty-string file URL, not an arbitrary string', () => {
    expect(isMainModule(pathToFileURL('').href, undefined)).toBe(true);
  });
});

describe('Phase A scope guard top-level CLI guard (in-process)', () => {
  // Stryker's vitest runner activates mutants only within the same process; the
  // spawnSync-based CLI tests below run in a fresh process and can't see mutant
  // activation, so the `if (isMainModule(...))` branch itself needs coverage
  // from a dynamic import inside this process instead.
  async function importFresh(bustTag: string) {
    return import(`${pathToFileURL(SCRIPT).href}?bust=${bustTag}`);
  }

  it('runs the CLI side effect when argv[1] resolves to this module', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0], SCRIPT, 'package.json', 'scripts/dogfood.mjs'];
    process.exitCode = undefined;
    const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      await importFresh('main-true');
      expect(process.exitCode).toBe(1);
      expect(writeSpy).toHaveBeenCalledWith('package.json\nscripts/dogfood.mjs\n');
    } finally {
      writeSpy.mockRestore();
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });

  it('sets no exit code when argv[1] resolves to this module but every path is in scope', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0], SCRIPT, 'src/scripts/pl-scope-guard.mjs'];
    process.exitCode = undefined;
    const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      await importFresh('main-no-violations');
      expect(process.exitCode).toBeUndefined();
      expect(writeSpy).not.toHaveBeenCalled();
    } finally {
      writeSpy.mockRestore();
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });

  it('does not run the CLI side effect when argv[1] resolves to a different module', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0], '/not/this/module.mjs', 'package.json'];
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

describe('Phase A scope guard CLI entrypoint', () => {
  it('prints violations to stderr and sets a non-zero exit code when run as the main module', () => {
    const result = spawnSync(process.execPath, [SCRIPT, 'package.json'], { encoding: 'utf8' });
    expect(result.stderr).toContain('package.json');
    expect(result.status).toBe(1);
  });

  it('joins multiple violations with a newline separator', () => {
    const result = spawnSync(process.execPath, [SCRIPT, 'package.json', 'scripts/dogfood.mjs'], { encoding: 'utf8' });
    expect(result.stderr).toBe('package.json\nscripts/dogfood.mjs\n');
    expect(result.status).toBe(1);
  });

  it('prints nothing and exits 0 when all given paths are in scope', () => {
    const result = spawnSync(process.execPath, [SCRIPT, 'src/scripts/pl-scope-guard.mjs'], { encoding: 'utf8' });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  });

  it('does not run the CLI block when imported as a module rather than executed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pl-scope-guard-import-'));
    const probe = join(dir, 'probe.mjs');
    writeFileSync(probe, `import '${SCRIPT.replace(/\\/g, '\\\\')}';\nprocess.stdout.write('imported-ok');\n`);
    const result = spawnSync(process.execPath, [probe], { encoding: 'utf8' });
    expect(result.stdout).toBe('imported-ok');
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('Phase A golden fixtures', () => {
  it('discovers every required case with valid normalized diagnostics', () => {
    const root = fileURLToPath(new URL('../fixtures/pl-sample-app/', import.meta.url));
    const cases = readdirSync(root).sort();
    expect(cases).toEqual([
      'architecture-failing',
      'compliant',
      'contract-failing',
      'ownership-failing',
      'unsupported-syntax',
    ]);

    for (const name of cases) {
      const diagnostics = JSON.parse(readFileSync(join(root, name, 'expected.json'), 'utf8'));
      expect(Array.isArray(diagnostics)).toBe(true);
      for (const diagnostic of diagnostics) {
        expect(Object.keys(diagnostic)).toEqual([
          'version', 'rule_id', 'severity', 'file', 'dependency', 'message',
        ]);
        expect(diagnostic.file).not.toMatch(/^[A-Za-z]:|^\//);
      }
    }
  });
});
