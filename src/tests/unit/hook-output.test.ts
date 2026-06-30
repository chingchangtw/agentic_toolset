import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const HOOK = fileURLToPath(new URL('../../hook/inject-workflow-state.sh', import.meta.url));
const FIXTURES_PHASES = fileURLToPath(new URL('../fixtures/phases', import.meta.url));
const FIXTURE_ITERATION = fileURLToPath(new URL('../fixtures/iteration-active.json', import.meta.url));

function runHook(projectDir: string): string {
  const result = spawnSync('bash', [HOOK], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    encoding: 'utf8',
  });
  return result.stdout ?? '';
}

function setupDeliveryFixture(phase: string, epicId: string | null = 'test-epic-001'): string {
  const dir = mkdtempSync(join(tmpdir(), 'hook-test-'));
  mkdirSync(join(dir, '.ai', 'ts-deliver-router'), { recursive: true });
  writeFileSync(join(dir, '.ai', 'ts-deliver-router', 'state.json'), JSON.stringify({ current_phase: phase }));
  writeFileSync(join(dir, '.ai', 'iteration.json'), JSON.stringify({ active_epic: epicId, dial: 'MID' }));
  return dir;
}

const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

function track(dir: string): string {
  tmpDirs.push(dir);
  return dir;
}

describe('inject-workflow-state.sh — delivery phase output', () => {
  it('think phase → [WORKFLOW STATE] + Spectra:discuss', () => {
    const dir = track(setupDeliveryFixture('think'));
    const out = runHook(dir);
    expect(out).toContain('[WORKFLOW STATE]');
    expect(out).toContain('Spectra:discuss');
  });

  it('plan phase → Spectra:propose', () => {
    const dir = track(setupDeliveryFixture('plan'));
    expect(runHook(dir)).toContain('Spectra:propose');
  });

  it('build phase → Spectra:apply', () => {
    const dir = track(setupDeliveryFixture('build'));
    expect(runHook(dir)).toContain('Spectra:apply');
  });

  it('review phase → staff-review', () => {
    const dir = track(setupDeliveryFixture('review'));
    expect(runHook(dir)).toContain('staff-review');
  });

  it('test phase → acceptance', () => {
    const dir = track(setupDeliveryFixture('test'));
    expect(runHook(dir)).toContain('acceptance');
  });

  it('ship phase → Spectra:archive', () => {
    const dir = track(setupDeliveryFixture('ship'));
    expect(runHook(dir)).toContain('Spectra:archive');
  });

  it('reflect phase → ts-iteration:next', () => {
    const dir = track(setupDeliveryFixture('reflect'));
    expect(runHook(dir)).toContain('ts-iteration:next');
  });

  it('unknown phase → Unknown phase warning', () => {
    const dir = track(setupDeliveryFixture('bogus'));
    expect(runHook(dir)).toContain('Unknown phase');
  });

  it('active_epic=null → "active epic: none"', () => {
    const dir = track(setupDeliveryFixture('build', null));
    expect(runHook(dir)).toContain('active epic: none');
  });

  it('CLAUDE_PROJECT_DIR is used (not pwd)', () => {
    const dir = track(setupDeliveryFixture('ship'));
    // hook reads from CLAUDE_PROJECT_DIR — verify output matches the dir we set up
    const out = runHook(dir);
    expect(out).toContain('[WORKFLOW STATE]');
    expect(out).toContain('Spectra:archive');
  });
});

describe('inject-workflow-state.sh — no state files', () => {
  it('empty dir → silent (no output)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hook-empty-'));
    tmpDirs.push(dir);
    expect(runHook(dir)).toBe('');
  });
});

// D4: malformed state yields empty output by design — not a failing assertion.
// The hook is silent-on-error: jq errors or invalid JSON produce empty stdout.
// This behavior is intentional (accepted risk per CEO D4). Do not assert fail-loud here.
describe('inject-workflow-state.sh — D4 silent-on-error', () => {
  it('malformed state.json → empty output (silent-on-error by design)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hook-malformed-'));
    tmpDirs.push(dir);
    mkdirSync(join(dir, '.ai', 'ts-deliver-router'), { recursive: true });
    writeFileSync(join(dir, '.ai', 'ts-deliver-router', 'state.json'), '{bad json');
    expect(runHook(dir)).toBe('');
  });
});
