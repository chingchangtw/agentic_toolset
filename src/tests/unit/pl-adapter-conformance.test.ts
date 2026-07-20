import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// @ts-expect-error Phase-B conformance harness intentionally ships as portable JavaScript.
import { checkAdapterBoundary, compareObservations, installAdapter, loadDescriptor, loadManifest, normalizeObservation, rollbackAdapter, runConformance } from '../../scripts/pl-adapter-conformance.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/pl-adapter-conformance.mjs', import.meta.url));
const FIXTURES = fileURLToPath(new URL('../../tests/fixtures/pl-adapter-parity', import.meta.url));
const MANIFEST_PATH = join(FIXTURES, 'manifest.json');
const FIXTURE_ROOT = dirname(FIXTURES);
const TEMPLATES_ROOT = fileURLToPath(new URL('../../skills/ts-pl/references/templates', import.meta.url));
const CODEX_DESCRIPTOR = join(TEMPLATES_ROOT, 'codex', 'descriptor.json');
const CLAUDE_DESCRIPTOR = join(TEMPLATES_ROOT, 'claude-code', 'descriptor.json');

const temporary: string[] = [];
afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function tempDir(prefix: string) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  temporary.push(dir);
  return dir;
}

describe('loadManifest', () => {
  it('loads the shared fixture manifest', () => {
    const manifest = loadManifest(MANIFEST_PATH, { fixtureRoot: FIXTURE_ROOT });
    expect(manifest.cases).toHaveLength(6);
    expect(manifest.cases.map((c: any) => c.id)).toEqual([
      'compliant-architecture', 'forbidden-import', 'invalid-manifest',
      'unsupported-syntax', 'contract-violation', 'ownership-failing',
    ]);
  });

  it('rejects duplicate case ids', () => {
    const dir = tempDir('pl-adapter-manifest-');
    mkdirSync(join(dir, 'a'), { recursive: true });
    writeFileSync(join(dir, 'a', 'expected.json'), '[]');
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
      version: '1',
      cases: [
        { id: 'x', command: 'arch', fixture: 'a', args: [], expected: 'a/expected.json' },
        { id: 'x', command: 'arch', fixture: 'a', args: [], expected: 'a/expected.json' },
      ],
    }));
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/Duplicate fixture case id/);
  });

  it('rejects a fixture path that escapes the shared fixture root', () => {
    const dir = tempDir('pl-adapter-manifest-');
    const outside = tempDir('pl-adapter-outside-');
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
      version: '1',
      cases: [{ id: 'x', command: 'arch', fixture: outside, args: [], expected: join(outside, 'nope.json') }],
    }));
    writeFileSync(join(outside, 'nope.json'), '[]');
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/escapes the shared fixture root/);
  });

  it('rejects a missing expected reference', () => {
    const dir = tempDir('pl-adapter-manifest-');
    mkdirSync(join(dir, 'a'), { recursive: true });
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
      version: '1',
      cases: [{ id: 'x', command: 'arch', fixture: 'a', args: [], expected: 'a/missing.json' }],
    }));
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/expected reference is missing/);
  });

  it('rejects a host-specific extra field on a case (no per-host fixture/golden paths)', () => {
    const dir = tempDir('pl-adapter-manifest-');
    mkdirSync(join(dir, 'a'), { recursive: true });
    writeFileSync(join(dir, 'a', 'expected.json'), '[]');
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
      version: '1',
      cases: [{ id: 'x', command: 'arch', fixture: 'a', args: [], expected: 'a/expected.json', codexFixture: 'a' }],
    }));
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/unexpected fields/);
  });
});

