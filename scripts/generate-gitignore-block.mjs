#!/usr/bin/env node
/**
 * generate-gitignore-block.mjs
 * Rewrites the marked dogfood-mirror region in .gitignore from
 * scripts/release-manifest.json, so dogfood mirror paths can never drift back
 * into git tracking. Content outside the markers is never modified. Idempotent.
 * Run: node scripts/generate-gitignore-block.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GITIGNORE = join(ROOT, '.gitignore');
const MANIFEST_PATH = join(__dirname, 'release-manifest.json');

const BEGIN = '# BEGIN dogfood-mirror (generated)';
const END = '# END dogfood-mirror';

if (!existsSync(MANIFEST_PATH)) {
  console.error('scripts/release-manifest.json not found — run generate-manifest first');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

const entries = [
  // deliverable skill mirrors: manifest dest "skills/x" → .claude/skills/x/
  ...manifest.skills.map((e) => `.claude/${e.dest}/`),
  '.claude/hook/',
  '.claude/commands/load-skill.md',
  '.claude/.dogfood-prev/',
  '.claude/.toolset-version',
  'dist/release-lkg.zip',
  // machine-local workflow state
  '.agents/discovery.json',
  '.agents/ts-deliver-router/state.json',
  '.agents/ts-deliver-router/history.jsonl',
];

const block = [BEGIN, ...entries, END].join('\n');

let content = existsSync(GITIGNORE) ? readFileSync(GITIGNORE, 'utf8') : '';

const beginIdx = content.indexOf(BEGIN);
const endIdx = content.indexOf(END);

if (beginIdx !== -1 && endIdx !== -1 && endIdx > beginIdx) {
  content = content.slice(0, beginIdx) + block + content.slice(endIdx + END.length);
} else if (beginIdx === -1 && endIdx === -1) {
  if (content.length > 0 && !content.endsWith('\n')) content += '\n';
  content += '\n' + block + '\n';
} else {
  console.error('.gitignore has a corrupt dogfood-mirror block (unpaired markers) — fix manually');
  process.exit(1);
}

writeFileSync(GITIGNORE, content);
console.log(`✓ .gitignore dogfood-mirror block updated (${entries.length} entries)`);
