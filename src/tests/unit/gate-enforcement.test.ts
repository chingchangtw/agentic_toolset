import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

// edges 1,2,4,5 covered by BDD S10-S12

const HOOK = fileURLToPath(new URL('../../hook/inject-workflow-state.sh', import.meta.url));

const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

function setupStateFixture(stateJson: object, iterationJson: object = { active_epic: 'test-epic', dial: 'MID' }): string {
  const dir = mkdtempSync(join(tmpdir(), 'gate-test-'));
  tmpDirs.push(dir);
  mkdirSync(join(dir, '.ai', 'ts-deliver-router'), { recursive: true });
  writeFileSync(join(dir, '.ai', 'ts-deliver-router', 'state.json'), JSON.stringify(stateJson));
  writeFileSync(join(dir, '.ai', 'iteration.json'), JSON.stringify(iterationJson));
  return dir;
}

function runHook(projectDir: string): string {
  const result = spawnSync('bash', [HOOK], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    encoding: 'utf8',
  });
  return result.stdout ?? '';
}

describe('gate-enforcement — hook-testable edge cases', () => {
  it('hook outputs [BLOCKED] for unsigned G2 gate at Ship phase', () => {
    const dir = setupStateFixture({
      current_phase: 'ship',
      gates: { 'sec-review': { status: 'pending' } },
    });
    const out = runHook(dir);
    expect(out).toContain('[BLOCKED] Ship blocked: sec-review gate not signed');
  });

  it('hook outputs [BLOCKED] for schema version mismatch', () => {
    const dir = setupStateFixture({
      current_phase: 'build',
      schema_version: '2',
    });
    const out = runHook(dir);
    expect(out).toContain('[BLOCKED] state schema version mismatch');
  });

  it('hook outputs [DRY-RUN] warning for gate sign in dry-run mode', () => {
    const dir = setupStateFixture({
      current_phase: 'ship',
      dry_run: true,
    });
    const out = runHook(dir);
    expect(out).toContain('[DRY-RUN] cannot sign security gate in dry-run mode');
  });
});