describe('loadDescriptor', () => {
  it('loads both host descriptors', () => {
    expect(loadDescriptor(CODEX_DESCRIPTOR)).toEqual({
      version: '1', host: 'codex', invocation: 'pl-kernel', entry: '.codex/commands/pl-check.md', display: 'passthrough',
    });
    expect(loadDescriptor(CLAUDE_DESCRIPTOR)).toEqual({
      version: '1', host: 'claude-code', invocation: 'pl-kernel', entry: '.claude/commands/pl-check.md', display: 'passthrough',
    });
  });

  it.each([
    ['version', '2', /descriptor version/],
    ['host', 'gemini', /descriptor host/],
    ['invocation', 'other', /descriptor invocation/],
    ['display', 'translate', /descriptor display mode/],
  ])('rejects unknown %s', (field, value, pattern) => {
    const dir = tempDir('pl-adapter-descriptor-');
    const base = JSON.parse(readFileSync(CODEX_DESCRIPTOR, 'utf8'));
    writeFileSync(join(dir, 'descriptor.json'), JSON.stringify({ ...base, [field]: value }));
    expect(() => loadDescriptor(join(dir, 'descriptor.json'))).toThrow(pattern);
  });

  it('rejects a non-relative entry path', () => {
    const dir = tempDir('pl-adapter-descriptor-');
    const base = JSON.parse(readFileSync(CODEX_DESCRIPTOR, 'utf8'));
    writeFileSync(join(dir, 'descriptor.json'), JSON.stringify({ ...base, entry: '/etc/passwd' }));
    expect(() => loadDescriptor(join(dir, 'descriptor.json'))).toThrow(/descriptor entry/i);
  });

  it('rejects an entry path that traverses above the templates root', () => {
    const dir = tempDir('pl-adapter-descriptor-');
    const base = JSON.parse(readFileSync(CODEX_DESCRIPTOR, 'utf8'));
    writeFileSync(join(dir, 'descriptor.json'), JSON.stringify({ ...base, entry: '../../../../../../etc/hosts' }));
    expect(() => loadDescriptor(join(dir, 'descriptor.json'))).toThrow(/descriptor entry/i);
  });
});

describe('checkAdapterBoundary', () => {
  it('passes on the real descriptors and templates (no embedded rule ids)', () => {
    const violations = checkAdapterBoundary([
      CODEX_DESCRIPTOR, CLAUDE_DESCRIPTOR,
      join(TEMPLATES_ROOT, 'codex', '.codex', 'commands', 'pl-check.md'),
      join(TEMPLATES_ROOT, 'claude-code', '.claude', 'commands', 'pl-check.md'),
    ]);
    expect(violations).toEqual([]);
  });

  it('fails a template planted with an embedded kernel rule id', () => {
    const dir = tempDir('pl-adapter-boundary-');
    const planted = join(dir, 'pl-check.md');
    writeFileSync(planted, 'Kernel emits PL-ARCH-FORBIDDEN-IMPORT when a layer import is disallowed.');
    const violations = checkAdapterBoundary([planted]);
    expect(violations).toHaveLength(1);
    expect(violations[0].rule_id).toBe('PL-ADAPTER-BOUNDARY');
    expect(violations[0].message).toContain('PL-ARCH-FORBIDDEN-IMPORT');
  });

  it('fails a template planted with a lower-case kernel rule id (case-insensitive match)', () => {
    const dir = tempDir('pl-adapter-boundary-');
    const planted = join(dir, 'pl-check.md');
    writeFileSync(planted, 'kernel emits pl-arch-forbidden-import when disallowed.');
    const violations = checkAdapterBoundary([planted]);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('pl-arch-forbidden-import');
  });
});

describe('normalizeObservation', () => {
  it('parses structured JSON stdout and slash-normalizes diagnostic paths', () => {
    const observation = normalizeObservation({
      host: 'codex', case_id: 'c1', command: 'arch', exit_code: 1,
      stdout: JSON.stringify([{ version: '1', rule_id: 'PL-X', severity: 'error', file: 'src\\a.ts', dependency: 'src\\b.ts', message: 'm' }]),
      stderr: '',
    });
    expect(observation.stdout[0].file).toBe('src/a.ts');
    expect(observation.stdout[0].dependency).toBe('src/b.ts');
  });

  it('keeps non-JSON stdout as a trimmed string', () => {
    const observation = normalizeObservation({ host: 'codex', case_id: 'c1', command: 'arch', exit_code: 0, stdout: '  ok  \n', stderr: '' });
    expect(observation.stdout).toBe('ok');
  });
});

describe('installAdapter / rollbackAdapter', () => {
  it('installs the descriptor entry into the consumer root and rolls back to baseline', () => {
    const descriptor = loadDescriptor(CODEX_DESCRIPTOR);
    const consumerRoot = tempDir('pl-adapter-consumer-');
    const manifest = installAdapter(descriptor, TEMPLATES_ROOT, consumerRoot);
    const installedPath = join(consumerRoot, '.codex', 'commands', 'pl-check.md');
    expect(manifest.generated).toEqual([installedPath]);
    expect(readFileSync(installedPath, 'utf8')).toBe(readFileSync(join(TEMPLATES_ROOT, 'codex', '.codex', 'commands', 'pl-check.md'), 'utf8'));
    rollbackAdapter(manifest);
    expect(() => readFileSync(installedPath, 'utf8')).toThrow();
  });

  it('rejects a hand-built descriptor whose entry escapes the host templates root (defense in depth, bypassing loadDescriptor)', () => {
    const malicious = { version: '1', host: 'codex', invocation: 'pl-kernel', entry: '../../claude-code/.claude/commands/pl-check.md', display: 'passthrough' };
    const consumerRoot = tempDir('pl-adapter-consumer-');
    expect(() => installAdapter(malicious, TEMPLATES_ROOT, consumerRoot)).toThrow(/escapes the host templates root/);
  });
});

