/**
 * dedup-helpers.mjs
 * Shared manifest-category iteration helpers consumed by dogfood.mjs and
 * build-release.mjs, so adding a 4th manifest category means one new call
 * site per file instead of a new copy-pasted loop.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Appends one {src, dest, dir[, zipPath]} entry per manifest entry into targets.
 * srcField selects which manifest entry field resolves against srcRoot: 'src'
 * for the live repo (src/skills/x), 'dest' for an extracted zip (its layout
 * mirrors the manifest's dest paths, e.g. skills/x).
 */
export function pushCategoryTargets(targets, entries, { srcRoot, destRoot, dir, zipPath = false, srcField = 'src' }) {
  for (const e of entries) {
    const target = { src: join(srcRoot, e[srcField]), dest: join(destRoot, e.dest), dir };
    if (zipPath) target.zipPath = e.dest;
    targets.push(target);
  }
}

/**
 * Iterates entries, resolving src/dest under rootDir/buildDir, copying each
 * via the injected `cp(src, dest, {filtered})`. When `validate` is passed
 * (skills), missing source is checked up front (relative-path warning,
 * validate+copy skipped entirely) — matching skills' pre-refactor behavior.
 * When `validate` is omitted (hooks/agents), the missing-source check is left
 * to `cp` itself (absolute-path warning from inside `cp`), matching hooks/
 * agents' pre-refactor behavior exactly — this asymmetry is real pre-existing
 * behavior, not something this refactor introduces or should "fix".
 */
export function copyManifestCategory(entries, { rootDir, buildDir, cp, filtered = false, validate, label, printField = 'name' }) {
  for (const entry of entries) {
    const srcPath = join(rootDir, entry.src);
    const destPath = join(buildDir, entry.dest);
    if (validate) {
      if (!existsSync(srcPath)) { console.warn(`  SKIP (missing): ${entry.src}`); continue; }
      validate(srcPath, entry.name);
      cp(srcPath, destPath, { filtered });
      console.log(`  ${label}: ${entry[printField]}`);
    } else {
      cp(srcPath, destPath, { filtered });
      if (existsSync(srcPath)) console.log(`  ${label}: ${entry[printField]}`);
    }
  }
}
