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
  mkdirSync(join(dir, '.agents', 'ts-deliver-router'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'ts-deliver-router', 'state.json'), JSON.stringify({ current_phase: phase }));
  writeFileSync(join(dir, '.agents', 'iteration.json'), JSON.stringify({ active_epic: epicId, dial: 'MID' }));
  return dir;
}

function setupDeliveryFixtureWithEpicType(phase: string, epicType: string, epicId = 'test-epic-001'): string {
  const dir = mkdtempSync(join(tmpdir(), 'hook-test-'));
  mkdirSync(join(dir, '.agents', 'ts-deliver-router'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'ts-deliver-router', 'state.json'), JSON.stringify({ current_phase: phase }));
  writeFileSync(
    join(dir, '.agents', 'iteration.json'),
    JSON.stringify({ active_epic: epicId, dial: 'MID', epics: [{ id: epicId, type: epicType }] })
  );
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

  it('reflect phase, spike epic → write learning entry before ts-iteration:next', () => {
    const dir = track(setupDeliveryFixtureWithEpicType('reflect', 'spike'));
    expect(runHook(dir)).toContain('Write learning entry to discovery.json first');
  });

  it('reflect phase, non-spike epic → no learning-entry clause', () => {
    const dir = track(setupDeliveryFixtureWithEpicType('reflect', 'refactor'));
    expect(runHook(dir)).not.toContain('learning entry');
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
    mkdirSync(join(dir, '.agents', 'ts-deliver-router'), { recursive: true });
    writeFileSync(join(dir, '.agents', 'ts-deliver-router', 'state.json'), '{bad json');
    expect(runHook(dir)).toBe('');
  });
});

function setupDiscoveryFixture(ideas: unknown[] | null): string {
  const dir = mkdtempSync(join(tmpdir(), 'hook-disc-'));
  mkdirSync(join(dir, '.agents'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'iteration.json'), JSON.stringify({ active_epic: null, dial: 'MID' }));
  if (ideas !== null) {
    writeFileSync(join(dir, '.agents', 'discovery.json'), JSON.stringify({ project: 'x', ideas }));
  }
  return dir;
}

describe('inject-workflow-state.sh — discovery branch [NEXT]', () => {
  it('no discovery.json → seed suggestion', () => {
    const out = runHook(track(setupDiscoveryFixture(null)));
    expect(out).toContain('[WORKFLOW STATE] Discovery');
    expect(out).toContain('/ts-discover idea');
  });

  it('empty ideas → seed suggestion', () => {
    expect(runHook(track(setupDiscoveryFixture([])))).toContain('/ts-discover idea');
  });

  it('status=idea → explore with id', () => {
    const out = runHook(track(setupDiscoveryFixture([{ id: 'idea-001', status: 'idea' }])));
    expect(out).toContain('/ts-discover explore idea-001');
  });

  it('status=exploring → validate-or-decide with id', () => {
    const out = runHook(track(setupDiscoveryFixture([{ id: 'idea-002', status: 'exploring' }])));
    expect(out).toContain('/ts-discover validate idea-002');
  });

  it('validating outranks exploring (focus priority)', () => {
    const out = runHook(track(setupDiscoveryFixture([
      { id: 'idea-003', status: 'exploring' },
      { id: 'idea-004', status: 'validating' },
    ])));
    expect(out).toContain('/ts-discover decide idea-004');
  });

  it('status=ready → plan --sync', () => {
    const out = runHook(track(setupDiscoveryFixture([{ id: 'idea-005', status: 'ready' }])));
    expect(out).toContain('/ts-project plan --sync');
  });

  it('malformed discovery.json → state line still printed, no crash', () => {
    const dir = track(setupDiscoveryFixture(null));
    writeFileSync(join(dir, '.agents', 'discovery.json'), '{bad');
    const out = runHook(dir);
    expect(out).toContain('[WORKFLOW STATE] Discovery');
    expect(out).toContain('[NEXT]');
  });
});
