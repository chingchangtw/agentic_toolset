#!/usr/bin/env node
/**
 * dogfood.mjs
 * Manifest-driven mirror sync of src/ deliverables into this repo's own
 * .claude/ dogfood zone. Mirror semantics: delete-then-copy through the shared
 * exclusion filter, so the mirror always equals what the release would ship.
 *
 * Modes:
 *   node scripts/dogfood.mjs                 sync from src/ (runs ring0 first)
 *   node scripts/dogfood.mjs --rollback      restore mirror from .claude/.dogfood-prev/
 *   node scripts/dogfood.mjs --from-zip <p>  sync mirror from a built release zip (LKG restore)
 *
 * Never writes outside .claude/. Snapshot of the previous mirror is taken to
 * .claude/.dogfood-prev/ before every sync so rollback is one command.
 */
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, mkdtempSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { includeInPackage } from './lib/exclusions.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLAUDE_DIR = join(ROOT, '.claude');
const PREV_DIR = join(CLAUDE_DIR, '.dogfood-prev');
const MANIFEST_PATH = join(__dirname, 'release-manifest.json');

function fail(msg) {
  console.error(`✗ dogfood: ${msg}`);
  process.exit(1);
}

// Guard: every deleted/written path must live inside .claude/
function assertInsideClaude(p) {
  const abs = resolve(p);
  if (abs !== CLAUDE_DIR && !abs.startsWith(CLAUDE_DIR + sep)) {
    fail(`refusing to touch path outside .claude/: ${abs}`);
  }
  return abs;
}

if (!existsSync(MANIFEST_PATH)) fail('scripts/release-manifest.json not found — run generate-manifest first');
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

// mirror targets under .claude/, keyed by manifest + fixed extras
// skills: dest "skills/x" → .claude/skills/x ; hooks → .claude/hook/<name> ; commands file
function mirrorTargets() {
  const targets = [];
  for (const e of manifest.skills) {
    targets.push({ src: join(ROOT, e.src), dest: join(CLAUDE_DIR, e.dest), dir: true, zipPath: e.dest });
  }
  for (const e of manifest.hooks) {
    targets.push({ src: join(ROOT, e.src), dest: join(CLAUDE_DIR, e.dest), dir: false, zipPath: e.dest });
  }
  targets.push({
    src: join(ROOT, 'src', 'commands', 'load-skill.md'),
    dest: join(CLAUDE_DIR, 'commands', 'load-skill.md'),
    dir: false,
    zipPath: 'commands/load-skill.md',
  });
  return targets;
}

function syncFrom(targets) {
  // snapshot current mirror before touching anything
  if (existsSync(PREV_DIR)) rmSync(assertInsideClaude(PREV_DIR), { recursive: true });
  mkdirSync(PREV_DIR, { recursive: true });
  for (const t of targets) {
    if (!existsSync(t.dest)) continue;
    const rel = t.dest.slice(CLAUDE_DIR.length + 1);
    const snap = join(PREV_DIR, rel);
    mkdirSync(dirname(snap), { recursive: true });
    cpSync(t.dest, snap, { recursive: true });
  }

  for (const t of targets) {
    if (!existsSync(t.src)) {
      console.warn(`  ⚠ skip (source missing): ${t.src}`);
      continue;
    }
    const dest = assertInsideClaude(t.dest);
    if (existsSync(dest)) rmSync(dest, { recursive: true });
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(t.src, dest, t.dir ? { recursive: true, filter: includeInPackage } : {});
    console.log(`  ✓ synced: ${dest.slice(ROOT.length + 1)}`);
  }
}

const args = process.argv.slice(2);

if (args[0] === '--rollback') {
  if (!existsSync(PREV_DIR)) fail('no snapshot at .claude/.dogfood-prev/ — nothing to roll back to');
  for (const t of mirrorTargets()) {
    const rel = t.dest.slice(CLAUDE_DIR.length + 1);
    const snap = join(PREV_DIR, rel);
    const dest = assertInsideClaude(t.dest);
    if (existsSync(dest)) rmSync(dest, { recursive: true });
    if (existsSync(snap)) {
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(snap, dest, { recursive: true });
      console.log(`  ✓ restored: ${dest.slice(ROOT.length + 1)}`);
    }
  }
  console.log('✓ dogfood: mirror rolled back from snapshot');
  process.exit(0);
}

if (args[0] === '--from-zip') {
  const zipPath = args[1];
  if (!zipPath) fail('--from-zip requires a zip path');
  if (!existsSync(zipPath)) fail(`zip not found: ${zipPath} — run \`npm run dogfood:bless\` after a good build first`);
  const extract = mkdtempSync(join(tmpdir(), 'dogfood-zip-'));
  try {
    execSync(`cd "${extract}" && unzip -q "${resolve(zipPath)}"`, { shell: true });
    const zipManifest = JSON.parse(readFileSync(join(extract, 'manifest.json'), 'utf8'));
    const targets = [];
    for (const e of zipManifest.skills) {
      targets.push({ src: join(extract, e.dest), dest: join(CLAUDE_DIR, e.dest), dir: true });
    }
    for (const e of zipManifest.hooks) {
      targets.push({ src: join(extract, e.dest), dest: join(CLAUDE_DIR, e.dest), dir: false });
    }
    targets.push({
      src: join(extract, 'commands', 'load-skill.md'),
      dest: join(CLAUDE_DIR, 'commands', 'load-skill.md'),
      dir: false,
    });
    syncFrom(targets);
    console.log(`✓ dogfood: mirror synced from ${zipPath}`);
  } finally {
    rmSync(extract, { recursive: true, force: true });
  }
  process.exit(0);
}

// default: sync from src/, gated by ring0
const ring0 = spawnSync('node', [join(__dirname, 'ring0-check.mjs')], { stdio: 'inherit' });
if (ring0.status !== 0) fail('ring0 gate failed — mirror not touched');

syncFrom(mirrorTargets());
console.log('✓ dogfood: mirror synced from src/');
