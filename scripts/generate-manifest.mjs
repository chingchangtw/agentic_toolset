#!/usr/bin/env node
/**
 * generate-manifest.mjs
 * Scans src/skills/ (including ondemand/) and src/hook/ to produce scripts/release-manifest.json.
 * Idempotent: preserves existing scope values on re-run; drops entries no longer in src/.
 */
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(__dirname, 'release-manifest.json');
const SKILLS_SRC = join(ROOT, 'src', 'skills');
const HOOK_SRC = join(ROOT, 'src', 'hook');

// Exit non-zero if source dirs missing
for (const dir of [SKILLS_SRC, HOOK_SRC]) {
  if (!existsSync(dir)) {
    console.error(`Error: missing source directory: ${relative(ROOT, dir)}`);
    process.exit(1);
  }
}

// Load existing manifest to preserve scope values
let existingHooks = {};
if (existsSync(MANIFEST_PATH)) {
  try {
    const existing = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    for (const h of existing.hooks ?? []) {
      existingHooks[h.name] = h.scope;
    }
  } catch {
    // corrupt manifest — start fresh
  }
}

// Scan skills
const skills = [];

function scanSkillsDir(srcDir, destPrefix) {
  for (const entry of readdirSync(srcDir).sort()) {
    const full = join(srcDir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry === 'ondemand') {
      scanSkillsDir(full, 'skills/ondemand');
      continue;
    }
    const dest = `${destPrefix}/${entry}`;
    const src = relative(ROOT, full);
    skills.push({ name: entry, src, dest });
  }
}

scanSkillsDir(SKILLS_SRC, 'skills');

// Scan hooks (files only, skip .md files like README.md)
const hooks = [];
for (const entry of readdirSync(HOOK_SRC).sort()) {
  const full = join(HOOK_SRC, entry);
  if (!statSync(full).isFile()) continue;
  if (entry.endsWith('.md')) continue;
  const src = relative(ROOT, full);
  const dest = `hook/${entry}`;
  // Default scope: inject-workflow-state.sh → project, all others → user
  const defaultScope = entry === 'inject-workflow-state.sh' ? 'project' : 'user';
  const scope = existingHooks[entry] ?? defaultScope;
  hooks.push({ name: entry, src, dest, scope });
}

const manifest = { version: '1', skills, hooks };
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`✓ release-manifest.json written (${skills.length} skills, ${hooks.length} hooks)`);
