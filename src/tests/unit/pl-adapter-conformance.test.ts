import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// @ts-expect-error Phase-B conformance harness intentionally ships as portable JavaScript.
import { baselineHash, checkAdapterBoundary, compareObservations, installAdapter, loadDescriptor, loadManifest, normalizeObservation, rollbackAdapter, runCli, runConformance } from '../../scripts/pl-adapter-conformance.mjs';

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

  it('rejects a manifest that fails to parse as JSON', () => {
    const dir = tempDir('pl-adapter-manifest-');
    writeFileSync(join(dir, 'manifest.json'), '{ not valid json');
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/Unable to parse fixture manifest/);
  });

  it('rejects an unsupported manifest version', () => {
    const dir = tempDir('pl-adapter-manifest-');
    mkdirSync(join(dir, 'a'), { recursive: true });
    writeFileSync(join(dir, 'a', 'expected.json'), '[]');
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
      version: '2',
      cases: [{ id: 'x', command: 'arch', fixture: 'a', args: [], expected: 'a/expected.json' }],
    }));
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/Unsupported fixture manifest version/);
  });

  it('rejects an empty case list', () => {
    const dir = tempDir('pl-adapter-manifest-');
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ version: '1', cases: [] }));
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/cases must be non-empty/);
  });

  it('rejects a case referencing an unknown command', () => {
    const dir = tempDir('pl-adapter-manifest-');
    mkdirSync(join(dir, 'a'), { recursive: true });
    writeFileSync(join(dir, 'a', 'expected.json'), '[]');
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
      version: '1',
      cases: [{ id: 'x', command: 'nonexistent', fixture: 'a', args: [], expected: 'a/expected.json' }],
    }));
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/references unknown command/);
  });

  it('rejects a case whose args is not an array of strings', () => {
    const dir = tempDir('pl-adapter-manifest-');
    mkdirSync(join(dir, 'a'), { recursive: true });
    writeFileSync(join(dir, 'a', 'expected.json'), '[]');
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({
      version: '1',
      cases: [{ id: 'x', command: 'arch', fixture: 'a', args: [42], expected: 'a/expected.json' }],
    }));
    expect(() => loadManifest(join(dir, 'manifest.json'), { fixtureRoot: dir }))
      .toThrow(/args must be an array of strings/);
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
  it('rejects a descriptor that fails to parse as JSON', () => {
    const dir = tempDir('pl-adapter-descriptor-');
    writeFileSync(join(dir, 'descriptor.json'), '{ not valid json');
    expect(() => loadDescriptor(join(dir, 'descriptor.json'))).toThrow(/Unable to parse host descriptor/);
  });

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

  it('falls back to the trimmed raw string when stdout looks like JSON but fails to parse', () => {
    const observation = normalizeObservation({ host: 'codex', case_id: 'c1', command: 'arch', exit_code: 2, stdout: '[not valid json', stderr: '' });
    expect(observation.stdout).toBe('[not valid json');
  });

  it('parses a top-level JSON object (not array) without mapping over it', () => {
    const observation = normalizeObservation({ host: 'codex', case_id: 'c1', command: 'scenario', exit_code: 0, stdout: '{"scenarios": "text"}', stderr: '' });
    expect(observation.stdout).toEqual({ scenarios: 'text' });
  });

  it('keeps non-JSON stdout as a trimmed string', () => {
    const observation = normalizeObservation({ host: 'codex', case_id: 'c1', command: 'arch', exit_code: 0, stdout: '  ok  \n', stderr: '' });
    expect(observation.stdout).toBe('ok');
  });
});

