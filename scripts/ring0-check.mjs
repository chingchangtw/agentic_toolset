#!/usr/bin/env node
/**
 * ring0-check.mjs
 * Ring 0 static verification gate — runs before any dogfood sync or pilot install.
 * Skill lint: every manifest skill has a parseable SKILL.md.
 * Hook smoke: every manifest hook runnable on this platform executes against its
 * fixture payload and must exit 0. A broken hook bricks every prompt turn, so
 * hooks are executed, not just existence-checked.
 * Run: node scripts/ring0-check.mjs  (or `npm run ring0`)
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(__dirname, 'release-manifest.json');
const PAYLOADS = join(ROOT, 'test-fixtures', 'hook-payloads');

function fail(msg) {
  console.error(`✗ ring0: ${msg}`);
  process.exit(1);
}

if (!existsSync(MANIFEST_PATH)) fail('scripts/release-manifest.json not found — run generate-manifest first');
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

// ── skill lint ────────────────────────────────────────────────────────────────

for (const entry of manifest.skills) {
  const skillMd = join(ROOT, entry.src, 'SKILL.md');
  if (!existsSync(skillMd)) fail(`skill ${entry.name}: SKILL.md missing`);
  const text = readFileSync(skillMd, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) fail(`skill ${entry.name}: SKILL.md has no frontmatter block`);
  if (!/^name:\s*\S+/m.test(fm[1])) fail(`skill ${entry.name}: frontmatter missing name:`);
  console.log(`  ✓ skill lint: ${entry.name}`);
}

// ── hook smoke ────────────────────────────────────────────────────────────────

// fixture payload per hook basename; statusline bridge reads statusLine JSON,
// everything else reads UserPromptSubmit JSON
const payloadFor = (name) =>
  name.includes('statusline') ? join(PAYLOADS, 'statusline.json') : join(PAYLOADS, 'user-prompt-submit.json');

// A bare "python3" on PATH can be broken (wrong arch, stale conda env) and gets
// SIGKILL'd with no diagnostics — same failure install.sh guards against.
// Probe candidates and pick the first one that actually runs.
let PYTHON_BIN = null;
for (const candidate of ['python3', '/usr/bin/python3', '/usr/local/bin/python3', 'python']) {
  if (spawnSync(candidate, ['-c', ''], { timeout: 5000 }).status === 0) {
    PYTHON_BIN = candidate;
    break;
  }
}

const runnerFor = (name) => {
  const ext = extname(name);
  if (ext === '.sh') return ['bash'];
  if (ext === '.py') return PYTHON_BIN ? [PYTHON_BIN] : null;
  if (ext === '.ps1') return ['pwsh', '-NoProfile', '-File'];
  return null;
};

const available = (cmd) => spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd]).status === 0;

for (const entry of manifest.hooks) {
  const hookPath = join(ROOT, entry.src);
  if (!existsSync(hookPath)) fail(`hook ${entry.name}: source file missing (${entry.src})`);

  const runner = runnerFor(entry.name);
  if (!runner || !available(runner[0])) {
    console.warn(`  ⚠ skipped (not runnable on this platform): ${entry.name}`);
    continue;
  }

  const payload = payloadFor(entry.name);
  if (!existsSync(payload)) fail(`hook ${entry.name}: fixture payload missing (${payload})`);

  const res = spawnSync(runner[0], [...runner.slice(1), hookPath], {
    input: readFileSync(payload),
    timeout: 15000,
  });
  if (res.status !== 0) {
    const err = (res.stderr || '').toString().trim().split('\n')[0] || `exit ${res.status}`;
    fail(`hook ${entry.name}: smoke test failed — ${err}`);
  }
  console.log(`  ✓ hook smoke: ${entry.name}`);
}

console.log('✓ ring0: all checks passed');
