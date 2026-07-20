#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { posix } from 'node:path';

const MANIFEST = 'scripts/release-manifest.json';

export function checkPhaseAScope(paths, allowedPaths = []) {
  const normalizedAllowed = allowedPaths.map((value) => {
    const normalized = posix.normalize(String(value).replaceAll('\\', '/'));
    if (
      normalized === '' ||
      normalized === '.' ||
      normalized === '..' ||
      normalized.startsWith('../')
    ) {
      throw new Error(`unsafe allowedPaths entry: ${value}`);
    }
    return normalized;
  });
  const isAllowed = (value) =>
    normalizedAllowed.some((allowed) => value === allowed || value.startsWith(`${allowed}/`));
  return paths
    .map((value) => posix.normalize(String(value).replaceAll('\\', '/')))
    .filter((value) => value !== MANIFEST && !value.startsWith('src/') && !isAllowed(value))
    .sort();
}

export function isMainModule(moduleUrl, argv1) {
  return moduleUrl === pathToFileURL(argv1 ?? '').href;
}

if (isMainModule(import.meta.url, process.argv[1])) {
  const violations = checkPhaseAScope(process.argv.slice(2));
  if (violations.length) {
    process.stderr.write(`${violations.join('\n')}\n`);
    process.exitCode = 1;
  }
}
