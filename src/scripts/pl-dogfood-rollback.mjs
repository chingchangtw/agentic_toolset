#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * @param {{version: string, snapshot_dir: string, targets: Array<{path: string, existed_before: boolean, snapshot_path: string | null, new_hash: string}>}} manifest
 * @param {(path: string) => string} [readFile]
 * @param {(path: string) => boolean} [fileExists]
 */
export function rollback(manifest, readFile = (p) => readFileSync(p, 'utf8'), fileExists = existsSync) {
  // Pre-restore integrity check: if anything touched a target after activation
  // (its current bytes no longer match what activation wrote), refuse to
  // silently clobber that change -- abort before restoring any target.
  for (const target of manifest.targets) {
    if (fileExists(target.path)) {
      const actual = readFile(target.path);
      if (sha256(actual) !== target.new_hash) {
        throw new Error(`rollback aborted, target diverged from activation state: ${target.path}`);
      }
    }
  }

  for (const target of manifest.targets) {
    if (target.existed_before) {
      const content = readFile(target.snapshot_path);
      mkdirSync(dirname(target.path), { recursive: true });
      const tmpPath = `${target.path}.tmp`;
      writeFileSync(tmpPath, content);
      renameSync(tmpPath, target.path);
    } else if (fileExists(target.path)) {
      rmSync(target.path);
    }
  }

  for (const target of manifest.targets) {
    if (target.existed_before) {
      const expected = readFile(target.snapshot_path);
      const actual = fileExists(target.path) ? readFile(target.path) : null;
      if (actual === null || sha256(actual) !== sha256(expected)) {
        throw new Error(`rollback mismatch: ${target.path}`);
      }
    } else if (fileExists(target.path)) {
      throw new Error(`rollback mismatch: ${target.path}`);
    }
  }

  return { restored: manifest.targets.length };
}

export function runCli(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--manifest') args.manifest = argv[i + 1];
  }
  if (!args.manifest) {
    process.stderr.write('usage: pl-dogfood-rollback.mjs --manifest <manifest-out-path>\n');
    return 2;
  }
  const manifest = JSON.parse(readFileSync(args.manifest, 'utf8'));
  try {
    const result = rollback(manifest);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return 1;
  }
}

export function isMainModule(moduleUrl, argv1) {
  return moduleUrl === pathToFileURL(argv1 ?? '').href;
}

if (isMainModule(import.meta.url, process.argv[1])) {
  process.exitCode = runCli(process.argv.slice(2));
}
