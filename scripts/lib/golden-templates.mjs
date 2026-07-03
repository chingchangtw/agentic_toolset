/**
 * golden-templates.mjs
 * Syncs and parity-checks the five agent-context files this repo authors in
 * src/project_root_structure/ against their packaged copy inside
 * src/skills/ondemand/ts-project-init-advisor/assets/golden/, so the advisor
 * skill carries its own canonical copy independent of the installer's scaffold path.
 */
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

export const GOLDEN_FILES = [
  'CLAUDE.md',
  'AGENTS.md',
  '.claude/CLAUDE.md',
  '.claude/goverance_CLAUDE.md',
  '.github/copilot-instructions.md',
];

const SOURCE_ROOT = join(ROOT, 'src', 'project_root_structure');
const GOLDEN_ROOT = join(ROOT, 'src', 'skills', 'ondemand', 'ts-project-init-advisor', 'assets', 'golden');

export function syncGoldenTemplates() {
  for (const relPath of GOLDEN_FILES) {
    const src = join(SOURCE_ROOT, relPath);
    const dest = join(GOLDEN_ROOT, relPath);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
  }
}

export function checkGoldenParity() {
  const findings = [];
  for (const relPath of GOLDEN_FILES) {
    const src = join(SOURCE_ROOT, relPath);
    const dest = join(GOLDEN_ROOT, relPath);
    if (!existsSync(dest)) {
      findings.push({ file: relPath, reason: 'missing' });
      continue;
    }
    if (!readFileSync(src).equals(readFileSync(dest))) {
      findings.push({ file: relPath, reason: 'content-mismatch' });
    }
  }
  return findings;
}
