#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { checkPhaseAScope } from './pl-scope-guard.mjs';

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * @param {{targets: Array<{path: string, content: string}>, allowedPaths?: string[]}} targetList
 * @param {string} snapshotDir
 * @param {(path: string) => string} [readFile]
 * @param {(path: string) => boolean} [fileExists]
 */
export function activate(targetList, snapshotDir, readFile = (p) => readFileSync(p, 'utf8'), fileExists = existsSync) {
  const { targets, allowedPaths = [] } = targetList;

  const violations = checkPhaseAScope(targets.map((t) => t.path), allowedPaths);
  if (violations.length) {
    throw new Error(`target path(s) outside declared allowlist: ${violations.join(', ')}`);
  }

  // Snapshot phase: fully completes before any apply-phase write begins.
  const snapshotEntries = targets.map((target) => {
    const existedBefore = fileExists(target.path);
    if (!existedBefore) {
      return { path: target.path, existed_before: false, snapshot_path: null };
    }
    const snapshotPath = join(snapshotDir, target.path);
    const content = readFile(target.path);
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, content);
    return { path: target.path, existed_before: true, snapshot_path: snapshotPath };
  });

  // Apply phase: write tmp -> rename, per target, only after every snapshot succeeded.
  // Builds the manifest incrementally (not via .map's single return) so that if a
  // later target's write/rename throws, every already-applied target still has a
  // manifest entry attached to the thrown error -- otherwise a partial failure
  // would leave live-modified files with no manifest to feed pl-dogfood-rollback.mjs.
  const manifestTargets = [];
  try {
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      const snapshotEntry = snapshotEntries[index];
      mkdirSync(dirname(target.path), { recursive: true });
      const tmpPath = `${target.path}.tmp`;
      writeFileSync(tmpPath, target.content);
      renameSync(tmpPath, target.path);
      manifestTargets.push({
        path: target.path,
        existed_before: snapshotEntry.existed_before,
        snapshot_path: snapshotEntry.snapshot_path,
        new_hash: sha256(target.content),
      });
    }
  } catch (error) {
    error.partialManifest = { version: '1', snapshot_dir: snapshotDir, targets: manifestTargets };
    throw error;
  }

  return {
    version: '1',
    snapshot_dir: snapshotDir,
    targets: manifestTargets,
  };
}

export function runCli(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--manifest') args.manifest = argv[i + 1];
    if (argv[i] === '--snapshot-dir') args.snapshotDir = argv[i + 1];
    if (argv[i] === '--manifest-out') args.manifestOut = argv[i + 1];
  }
  if (!args.manifest || !args.snapshotDir) {
    process.stderr.write('usage: pl-dogfood-activate.mjs --manifest <target-list.json> --snapshot-dir <dir> [--manifest-out <path>]\n');
    return 2;
  }
  const targetList = JSON.parse(readFileSync(args.manifest, 'utf8'));
  try {
    const manifest = activate(targetList, args.snapshotDir);
    const json = JSON.stringify(manifest, null, 2);
    process.stdout.write(`${json}\n`);
    if (args.manifestOut) {
      writeFileSync(args.manifestOut, json);
    }
    return 0;
  } catch (error) {
    if (error.partialManifest && args.manifestOut) {
      writeFileSync(args.manifestOut, JSON.stringify(error.partialManifest, null, 2));
      process.stderr.write(
        `activation failed partway through: ${error.message}\npartial manifest written to ${args.manifestOut} -- run pl-dogfood-rollback.mjs against it to restore already-applied targets\n`,
      );
    } else {
      process.stderr.write(`${error.message}\n`);
    }
    return 1;
  }
}

export function isMainModule(moduleUrl, argv1) {
  return moduleUrl === pathToFileURL(argv1 ?? '').href;
}

if (isMainModule(import.meta.url, process.argv[1])) {
  process.exitCode = runCli(process.argv.slice(2));
}