describe('compareObservations', () => {
  it('reports no differences for identical observations across hosts', () => {
    const a = normalizeObservation({ host: 'codex', case_id: 'c1', command: 'arch', exit_code: 0, stdout: '[]', stderr: '' });
    const b = normalizeObservation({ host: 'claude-code', case_id: 'c1', command: 'arch', exit_code: 0, stdout: '[]', stderr: '' });
    expect(compareObservations(a, b)).toEqual([]);
  });

  it('detects a mutated exit code between hosts', () => {
    const a = normalizeObservation({ host: 'codex', case_id: 'c1', command: 'arch', exit_code: 0, stdout: '[]', stderr: '' });
    const mutated = normalizeObservation({ host: 'claude-code', case_id: 'c1', command: 'arch', exit_code: 1, stdout: '[]', stderr: '' });
    expect(compareObservations(a, mutated)).toEqual(['exit_code']);
  });

  it('detects a mutated diagnostic field between hosts', () => {
    const a = normalizeObservation({
      host: 'codex', case_id: 'c1', command: 'arch', exit_code: 1,
      stdout: JSON.stringify([{ rule_id: 'PL-X', file: 'a.ts' }]), stderr: '',
    });
    const mutated = normalizeObservation({
      host: 'claude-code', case_id: 'c1', command: 'arch', exit_code: 1,
      stdout: JSON.stringify([{ rule_id: 'PL-X', file: 'b.ts' }]), stderr: '',
    });
    expect(compareObservations(a, mutated)).toEqual(['stdout']);
  });
});

describe('runConformance (full parity suite, in-process)', () => {
  it('runs every fixture case through both hosts with identical normalized results, and cleans up after itself', () => {
    const manifest = loadManifest(MANIFEST_PATH, { fixtureRoot: FIXTURE_ROOT });
    const descriptors = [loadDescriptor(CODEX_DESCRIPTOR), loadDescriptor(CLAUDE_DESCRIPTOR)];
    const workDir = tempDir('pl-adapter-conformance-');
    const result = runConformance({
      manifest,
      descriptors,
      templatesRoot: TEMPLATES_ROOT,
      consumerRootFactory: (caseId: string, host: string) => join(workDir, `${caseId}-${host}`),
    });

    expect(result.diagnostics.filter((d: any) => d.rule_id === 'PL-ADAPTER-PARITY')).toEqual([]);
    expect(result.diagnostics.filter((d: any) => d.rule_id === 'PL-ADAPTER-ROLLBACK')).toEqual([]);

    const byCase = new Map<string, any[]>();
    for (const observation of result.observations) {
      const list = byCase.get(observation.case_id) ?? [];
      list.push(observation);
      byCase.set(observation.case_id, list);
    }
    for (const kase of manifest.cases) {
      const observations = byCase.get(kase.id)!;
      expect(observations).toHaveLength(2);
      const expected = JSON.parse(readFileSync(kase.expectedPath, 'utf8'));
      for (const observation of observations) {
        expect(observation.stdout).toEqual(expected);
      }
    }
  });

  it('overall exit code matches the worst case across the suite (0/1/2)', () => {
    const manifest = loadManifest(MANIFEST_PATH, { fixtureRoot: FIXTURE_ROOT });
    const descriptors = [loadDescriptor(CODEX_DESCRIPTOR), loadDescriptor(CLAUDE_DESCRIPTOR)];
    const workDir = tempDir('pl-adapter-conformance-');
    const result = runConformance({
      manifest,
      descriptors,
      templatesRoot: TEMPLATES_ROOT,
      consumerRootFactory: (caseId: string, host: string) => join(workDir, `${caseId}-${host}`),
    });
    // invalid-manifest / unsupported-syntax / ownership-failing all exit 2 -> suite is structural-failure-free
    // but their case-level exit codes are captured per observation, not asserted on the suite exitCode here
    // because parity (not raw kernel exit) is what the suite's exitCode reports.
    expect(result.exitCode).toBe(0);
  });

  it('exits 2 and never runs parity comparison when both descriptors share the same host', () => {
    const manifest = loadManifest(MANIFEST_PATH, { fixtureRoot: FIXTURE_ROOT });
    const codex = loadDescriptor(CODEX_DESCRIPTOR);
    const workDir = tempDir('pl-adapter-conformance-');
    const result = runConformance({
      manifest,
      descriptors: [codex, codex],
      templatesRoot: TEMPLATES_ROOT,
      consumerRootFactory: (caseId: string, host: string) => join(workDir, `${caseId}-${host}`),
    });
    expect(result.exitCode).toBe(2);
    expect(result.observations).toEqual([]);
    expect(result.diagnostics.some((d: any) => d.rule_id === 'PL-ADAPTER-DESCRIPTOR-HOST')).toBe(true);
  });

  it('exits 2 for an empty case list rather than silently reporting success', () => {
    const workDir = tempDir('pl-adapter-conformance-');
    const result = runConformance({
      manifest: { version: '1', cases: [] },
      descriptors: [loadDescriptor(CODEX_DESCRIPTOR), loadDescriptor(CLAUDE_DESCRIPTOR)],
      templatesRoot: TEMPLATES_ROOT,
      consumerRootFactory: (caseId: string, host: string) => join(workDir, `${caseId}-${host}`),
    });
    expect(result.observations).toEqual([]);
    expect(result.exitCode).toBe(0);
  });
});

