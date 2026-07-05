import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

// Closes the long-standing open item (idea-002 follow-up #2, Ideas.md §14,
// Iter2-retro.md): D9 accepts inject-workflow-state.sh as a manual executable
// copy of ts-orchestrate/SKILL.md's "Workflow Guidance (Dual-Track)" table,
// but nothing asserted the copy stayed faithful. This test parses both the
// table and the hook's own "# SKILL.md: <Track>|<row>" source comments, then
// runs the hook against a fixture per row and checks the command(s) named in
// each guidance cell actually appear in that row's real stdout.

const SKILL_MD = fileURLToPath(new URL('../../skills/ts-orchestrate/SKILL.md', import.meta.url));
const HOOK = fileURLToPath(new URL('../../hook/inject-workflow-state.sh', import.meta.url));

const skillSource = readFileSync(SKILL_MD, 'utf8');
const hookSource = readFileSync(HOOK, 'utf8');

interface GuidanceRow {
  track: 'Discovery' | 'Delivery';
  state: string;
  guidance: string;
  commands: string[]; // backtick-quoted spans starting with "/"
}

function parseGuidanceTable(md: string): GuidanceRow[] {
  const rows: GuidanceRow[] = [];
  const tableSection = md.split('## Workflow Guidance')[1]?.split('## Feedback Loop')[0] ?? '';
  for (const line of tableSection.split('\n')) {
    const m = line.match(/^\|\s*(Discovery|Delivery)\s*\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|$/);
    if (!m) continue;
    const [, track, state, guidance] = m;
    const commands = [...guidance.matchAll(/`([^`]+)`/g)]
      .map((c) => c[1])
      .filter((c) => c.startsWith('/'));
    rows.push({ track: track as 'Discovery' | 'Delivery', state, guidance, commands });
  }
  return rows;
}

function parseHookRowComments(src: string): Set<string> {
  const found = new Set<string>();
  for (const m of src.matchAll(/#\s*SKILL\.md:\s*(Discovery|Delivery)\|([a-z-]+)/g)) {
    found.add(`${m[1]}|${m[2]}`);
  }
  return found;
}

const guidanceRows = parseGuidanceTable(skillSource);
const hookRowRefs = parseHookRowComments(hookSource);

// Rows the hook deliberately never emits a [NEXT] line for — documented in
// the comment block directly above next_for_discovery().
const EXCLUDED_ROWS = new Set(['Discovery|keep-learning', 'Discovery|killed', 'Discovery|reduce-scope']);

function runHook(projectDir: string): string {
  const result = spawnSync('bash', [HOOK], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    encoding: 'utf8',
  });
  return result.stdout ?? '';
}

const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
function track(dir: string): string {
  tmpDirs.push(dir);
  return dir;
}

function setupDelivery(phase: string, epicType = ''): string {
  const dir = mkdtempSync(join(tmpdir(), 'lockstep-'));
  mkdirSync(join(dir, '.agents', 'ts-deliver-router'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'ts-deliver-router', 'state.json'), JSON.stringify({ current_phase: phase }));
  const iteration: Record<string, unknown> = { active_epic: 'E1', dial: 'MID' };
  if (epicType) iteration.epics = [{ id: 'E1', type: epicType }];
  writeFileSync(join(dir, '.agents', 'iteration.json'), JSON.stringify(iteration));
  return dir;
}

function setupDiscovery(status: string, id: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'lockstep-'));
  mkdirSync(join(dir, '.agents'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'iteration.json'), JSON.stringify({ active_epic: null, dial: 'MID' }));
  writeFileSync(join(dir, '.agents', 'discovery.json'), JSON.stringify({ project: 'x', ideas: [{ id, status }] }));
  return dir;
}

describe('hook ↔ SKILL.md Workflow Guidance — structural lockstep', () => {
  it('parsed at least the 14 known table rows (parser sanity check)', () => {
    expect(guidanceRows.length).toBeGreaterThanOrEqual(14);
  });

  it('every non-excluded table row has a matching hook source comment', () => {
    const missing = guidanceRows
      .map((r) => `${r.track}|${r.state}`)
      .filter((key) => !EXCLUDED_ROWS.has(key) && !hookRowRefs.has(key));
    expect(missing).toEqual([]);
  });

  it('every hook source comment references a real table row (no stale references)', () => {
    const tableKeys = new Set(guidanceRows.map((r) => `${r.track}|${r.state}`));
    const stale = [...hookRowRefs].filter((key) => !tableKeys.has(key));
    expect(stale).toEqual([]);
  });

  it('excluded Discovery statuses are still named in the exclusion-justification comment', () => {
    expect(hookSource).toMatch(/keep-learning/);
    expect(hookSource).toMatch(/killed/);
    expect(hookSource).toMatch(/reduce-scope/);
  });
});

describe('hook ↔ SKILL.md Workflow Guidance — behavioral lockstep (Delivery)', () => {
  const deliveryRows = guidanceRows.filter((r) => r.track === 'Delivery');

  it.each(deliveryRows.map((r) => [r.state, r] as const))(
    'Delivery|%s: hook output contains every command SKILL.md documents for this state',
    (state, row) => {
      const dir = track(setupDelivery(state));
      const out = runHook(dir);
      for (const cmd of row.commands) {
        expect(out).toContain(cmd);
      }
    }
  );

  it('reflect + spike epic: hook output contains the spike-specific clause SKILL.md documents', () => {
    const reflectRow = deliveryRows.find((r) => r.state === 'reflect')!;
    expect(reflectRow.guidance.toLowerCase()).toContain('spike');
    const dir = track(setupDelivery('reflect', 'spike'));
    const out = runHook(dir);
    expect(out.toLowerCase()).toContain('write learning entry to discovery.json first');
  });

  it('reflect + non-spike epic: hook output does NOT contain the spike-specific clause', () => {
    const dir = track(setupDelivery('reflect', 'refactor'));
    const out = runHook(dir);
    expect(out.toLowerCase()).not.toContain('learning entry');
  });
});

describe('hook ↔ SKILL.md Workflow Guidance — behavioral lockstep (Discovery)', () => {
  const discoveryRows = guidanceRows.filter((r) => r.track === 'Discovery' && !EXCLUDED_ROWS.has(`Discovery|${r.state}`));

  it.each(discoveryRows.map((r) => [r.state, r] as const))(
    'Discovery|%s: hook output contains every command SKILL.md documents for this state (with <id> substituted)',
    (status, row) => {
      const id = 'idea-lockstep-001';
      const dir = track(setupDiscovery(status, id));
      const out = runHook(dir);
      for (const cmd of row.commands) {
        expect(out).toContain(cmd.replace(/<id>/g, id));
      }
    }
  );
});
