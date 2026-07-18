#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import { posix } from 'node:path';

const MANIFEST = 'scripts/release-manifest.json';

export function checkPhaseAScope(paths) {
  return paths
    .map((value) => posix.normalize(String(value).replaceAll('\\', '/')))
    .filter((value) => value !== MANIFEST && !value.startsWith('src/'))
    .sort();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const violations = checkPhaseAScope(process.argv.slice(2));
  if (violations.length) {
    process.stderr.write(`${violations.join('\n')}\n`);
    process.exitCode = 1;
  }
}
