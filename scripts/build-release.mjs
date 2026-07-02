#!/usr/bin/env node
/**
 * build-release.mjs
 * Reads scripts/release-manifest.json and bundles declared skills, hooks, commands,
 * and scaffold into dist/release.zip for GitHub Releases distribution.
 * Run: node scripts/build-release.mjs  (or via `npm run release`)
 */
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BUILD = join(ROOT, '.release-build');
const OUT   = join(ROOT, 'dist', 'release.zip');
const MANIFEST_PATH = join(__dirname, 'release-manifest.json');

// ── read manifest ─────────────────────────────────────────────────────────────

if (!existsSync(MANIFEST_PATH)) {
  console.error('scripts/release-manifest.json not found — run generate-manifest first');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

// ── helpers ───────────────────────────────────────────────────────────────────

function cp(src, dest) {
  if (!existsSync(src)) { console.warn(`  SKIP (missing): ${src}`); return; }
  mkdirSync(dirname(dest), { recursive: true });
  const stat = statSync(src);
  if (stat.isDirectory()) {
    cpSync(src, dest, { recursive: true });
  } else {
    cpSync(src, dest);
  }
}

function validateSkill(skillDir, name) {
  const skillMd = join(skillDir, 'SKILL.md');
  if (!existsSync(skillMd)) {
    throw new Error(`SKILL.md missing in ${name} — every skill must have SKILL.md`);
  }
}

// ── clean build dir ───────────────────────────────────────────────────────────

if (existsSync(BUILD)) rmSync(BUILD, { recursive: true });
mkdirSync(BUILD, { recursive: true });

// ── 1. skills (manifest-driven) ───────────────────────────────────────────────

console.log('── skills ───────────────────────────────────────────────────────────────────');
for (const entry of manifest.skills) {
  const srcPath = join(ROOT, entry.src);
  const destPath = join(BUILD, entry.dest);
  if (!existsSync(srcPath)) { console.warn(`  SKIP (missing): ${entry.src}`); continue; }
  validateSkill(srcPath, entry.name);
  cp(srcPath, destPath);
  console.log(`  skill: ${entry.dest}`);
}

// ── 2. hooks (manifest-driven) ────────────────────────────────────────────────

console.log('── hooks ────────────────────────────────────────────────────────────────────');
for (const entry of manifest.hooks) {
  const srcPath = join(ROOT, entry.src);
  const destPath = join(BUILD, entry.dest);
  cp(srcPath, destPath);
  if (existsSync(srcPath)) console.log(`  hook: ${entry.name}`);
}

// ── 3. manifest.json at zip root ──────────────────────────────────────────────

cpSync(MANIFEST_PATH, join(BUILD, 'manifest.json'));

// ── 4. commands ───────────────────────────────────────────────────────────────

console.log('── commands ─────────────────────────────────────────────────────────────────');
const commandsSrc  = join(ROOT, 'src', 'commands');
const commandsDest = join(BUILD, 'commands');
if (existsSync(commandsSrc)) {
  cp(commandsSrc, commandsDest);
  console.log('  commands: src/commands → commands/');
} else {
  console.warn('  SKIP (missing): src/commands');
}

// ── 5. scaffold ───────────────────────────────────────────────────────────────

console.log('── scaffold ─────────────────────────────────────────────────────────────────');
const scaffoldSrc  = join(ROOT, 'src', 'project_root_structure');
const scaffoldDest = join(BUILD, 'scaffold');
cp(scaffoldSrc, scaffoldDest);
console.log('  scaffold: project_root_structure → scaffold/');

// ── 6. zip ────────────────────────────────────────────────────────────────────

console.log('── zip ──────────────────────────────────────────────────────────────────────');
mkdirSync(join(ROOT, 'dist'), { recursive: true });
if (existsSync(OUT)) rmSync(OUT);

const isWin = process.platform === 'win32';
if (isWin) {
  execSync(
    `pwsh -NoProfile -Command "Compress-Archive -Path '${BUILD}\\*' -DestinationPath '${OUT}'"`,
    { stdio: 'inherit' }
  );
} else {
  execSync(`cd "${BUILD}" && zip -r "${OUT}" .`, { stdio: 'inherit', shell: true });
}

console.log(`\n✓ release.zip ready: ${OUT}`);
console.log('  Upload to GitHub Releases, then copy install.sh + install.ps1 as release assets too.');