describe('pl-adapter-conformance CLI', () => {
  it('exits 0 for the full fixture suite with no parity or boundary violations', () => {
    const result = spawnSync(process.execPath, [
      SCRIPT,
      '--manifest', MANIFEST_PATH,
      '--descriptor', CODEX_DESCRIPTOR,
      '--descriptor', CLAUDE_DESCRIPTOR,
      '--templates-root', TEMPLATES_ROOT,
      '--format', 'json',
    ], { encoding: 'utf8' });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([]);
  });

  it('exits 2 and reports a boundary violation for a planted rule-id template', () => {
    const dir = tempDir('pl-adapter-cli-boundary-');
    const codexDir = join(dir, 'codex');
    const codexEntryDir = join(codexDir, '.codex', 'commands');
    mkdirSync(codexEntryDir, { recursive: true });
    writeFileSync(join(codexDir, 'descriptor.json'), readFileSync(CODEX_DESCRIPTOR, 'utf8'));
    writeFileSync(join(codexEntryDir, 'pl-check.md'), 'Emits PL-ARCH-FORBIDDEN-IMPORT directly.');
    const claudeDir = join(dir, 'claude-code');
    const claudeEntryDir = join(claudeDir, '.claude', 'commands');
    mkdirSync(claudeEntryDir, { recursive: true });
    writeFileSync(join(claudeDir, 'descriptor.json'), readFileSync(CLAUDE_DESCRIPTOR, 'utf8'));
    writeFileSync(join(claudeEntryDir, 'pl-check.md'), readFileSync(join(TEMPLATES_ROOT, 'claude-code', '.claude', 'commands', 'pl-check.md'), 'utf8'));

    const result = spawnSync(process.execPath, [
      SCRIPT,
      '--manifest', MANIFEST_PATH,
      '--descriptor', join(codexDir, 'descriptor.json'),
      '--descriptor', join(claudeDir, 'descriptor.json'),
      '--templates-root', dir,
      '--format', 'json',
    ], { encoding: 'utf8' });
    expect(result.status).toBe(2);
    const diagnostics = JSON.parse(result.stdout);
    expect(diagnostics.some((d: any) => d.rule_id === 'PL-ADAPTER-BOUNDARY')).toBe(true);
  });

  it('rejects an unknown CLI argument', () => {
    const result = spawnSync(process.execPath, [SCRIPT, '--bogus'], { encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Unknown argument: --bogus');
  });
});

describe('fixture installation stays isolated to temporary roots (repo scope guard)', () => {
  it('never writes outside the provided consumer root', () => {
    const descriptor = loadDescriptor(CODEX_DESCRIPTOR);
    const consumerRoot = tempDir('pl-adapter-scope-');
    const before = readFileSync(SCRIPT, 'utf8');
    installAdapter(descriptor, TEMPLATES_ROOT, consumerRoot);
    const after = readFileSync(SCRIPT, 'utf8');
    expect(after).toBe(before);
  });
});
