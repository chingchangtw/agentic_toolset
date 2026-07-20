import { describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { activate } from '../../scripts/pl-dogfood-activate.mjs';

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
