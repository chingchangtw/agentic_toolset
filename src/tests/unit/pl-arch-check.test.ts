import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkArchitecture, scanImports } from '../../scripts/pl-arch-check.mjs';

const temporary: string[] = [];

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function project(manifest: unknown, files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'pl-arch-'));
  temporary.push(root);
  writeFileSync(join(root, 'layers.map.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

const manifest = {
  version: '1',
  layers: [{ name: 'application', globs: ['src/**'], may_import: ['application'] }],
  aliases: {},
  external: { allow: true },
};

describe('layer manifest validation', () => {
  it.each([
    [{ ...manifest, version: '2' }, 'PL-ARCH-MANIFEST-VERSION'],
    [{ ...manifest, layers: [{ name: 'application', globs: ['src/**/[x]'], may_import: [] }] }, 'PL-ARCH-UNSUPPORTED-GLOB'],
  ])('rejects invalid manifest input', (input, rule) => {
    const root = project(input, { 'src/main.ts': 'export const main = true;' });
    const result = checkArchitecture({ root });
    expect(result.exitCode).toBe(2);
    expect(result.diagnostics[0].rule_id).toBe(rule);
  });

  it('rejects unmatched and overlapping file ownership', () => {
    const unmatched = project({ ...manifest, layers: [{ name: 'x', globs: ['lib/**'], may_import: [] }] },
      { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root: unmatched })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNMATCHED-LAYER' }],
    });

    const overlapping = project({
      ...manifest,
      layers: [
        { name: 'one', globs: ['src/**'], may_import: [] },
        { name: 'two', globs: ['src/main.*'], may_import: [] },
      ],
    }, { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root: overlapping })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-AMBIGUOUS-LAYER' }],
    });
  });
});

describe('fail-closed import scanner', () => {
  it('extracts all five supported forms across comments, strings, and multiline syntax', () => {
    expect(scanImports(`
      // import './ignored-comment'
      const text = "require('./ignored-string')";
      import { x }\n from './static';
      import './setup';
      export { y } from './re-export';
      const dynamic = import('./dynamic');
      const common = require('./common');
    `)).toEqual(['./static', './setup', './re-export', './dynamic', './common']);
  });

  it.each(['import(moduleName)', 'require(prefix + name)'])('rejects non-literal %s', (source) => {
    expect(() => scanImports(source)).toThrow('string literal');
  });

  it.each([
    "module.require('../infra/SqlOrder')",
    "const load = require; load('../infra/SqlOrder')",
  ])('rejects indirect CommonJS loading: %s', (source) => {
    expect(() => scanImports(source)).toThrow('Direct require');
  });

  it('rejects escaped module specifiers instead of misclassifying them', () => {
    expect(() => scanImports("require('\\\\x2e\\\\x2e/infra/SqlOrder')"))
      .toThrow('escaped module specifier');
  });

  it('scans every supported source extension', () => {
    const files = Object.fromEntries(
      ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs'].map((extension) =>
        [`src/file.${extension}`, 'export const value = true;']),
    );
    expect(checkArchitecture({ root: project(manifest, files) })).toMatchObject({ exitCode: 0 });
  });
});

describe('bounded resolution and deterministic diagnostics', () => {
  it('fails closed when configured layer roots contain no source files', () => {
    const root = project(manifest, {});
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-NO-SOURCES' }],
    });
  });

  it('enforces layers rooted outside src when imported', () => {
    const root = project({
      ...manifest,
      layers: [
        { name: 'domain', globs: ['src/domain/**'], may_import: ['domain'] },
        { name: 'infrastructure', globs: ['lib/**'], may_import: ['infrastructure'] },
      ],
    }, {
      'src/domain/Order.ts': "import { sql } from '../../lib/SqlOrder';",
      'lib/SqlOrder.ts': 'export const sql = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 1,
      diagnostics: [{ rule_id: 'PL-ARCH-FORBIDDEN-IMPORT' }],
    });
  });

  it('resolves configured aliases inside root', () => {
    const root = project({ ...manifest, aliases: { '@domain/': 'src/domain' } }, {
      'src/main.ts': "import { value } from '@domain/value';",
      'src/domain/value.ts': 'export const value = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('rejects traversal and symlink escape', () => {
    const parent = mkdtempSync(join(tmpdir(), 'pl-arch-boundary-'));
    temporary.push(parent);
    const root = join(parent, 'project');
    mkdirSync(join(root, 'src', 'app'), { recursive: true });
    writeFileSync(join(root, 'layers.map.json'), JSON.stringify(manifest));
    writeFileSync(join(parent, 'outside.ts'), 'export const secret = true;');
    writeFileSync(join(root, 'src', 'app', 'main.ts'), "import '../../../outside';");
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-PATH-ESCAPE' }],
    });

    writeFileSync(join(root, 'src', 'app', 'main.ts'), "import './link/secret';");
    const outside = join(parent, 'external');
    mkdirSync(outside);
    writeFileSync(join(outside, 'secret.ts'), 'export const secret = true;');
    symlinkSync(outside, join(root, 'src', 'app', 'link'), 'junction');
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-PATH-ESCAPE' }],
    });
  });

  it('matches the golden forbidden-import output byte-for-byte across runs', () => {
    const root = new URL('../fixtures/pl-sample-app/architecture-failing/', import.meta.url);
    const rootPath = fileURLToPath(root);
    const first = checkArchitecture({ root: rootPath });
    const second = checkArchitecture({ root: rootPath });
    const expected = JSON.parse(readFileSync(new URL('expected.json', root), 'utf8'));
    expect(first).toMatchObject({ exitCode: 1, diagnostics: expected });
    expect(JSON.stringify(first.diagnostics)).toBe(JSON.stringify(second.diagnostics));
    expect(JSON.stringify(first.diagnostics)).not.toMatch(/[A-Za-z]:\\/);
  });

  it('returns exit 2 for unsupported syntax', () => {
    const root = new URL('../fixtures/pl-sample-app/unsupported-syntax/', import.meta.url);
    expect(checkArchitecture({ root: fileURLToPath(root) })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNSUPPORTED-SYNTAX' }],
    });
  });
});
