import { describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { activate } from '../../scripts/pl-dogfood-activate.mjs';
// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { rollback, isMainModule, runCli } from '../../scripts/pl-dogfood-rollback.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/pl-dogfood-rollback.mjs', import.meta.url));

function withTmpDir(fn: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'pl-dogfood-rollback-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('rollback', () => {
  it('produces an empty diff for both existed-before and did-not-exist-before targets', () => {
    withTmpDir((dir) => {
      const existing = join(dir, 'a.txt');
      const notYetExisting = join(dir, 'b.txt');
      writeFileSync(existing, 'original-content');
      const snapshotDir = join(dir, 'snapshot');

      const manifest = activate(
        {
          allowedPaths: [existing, notYetExisting],
          targets: [
            { path: existing, content: 'new-content' },
            { path: notYetExisting, content: 'brand-new-content' },
          ],
        },
        snapshotDir,
      );

      expect(readFileSync(existing, 'utf8')).toBe('new-content');
      expect(readFileSync(notYetExisting, 'utf8')).toBe('brand-new-content');

      const result = rollback(manifest);
      expect(result.restored).toBe(2);

      expect(readFileSync(existing, 'utf8')).toBe('original-content');
      expect(existsSync(notYetExisting)).toBe(false);
    });
  });

  it('refuses to restore (aborts before any write) when a target diverged from the recorded post-activation state', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      writeFileSync(target, 'original-content');
      const snapshotDir = join(dir, 'snapshot');

      const manifest = activate(
        { allowedPaths: [target], targets: [{ path: target, content: 'new-content' }] },
        snapshotDir,
      );

      // Simulate a concurrent external write landing on the target after
      // activation completed but before rollback runs.
      writeFileSync(target, 'concurrently-modified-content');

      expect(() => rollback(manifest)).toThrow(/diverged from activation state/);
      // Rollback aborted before touching anything -- the concurrent edit survives.
      expect(readFileSync(target, 'utf8')).toBe('concurrently-modified-content');
    });
  });

  it('detects a mismatch via injected divergence and names the path', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      writeFileSync(target, 'original-content');
      const snapshotDir = join(dir, 'snapshot');

      const manifest = activate(
        { allowedPaths: [target], targets: [{ path: target, content: 'new-content' }] },
        snapshotDir,
      );

      const readFile = (path: string) =>
        path === target ? 'concurrently-modified-content' : readFileSync(path, 'utf8');

      expect(() => rollback(manifest, readFile)).toThrow(target);
    });
  });

  it("post-restore verification independently detects a mismatch even when the pre-restore check passes", () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      writeFileSync(target, 'original-content');
      const snapshotDir = join(dir, 'snapshot');

      const manifest = activate(
        { allowedPaths: [target], targets: [{ path: target, content: 'new-content' }] },
        snapshotDir,
      );

      let targetReadCount = 0;
      const readFile = (path: string) => {
        if (path === target) {
          targetReadCount += 1;
          // 1st read = pre-restore integrity check (must match new_hash to pass
          // through to the restore step). 2nd read = post-restore verify's
          // "actual" read -- force a mismatch there specifically.
          return targetReadCount === 1 ? readFileSync(target, 'utf8') : 'corrupted-after-restore';
        }
        return readFileSync(path, 'utf8');
      };

      expect(() => rollback(manifest, readFile)).toThrow('rollback mismatch');
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

  it('runs rollback end-to-end and returns 0 on success', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      writeFileSync(target, 'original-content');
      const snapshotDir = join(dir, 'snapshot');
      const manifest = activate(
        { allowedPaths: [target], targets: [{ path: target, content: 'new-content' }] },
        snapshotDir,
      );
      const manifestPath = join(dir, 'manifest.json');
      writeFileSync(manifestPath, JSON.stringify(manifest));

      const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
      try {
        expect(runCli(['--manifest', manifestPath])).toBe(0);
        expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('"restored": 1'));
      } finally {
        writeSpy.mockRestore();
      }
      expect(readFileSync(target, 'utf8')).toBe('original-content');
    });
  });

  it('returns 1 and writes an error message when rollback throws', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      writeFileSync(target, 'original-content');
      const snapshotDir = join(dir, 'snapshot');
      const manifest = activate(
        { allowedPaths: [target], targets: [{ path: target, content: 'new-content' }] },
        snapshotDir,
      );
      writeFileSync(target, 'tampered-content');
      const manifestPath = join(dir, 'manifest.json');
      writeFileSync(manifestPath, JSON.stringify(manifest));

      const writeSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
      try {
        expect(runCli(['--manifest', manifestPath])).toBe(1);
        expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('diverged from activation state'));
      } finally {
        writeSpy.mockRestore();
      }
    });
  });
});

describe('rollback CLI top-level entrypoint (in-process)', () => {
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
      await importFresh('rollback-main-true');
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
      await importFresh('rollback-main-false');
      expect(process.exitCode).toBeUndefined();
    } finally {
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });
});

describe('rollback CLI entrypoint (subprocess)', () => {
  it('exits 2 with a usage message when required args are missing', () => {
    const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
    expect(result.stderr).toContain('usage:');
    expect(result.status).toBe(2);
  });
});