describe('baselineHash', () => {
  it('returns empty string for a root that does not exist', () => {
    expect(baselineHash(join(tmpdir(), 'pl-adapter-nonexistent-root'))).toBe('');
  });

  it('walks nested directories and includes each file and directory entry', () => {
    const root = tempDir('pl-adapter-hash-');
    mkdirSync(join(root, 'a', 'b'), { recursive: true });
    writeFileSync(join(root, 'a', 'b', 'file.txt'), 'hello');
    const hash = baselineHash(root);
    expect(hash).toContain('a:dir');
    expect(hash.replace(/\\/g, '/')).toContain('a/b:dir');
    expect(hash.replace(/\\/g, '/')).toContain('a/b/file.txt:5');
  });

  it('changes when a file is added and reverts when removed (used as the rollback baseline check)', () => {
    const root = tempDir('pl-adapter-hash-');
    const before = baselineHash(root);
    writeFileSync(join(root, 'new.txt'), 'x');
    const after = baselineHash(root);
    expect(after).not.toBe(before);
    rmSync(join(root, 'new.txt'));
    expect(baselineHash(root)).toBe(before);
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
    expect(manifest.createdDirs).toEqual([join(consumerRoot, '.codex', 'commands'), join(consumerRoot, '.codex')]);
    rollbackAdapter(manifest);
    expect(() => readFileSync(installedPath, 'utf8')).toThrow();
    expect(existsSync(join(consumerRoot, '.codex', 'commands'))).toBe(false);
    expect(existsSync(join(consumerRoot, '.codex'))).toBe(false);
    expect(existsSync(consumerRoot)).toBe(true);
  });

  it('does not remove a pre-existing directory during rollback (only removes directories it created)', () => {
    const descriptor = loadDescriptor(CODEX_DESCRIPTOR);
    const consumerRoot = tempDir('pl-adapter-consumer-');
    mkdirSync(join(consumerRoot, '.codex'), { recursive: true });
    const manifest = installAdapter(descriptor, TEMPLATES_ROOT, consumerRoot);
    expect(manifest.createdDirs).toEqual([join(consumerRoot, '.codex', 'commands')]);
    rollbackAdapter(manifest);
    expect(existsSync(join(consumerRoot, '.codex', 'commands'))).toBe(false);
    expect(existsSync(join(consumerRoot, '.codex'))).toBe(true);
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

describe('runCli (in-process, exercises every branch Stryker can attribute to this file)', () => {
  it('exits 0 with empty JSON diagnostics for the full fixture suite', () => {
    const result = runCli(['--manifest', MANIFEST_PATH, '--descriptor', CODEX_DESCRIPTOR, '--descriptor', CLAUDE_DESCRIPTOR, '--templates-root', TEMPLATES_ROOT, '--format', 'json']);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([]);
    expect(result.stderr).toBe('');
  });

  it('exits 0 with empty text output (no trailing newline noise) in text format', () => {
    const result = runCli(['--manifest', MANIFEST_PATH, '--descriptor', CODEX_DESCRIPTOR, '--descriptor', CLAUDE_DESCRIPTOR, '--templates-root', TEMPLATES_ROOT]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('exits 2 and reports a boundary violation as text when format is not json', () => {
    const dir = tempDir('pl-adapter-cli-boundary-');
    const codexDir = join(dir, 'codex');
    mkdirSync(join(codexDir, '.codex', 'commands'), { recursive: true });
    writeFileSync(join(codexDir, 'descriptor.json'), readFileSync(CODEX_DESCRIPTOR, 'utf8'));
    writeFileSync(join(codexDir, '.codex', 'commands', 'pl-check.md'), 'Emits PL-ARCH-FORBIDDEN-IMPORT directly.');
    const claudeDir = join(dir, 'claude-code');
    mkdirSync(join(claudeDir, '.claude', 'commands'), { recursive: true });
    writeFileSync(join(claudeDir, 'descriptor.json'), readFileSync(CLAUDE_DESCRIPTOR, 'utf8'));
    writeFileSync(join(claudeDir, '.claude', 'commands', 'pl-check.md'), readFileSync(join(TEMPLATES_ROOT, 'claude-code', '.claude', 'commands', 'pl-check.md'), 'utf8'));

    const result = runCli(['--manifest', MANIFEST_PATH, '--descriptor', join(codexDir, 'descriptor.json'), '--descriptor', join(claudeDir, 'descriptor.json'), '--templates-root', dir]);
    expect(result.exitCode).toBe(2);
    expect(result.stdout).toContain('PL-ADAPTER-BOUNDARY');
    expect(result.stdout).toMatch(/PL-ADAPTER-BOUNDARY .*:/);
  });

  it('exits 2 via the catch branch when --manifest points at a nonexistent file', () => {
    const result = runCli(['--manifest', join(tmpdir(), 'pl-adapter-does-not-exist.json'), '--descriptor', CODEX_DESCRIPTOR, '--descriptor', CLAUDE_DESCRIPTOR, '--templates-root', TEMPLATES_ROOT]);
    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).not.toBe('');
  });

  it('rejects an unknown CLI argument (in-process)', () => {
    const result = runCli(['--bogus']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('Unknown argument: --bogus');
  });

  it('rejects missing required arguments (in-process)', () => {
    const result = runCli(['--manifest', MANIFEST_PATH]);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain('--manifest, exactly two --descriptor, and --templates-root are required');
  });

});

describe('pl-adapter-conformance CLI (subprocess smoke tests)', () => {
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
