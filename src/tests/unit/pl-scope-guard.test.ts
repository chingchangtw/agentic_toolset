import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkPhaseAScope } from '../../scripts/pl-scope-guard.mjs';

describe('Phase A scope guard', () => {
  it('permits src paths and the exact release-manifest exception', () => {
    expect(checkPhaseAScope([
      'src/scripts/pl-arch-check.mjs',
      'scripts/release-manifest.json',
    ])).toEqual([]);
  });

  it('rejects every other implementation path', () => {
    expect(checkPhaseAScope([
      'package.json',
      '.agents/registry.json',
      'src-other/not-allowed.ts',
      'scripts/dogfood.mjs',
    ])).toEqual([
      '.agents/registry.json',
      'package.json',
      'scripts/dogfood.mjs',
      'src-other/not-allowed.ts',
    ]);
  });

  it('rejects traversal disguised beneath src', () => {
    expect(checkPhaseAScope([
      'src/../../package.json',
      './src/../scripts/dogfood.mjs',
    ])).toEqual([
      '../package.json',
      'scripts/dogfood.mjs',
    ]);
  });
});

describe('Phase A golden fixtures', () => {
  it('discovers every required case with valid normalized diagnostics', () => {
    const root = fileURLToPath(new URL('../fixtures/pl-sample-app/', import.meta.url));
    const cases = readdirSync(root).sort();
    expect(cases).toEqual([
      'architecture-failing',
      'compliant',
      'contract-failing',
      'ownership-failing',
      'unsupported-syntax',
    ]);

    for (const name of cases) {
      const diagnostics = JSON.parse(readFileSync(join(root, name, 'expected.json'), 'utf8'));
      expect(Array.isArray(diagnostics)).toBe(true);
      for (const diagnostic of diagnostics) {
        expect(Object.keys(diagnostic)).toEqual([
          'version', 'rule_id', 'severity', 'file', 'dependency', 'message',
        ]);
        expect(diagnostic.file).not.toMatch(/^[A-Za-z]:|^\//);
      }
    }
  });
});
