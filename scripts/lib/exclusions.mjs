/**
 * exclusions.mjs
 * Shared packaging exclusion filter consumed by build-release.mjs and dogfood.mjs,
 * so the release zip and the dogfood mirror contain identical file sets per artifact.
 */
import { statSync } from 'node:fs';
import { basename } from 'node:path';

const EXCLUDED_DIRS = new Set(['rawfiles', 'raw', 'ideas', 'registry', 'node_modules']);
const EXCLUDED_FILES = new Set(['SKILL_caveman.md', 'README.md', '.DS_Store']);
const EXCLUDED_FILE_SUFFIXES = ['.original.md'];

/**
 * cpSync-compatible filter: returns true when `src` should be included in a
 * packaged/synced copy. cpSync stops descending into a directory once the
 * directory itself returns false, so files inside excluded dirs never reach here.
 * @param {string} src path being copied (must exist on disk)
 */
export function includeInPackage(src) {
  const name = basename(src);
  if (statSync(src).isDirectory()) return !EXCLUDED_DIRS.has(name);
  if (EXCLUDED_FILES.has(name)) return false;
  return !EXCLUDED_FILE_SUFFIXES.some((s) => name.endsWith(s));
}

export const excludedDirs = [...EXCLUDED_DIRS];
export const excludedFiles = [...EXCLUDED_FILES];
export const excludedFileSuffixes = [...EXCLUDED_FILE_SUFFIXES];
