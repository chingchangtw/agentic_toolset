import { describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { activate } from '../../scripts/pl-dogfood-activate.mjs';
// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { rollback } from '../../scripts/pl-dogfood-rollback.mjs';

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
          allowedPaths: [dir],
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

  it('detects a mismatch and names the path when a restored target diverges from its snapshot', () => {
    withTmpDir((dir) => {
      const target = join(dir, 'a.txt');
      writeFileSync(target, 'original-content');
      const snapshotDir = join(dir, 'snapshot');

      const manifest = activate(
        { allowedPaths: [dir], targets: [{ path: target, content: 'new-content' }] },
        snapshotDir,
      );

      // Simulate a concurrent external write landing on the target between
      // rollback's own restore step and its post-restore verification: the
      // injected reader reports different bytes for the target path than
      // what rollback itself just restored.
      const readFile = (path: string) =>
        path === target ? 'concurrently-modified-content' : readFileSync(path, 'utf8');

      expect(() => rollback(manifest, readFile)).toThrow(target);
    });
  });
});
