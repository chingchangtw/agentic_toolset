#!/usr/bin/env node
/**
 * pilot.mjs
 * Ring 1 pilot install: builds the release zip, runs the REAL release/install.sh
 * against a disposable fixture project (ZIP_FILE override — no network), and
 * asserts the installed tree plus hook smoke tests. The fixture absorbs any
 * damage; the repo working tree is never touched.
 * Run: npm run pilot
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ZIP = join(ROOT, 'dist', 'release.zip');
const PAYLOADS = join(ROOT, 'test-fixtures', 'hook-payloads');

const failures = [];
const check = (cond, label) => {
  if (cond) console.log(`  ✓ ${label}`);
  else { console.error(`  ✗ ${label}`); failures.push(label); }
};

// ── ring 0 gate ───────────────────────────────────────────────────────────────

const ring0 = spawnSync('node', [join(__dirname, 'ring0-check.mjs')], { stdio: 'inherit' });
if (ring0.status !== 0) {
  console.error('PILOT FAIL: ring0 gate failed');
  process.exit(1);
}

// ── build ─────────────────────────────────────────────────────────────────────

console.log('→ pilot: building release.zip');
execSync(`node "${join(__dirname, 'build-release.mjs')}"`, { stdio: 'pipe' });

// ── install into fixture ──────────────────────────────────────────────────────

const fixture = mkdtempSync(join(tmpdir(), 'pilot-'));
const fixtureHome = join(fixture, 'home');
const fixtureProj = join(fixture, 'project');
mkdirSync(fixtureHome, { recursive: true });
mkdirSync(fixtureProj, { recursive: true });

try {
  console.log(`→ pilot: installing into fixture ${fixtureProj}`);
  const install = spawnSync('bash', [join(ROOT, 'release', 'install.sh')], {
    cwd: fixtureProj,
    env: { ...process.env, HOME: fixtureHome, ZIP_FILE: ZIP },
    encoding: 'utf8',
  });
  if (install.status !== 0) {
    console.error(install.stdout);
    console.error(install.stderr);
    console.error('PILOT FAIL: install.sh exited non-zero');
    process.exit(1);
  }

  // ── assert installed tree ───────────────────────────────────────────────────

  const manifest = JSON.parse(readFileSync(join(__dirname, 'release-manifest.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const projClaude = join(fixtureProj, '.claude');

  for (const e of manifest.skills) {
    const sub = e.dest.slice('skills/'.length);
    check(existsSync(join(projClaude, 'skills', sub, 'SKILL.md')), `skill installed: ${sub}`);
  }
  for (const e of manifest.hooks) {
    const dir = e.scope === 'project' ? join(projClaude, 'hooks') : join(fixtureHome, '.claude', 'hooks');
    check(existsSync(join(dir, e.name)), `hook installed (${e.scope}): ${e.name}`);
  }
  check(existsSync(join(projClaude, 'commands', 'load-skill.md')), 'commands installed: load-skill.md');

  const marker = join(projClaude, '.toolset-version');
  check(
    existsSync(marker) && readFileSync(marker, 'utf8').trim() === pkg.version,
    `version marker matches package.json (${pkg.version})`
  );
  check(existsSync(join(projClaude, 'settings.json')), 'project settings.json patched');

  // ── smoke installed project-scoped hooks ────────────────────────────────────

  for (const e of manifest.hooks.filter((h) => h.scope === 'project' && h.name.endsWith('.sh'))) {
    const res = spawnSync('bash', [join(projClaude, 'hooks', e.name)], {
      cwd: fixtureProj,
      input: readFileSync(join(PAYLOADS, 'user-prompt-submit.json')),
      env: { ...process.env, HOME: fixtureHome, CLAUDE_PROJECT_DIR: fixtureProj },
      timeout: 15000,
    });
    check(res.status === 0, `installed hook smoke: ${e.name}`);
  }
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\nPILOT FAIL — ${failures.length} assertion(s) failed`);
  process.exit(1);
}
console.log('\nPILOT PASS');
