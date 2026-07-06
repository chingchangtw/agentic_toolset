import { describe, it, expect, vi } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pushCategoryTargets, copyManifestCategory } from '../lib/dedup-helpers.mjs';

describe('pushCategoryTargets', () => {
  it('produces the {src, dest, dir, zipPath} shape for a live-repo call (srcField default: src)', () => {
    const targets = [];
    pushCategoryTargets(targets, [{ src: 'src/skills/foo', dest: 'skills/foo', name: 'foo' }], {
      srcRoot: '/repo',
      destRoot: '/repo/.claude',
      dir: true,
      zipPath: true,
    });
    expect(targets).toEqual([
      { src: '/repo/src/skills/foo', dest: '/repo/.claude/skills/foo', dir: true, zipPath: 'skills/foo' },
    ]);
  });

  it('omits zipPath when not requested (matches the --from-zip call sites)', () => {
    const targets = [];
    pushCategoryTargets(targets, [{ src: 'skills/foo', dest: 'skills/foo', name: 'foo' }], {
      srcRoot: '/extracted',
      destRoot: '/repo/.claude',
      dir: true,
      srcField: 'dest',
    });
    expect(targets).toEqual([{ src: '/extracted/skills/foo', dest: '/repo/.claude/skills/foo', dir: true }]);
  });

  it('resolves src against `dest` (not `src`) for an extracted-zip source, since the zip layout mirrors dest paths', () => {
    const targets = [];
    pushCategoryTargets(targets, [{ src: 'src/hook/bar.py', dest: 'hook/bar.py', name: 'bar' }], {
      srcRoot: '/extracted',
      destRoot: '/repo/.claude',
      dir: false,
      srcField: 'dest',
    });
    expect(targets[0].src).toBe('/extracted/hook/bar.py');
  });

  it('appends one entry per manifest entry across skill + hook + agent categories with the right dir flag each', () => {
    const targets = [];
    pushCategoryTargets(targets, [{ src: 'src/skills/foo', dest: 'skills/foo' }], {
      srcRoot: '/repo',
      destRoot: '/repo/.claude',
      dir: true,
      zipPath: true,
    });
    pushCategoryTargets(targets, [{ src: 'src/hook/bar.py', dest: 'hook/bar.py' }], {
      srcRoot: '/repo',
      destRoot: '/repo/.claude',
      dir: false,
      zipPath: true,
    });
    pushCategoryTargets(targets, [{ src: 'src/agents/baz.md', dest: 'agents/baz.md' }], {
      srcRoot: '/repo',
      destRoot: '/repo/.claude',
      dir: false,
      zipPath: true,
    });
    expect(targets).toHaveLength(3);
    expect(targets.map((t) => t.dir)).toEqual([true, false, false]);
  });

  it('does nothing for an empty entries array', () => {
    const targets = [];
    pushCategoryTargets(targets, [], { srcRoot: '/repo', destRoot: '/repo/.claude', dir: true });
    expect(targets).toEqual([]);
  });
});

describe('copyManifestCategory', () => {
  // Small real temp-file fixtures for the existsSync checks (fast, isolated —
  // not the project tree); cp/validate themselves are stubbed so nothing is
  // actually copied anywhere.
  function makeFixture() {
    const dir = mkdtempSync(join(tmpdir(), 'dedup-helpers-test-'));
    writeFileSync(join(dir, 'present.txt'), 'x');
    return dir;
  }

  it('skills-style (validate passed): calls validate then cp with filtered:true, logs entry[printField]', () => {
    const dir = makeFixture();
    const cp = vi.fn();
    const validate = vi.fn();
    const logs = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
    copyManifestCategory([{ src: 'present.txt', dest: 'out/present.txt', name: 'present' }], {
      rootDir: dir,
      buildDir: '/build',
      cp,
      filtered: true,
      validate,
      label: 'skill',
      printField: 'dest',
    });
    expect(validate).toHaveBeenCalledWith(join(dir, 'present.txt'), 'present');
    expect(cp).toHaveBeenCalledWith(join(dir, 'present.txt'), '/build/out/present.txt', { filtered: true });
    expect(logs.some((l) => l.includes('skill: out/present.txt'))).toBe(true);
    spy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('skills-style: missing source skips validate and cp entirely, warns with the relative src path', () => {
    const dir = makeFixture();
    const cp = vi.fn();
    const validate = vi.fn();
    const warns = [];
    const spy = vi.spyOn(console, 'warn').mockImplementation((m) => warns.push(m));
    copyManifestCategory([{ src: 'missing.txt', dest: 'out/missing.txt', name: 'missing' }], {
      rootDir: dir,
      buildDir: '/build',
      cp,
      validate,
      label: 'skill',
      printField: 'dest',
    });
    expect(validate).not.toHaveBeenCalled();
    expect(cp).not.toHaveBeenCalled();
    expect(warns.some((w) => w.includes('SKIP (missing): missing.txt'))).toBe(true);
    spy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('hooks/agents-style (validate omitted): calls cp with filtered:false (default), logs only if source exists', () => {
    const dir = makeFixture();
    const cp = vi.fn();
    const logs = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
    copyManifestCategory([{ src: 'present.txt', dest: 'out/present.txt', name: 'present-hook' }], {
      rootDir: dir,
      buildDir: '/build',
      cp,
      label: 'hook',
      printField: 'name',
    });
    expect(cp).toHaveBeenCalledWith(join(dir, 'present.txt'), '/build/out/present.txt', { filtered: false });
    expect(logs.some((l) => l.includes('hook: present-hook'))).toBe(true);
    spy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('hooks/agents-style: missing source still calls cp (which is responsible for its own skip+warn), suppresses the success log', () => {
    const dir = makeFixture();
    const cp = vi.fn();
    const logs = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
    copyManifestCategory([{ src: 'missing.txt', dest: 'out/missing.txt', name: 'missing-hook' }], {
      rootDir: dir,
      buildDir: '/build',
      cp,
      label: 'hook',
      printField: 'name',
    });
    expect(cp).toHaveBeenCalledWith(join(dir, 'missing.txt'), '/build/out/missing.txt', { filtered: false });
    expect(logs.some((l) => l.includes('missing-hook'))).toBe(false);
    spy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('throws if printField is missing or not "name"/"dest" — forces every call site to be explicit', () => {
    expect(() =>
      copyManifestCategory([{ src: 'x', dest: 'y', name: 'z' }], { rootDir: '/r', buildDir: '/b', cp: vi.fn(), label: 'x' })
    ).toThrow(/printField must be 'name' or 'dest'/);
    expect(() =>
      copyManifestCategory([{ src: 'x', dest: 'y', name: 'z' }], {
        rootDir: '/r',
        buildDir: '/b',
        cp: vi.fn(),
        label: 'x',
        printField: 'bogus',
      })
    ).toThrow(/printField must be 'name' or 'dest'/);
  });
});
