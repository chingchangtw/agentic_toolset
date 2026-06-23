#!/usr/bin/env node
/**
 * build-release.mjs
 * Bundles src/skills/, src/hook/, src/project_root_structure/ into release.zip
 * for GitHub Releases distribution. Run: node scripts/build-release.mjs
 */
import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BUILD = join(ROOT, '.release-build');
const OUT   = join(ROOT, 'release.zip');

// ── helpers ──────────────────────────────────────────────────────────────────

function cp(src, dest) {
  if (!existsSync(src)) { console.warn(`SKIP (missing): ${src}`); return; }
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

// ── 1. skills ─────────────────────────────────────────────────────────────────

const skillsSrc = join(ROOT, 'src', 'skills');
const skillsDest = join(BUILD, 'skills');

function copySkillsDir(srcDir) {
  for (const entry of readdirSync(srcDir)) {
    const full = join(srcDir, entry);
    if (!statSync(full).isDirectory()) continue;
    // ondemand is a subdirectory of skills — recurse into it
    if (entry === 'ondemand') {
      copySkillsDir(full);
      continue;
    }
    validateSkill(full, entry);
    cp(full, join(skillsDest, entry));
    console.log(`  skill: ${entry}`);
  }
}

console.log('── skills ───────────────────────────────────────────────────────────────────');
copySkillsDir(skillsSrc);

// ── 2. hooks ──────────────────────────────────────────────────────────────────

console.log('── hooks ────────────────────────────────────────────────────────────────────');
const hookSrc  = join(ROOT, 'src', 'hook');
const hookDest = join(BUILD, 'hook');
mkdirSync(hookDest, { recursive: true });

for (const f of ['ts-session-guard.sh', 'ts-statusline_bridge.py']) {
  const src = join(hookSrc, f);
  if (!existsSync(src)) { console.warn(`  SKIP (missing): ${f}`); continue; }
  cp(src, join(hookDest, f));
  console.log(`  hook: ${f}`);
}

// ── 3. scaffold ───────────────────────────────────────────────────────────────

console.log('── scaffold ─────────────────────────────────────────────────────────────────');
const scaffoldSrc  = join(ROOT, 'src', 'project_root_structure');
const scaffoldDest = join(BUILD, 'scaffold');
cp(scaffoldSrc, scaffoldDest);
console.log('  scaffold: project_root_structure → scaffold/');

// ── 4. zip ────────────────────────────────────────────────────────────────────

console.log('── zip ──────────────────────────────────────────────────────────────────────');
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
