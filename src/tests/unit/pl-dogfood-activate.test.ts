import { describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { activate, isMainModule, runCli } from '../../scripts/pl-dogfood-activate.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/pl-dogfood-activate.mjs', import.meta.url));

function withTmpDir(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'pl-dogfood-activate-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('activate', () => {
  it('snapshots every target before any write (three existing, one not-yet-existing)', () => {
    withTmpDir((dir) => {
      const existingA = join(dir, 'a.txt');
      const existingB = join(dir, 'b.txt');
      const existingC = join(dir, 'c.txt');
      const notYetExisting = join(dir, 'd.txt');
      writeFileSync(existingA, 'old-a');
      writeFileSync(existingB, 'old-b');
      writeFileSync(existingC, 'old-c');
      const snapshotDir = join(dir, 'snapshot');

      const manifest = activate(
        {
          allowedPaths: [existingA, existingB, existingC, notYetExisting],
          targets: [
            { path: existingA, content: 'new-a' },
            { path: existingB, content: 'new-b' },
            { path: existingC, content: 'new-c' },
            { path: notYetExisting, content: 'new-d' },
          ],
        },
        snapshotDir,
      );

      const byPath = Object.fromEntries(manifest.targets.map((t: any) => [t.path, t]));
      expect(byPath[existingA].existed_before).toBe(true);
      expect(byPath[existingB].existed_before).toBe(true);
      expect(byPath[existingC].existed_before).toBe(true);
      expect(byPath[notYetExisting].existed_before).toBe(false);
      expect(byPath[notYetExisting].snapshot_path).toBeNull();

      expect(readFileSync(byPath[existingA].snapshot_path, 'utf8')).toBe('old-a');
      expect(readFileSync(byPath[existingB].snapshot_path, 'utf8')).toBe('old-b');
      expect(readFileSync(byPath[existingC].snapshot_path, 'utf8')).toBe('old-c');
    });
  });

  it('aborts before any apply-phase write when a snapshot copy fails', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      writeFileSync(target, 'original');
      const snapshotDir = join(dir, 'snapshot');

      const readFile = () => {
        throw new Error('permission error');
      };

      expect(() =>
        activate(
          { allowedPaths: [target], targets: [{ path: target, content: 'new-content' }] },
          snapshotDir,
          readFile,
        ),
      ).toThrow('permission error');

      expect(readFileSync(target, 'utf8')).toBe('original');
    });
  });

  it('emits a manifest enumerating every applied target with path/existed_before/snapshot_path/new_hash', () => {
    withTmpDir((dir) => {
      const a = join(dir, 'a.json');
      const b = join(dir, 'b', 'c.txt');
      writeFileSync(a, 'old-a-content');
      const snapshotDir = join(dir, 'snapshot');

      const manifest = activate(
        {
          allowedPaths: [a, b],
          targets: [
            { path: a, content: 'new-a-content' },
            { path: b, content: 'new-b-content' },
          ],
        },
        snapshotDir,
      );

      expect(manifest.targets).toHaveLength(2);
      for (const entry of manifest.targets) {
        expect(Object.keys(entry).sort()).toEqual(
          ['existed_before', 'new_hash', 'path', 'snapshot_path'].sort(),
        );
      }

      const byPath = Object.fromEntries(manifest.targets.map((t: any) => [t.path, t]));
      expect(byPath[a].existed_before).toBe(true);
      expect(byPath[a].snapshot_path).toBe(join(snapshotDir, a));
      expect(byPath[b].existed_before).toBe(false);
      expect(byPath[b].snapshot_path).toBeNull();

      expect(readFileSync(a, 'utf8')).toBe('new-a-content');
      expect(readFileSync(b, 'utf8')).toBe('new-b-content');
      expect(existsSync(`${a}.tmp`)).toBe(false);
    });
  });

  it('aborts with zero writes when a target path is outside the declared allowlist', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      const snapshotDir = join(dir, 'snapshot');

      expect(() =>
        activate({ allowedPaths: [], targets: [{ path: target, content: 'new-content' }] }, snapshotDir),
      ).toThrow(/outside declared allowlist/);

      expect(existsSync(target)).toBe(false);
    });
  });

  it('rejects an unsafe allowedPaths entry (dot/dotdot/traversal) instead of silently permitting everything', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      const snapshotDir = join(dir, 'snapshot');

      expect(() =>
        activate({ allowedPaths: ['.'], targets: [{ path: target, content: 'new-content' }] }, snapshotDir),
      ).toThrow(/unsafe allowedPaths entry/);

      expect(existsSync(target)).toBe(false);
    });
  });

  it('attaches a partial manifest to the thrown error when a later target fails mid-apply', () => {
    withTmpDir((dir) => {
      const a = join(dir, 'a.txt');
      const blockerFile = join(dir, 'blocker');
      const b = join(dir, 'blocker', 'b.txt');
      const snapshotDir = join(dir, 'snapshot');

      // Force the second target's write to fail: 'blocker' exists as a
      // plain file, so mkdirSync(dirname(b)) throws (can't mkdir through
      // a file) after 'a.txt' has already been fully applied.
      writeFileSync(blockerFile, '');

      let thrown: any;
      try {
        activate(
          {
            allowedPaths: [a, b],
            targets: [
              { path: a, content: 'new-a' },
              { path: b, content: 'new-b' },
            ],
          },
          snapshotDir,
        );
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeDefined();
      expect(thrown.partialManifest).toBeDefined();
      expect(thrown.partialManifest.targets).toHaveLength(1);
      expect(thrown.partialManifest.targets[0].path).toBe(a);
      expect(readFileSync(a, 'utf8')).toBe('new-a');
    });
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

describe('runCli', () => {
  it('prints usage and returns exit code 2 when required args are missing', () => {
    const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      expect(runCli([])).toBe(2);
      expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('usage:'));
    } finally {
      writeSpy.mockRestore();
    }
  });

  it('runs activation end-to-end, writes stdout and --manifest-out, and returns 0', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      const targetListPath = join(dir, 'target-list.json');
      writeFileSync(
        targetListPath,
        JSON.stringify({ allowedPaths: [target], targets: [{ path: target, content: 'new-content' }] }),
      );
      const snapshotDir = join(dir, 'snapshot');
      const manifestOut = join(dir, 'manifest.json');
      const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      try {
        const code = runCli(['--manifest', targetListPath, '--snapshot-dir', snapshotDir, '--manifest-out', manifestOut]);
        expect(code).toBe(0);
      } finally {
        writeSpy.mockRestore();
      }
      const manifest = JSON.parse(readFileSync(manifestOut, 'utf8'));
      expect(manifest.targets[0].path).toBe(target);
      expect(readFileSync(target, 'utf8')).toBe('new-content');
    });
  });

  it('writes the partial manifest to --manifest-out and returns 1 when activation fails partway through', () => {
    withTmpDir((dir) => {
      const a = join(dir, 'a.txt');
      const blockerFile = join(dir, 'blocker');
      const b = join(dir, 'blocker', 'b.txt');
      writeFileSync(blockerFile, '');
      const targetListPath = join(dir, 'target-list.json');
      writeFileSync(
        targetListPath,
        JSON.stringify({
          allowedPaths: [a, b],
          targets: [
            { path: a, content: 'new-a' },
            { path: b, content: 'new-b' },
          ],
        }),
      );
      const snapshotDir = join(dir, 'snapshot');
      const manifestOut = join(dir, 'manifest.json');
      const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
      try {
        const code = runCli(['--manifest', targetListPath, '--snapshot-dir', snapshotDir, '--manifest-out', manifestOut]);
        expect(code).toBe(1);
        expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('partial manifest written'));
      } finally {
        writeSpy.mockRestore();
      }
      const manifest = JSON.parse(readFileSync(manifestOut, 'utf8'));
      expect(manifest.targets).toHaveLength(1);
      expect(manifest.targets[0].path).toBe(a);
    });
  });
});

describe('activate CLI top-level entrypoint (in-process)', () => {
  // Stryker's vitest runner activates mutants only within the same process;
  // spawnSync-based tests run in a fresh process and can't see mutant
  // activation, so the top-level `if (isMainModule(...))` block needs
  // coverage from a dynamic import inside this process too.
  async function importFresh(bustTag: string) {
    return import(`${pathToFileURL(SCRIPT).href}?bust=${bustTag}`);
  }

  it('runs the CLI and sets exitCode when argv[1] resolves to this module', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0], SCRIPT];
    process.exitCode = undefined;
    const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    try {
      await importFresh('activate-main-true');
      expect(process.exitCode).toBe(2);
    } finally {
      writeSpy.mockRestore();
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });

  it('does not run the CLI when argv[1] resolves to a different module', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0], '/not/this/module.mjs'];
    process.exitCode = undefined;
    try {
      await importFresh('activate-main-false');
      expect(process.exitCode).toBeUndefined();
    } finally {
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });
});

describe('activate CLI entrypoint (subprocess)', () => {
  it('exits 2 with a usage message when required args are missing', () => {
    const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
    expect(result.stderr).toContain('usage:');
    expect(result.status).toBe(2);
  });
});
