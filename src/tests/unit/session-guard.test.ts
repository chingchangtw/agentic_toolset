import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

// A bare "python3" on PATH can be broken (wrong arch, stale conda env) and
// gets SIGKILL'd with no diagnostics — same failure install.sh guards
// against. Probe candidates and pick the first one that actually runs.
function findPython(): string | null {
  for (const candidate of ['python3', '/usr/bin/python3', '/usr/local/bin/python3', 'python']) {
    if (spawnSync(candidate, ['-c', ''], { timeout: 5000 }).status === 0) return candidate;
  }
  return null;
}

const PYTHON = findPython();
const HOOK = fileURLToPath(new URL('../../hook/ts-session-guard.py', import.meta.url));

function line(entry: unknown): string {
  return JSON.stringify(entry);
}

function buildTranscript(realTurns: number): string {
  const lines: string[] = [line({ type: 'user', isMeta: true, message: { content: 'meta' } })];
  for (let i = 0; i < realTurns; i++) {
    lines.push(line({ type: 'user', message: { content: `real prompt ${i}` } }));
    lines.push(line({ type: 'assistant', message: { content: `reply ${i}` } }));
    lines.push(line({ type: 'user', message: { content: [{ type: 'tool_result', content: 'tool out' }] } }));
  }
  return lines.join('\n') + '\n';
}

function runHook(transcriptPath: string): string {
  const result = spawnSync(PYTHON as string, [HOOK], {
    input: JSON.stringify({ transcript_path: transcriptPath }),
    encoding: 'utf8',
  });
  return result.stdout ?? '';
}

describe.skipIf(!PYTHON)('ts-session-guard.py — real-turn counting', () => {
  it('does not count tool_result echoes or isMeta entries as turns', () => {
    const dir = mkdtempSync(join(tmpdir(), 'session-guard-'));
    const transcriptPath = join(dir, 'transcript.jsonl');
    // 9 real turns + 1 meta + 9 tool_result echoes + 9 assistant = 28 lines,
    // but only 9 entries should count as real user turns — below MSG_WARN (10).
    writeFileSync(transcriptPath, buildTranscript(9));
    expect(runHook(transcriptPath)).toBe('');
    rmSync(dir, { recursive: true, force: true });
  });

  it('fires the TURNS warning once real turns reach the threshold', () => {
    const dir = mkdtempSync(join(tmpdir(), 'session-guard-'));
    const transcriptPath = join(dir, 'transcript.jsonl');
    writeFileSync(transcriptPath, buildTranscript(10));
    const out = runHook(transcriptPath);
    expect(out).toContain('TURNS: 10 messages in this session');
    rmSync(dir, { recursive: true, force: true });
  });

  it('never counts a transcript entry with type "message" (that value never occurs in real transcripts)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'session-guard-'));
    const transcriptPath = join(dir, 'transcript.jsonl');
    const lines = Array.from({ length: 12 }, () => line({ type: 'message' })).join('\n') + '\n';
    writeFileSync(transcriptPath, lines);
    expect(runHook(transcriptPath)).toBe('');
    rmSync(dir, { recursive: true, force: true });
  });
});
