import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkArchitecture, scanImports } from '../../scripts/pl-arch-check.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/pl-arch-check.mjs', import.meta.url));

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

  it.each([
    [{ ...manifest, layers: [] }, 'must be non-empty'],
    [{ ...manifest, layers: 'not-an-array' }, 'must be non-empty'],
    [{ ...manifest, layers: [{ name: 'a', globs: ['src/**'], may_import: [] }, { name: 'a', globs: ['lib/**'], may_import: [] }] }, 'unique'],
    [{ ...manifest, layers: [{ name: undefined, globs: ['src/**'], may_import: [] }] }, 'unique'],
    [{ ...manifest, layers: [{ name: '', globs: ['src/**'], may_import: [] }] }, 'unique'],
    [{ ...manifest, layers: [{ name: 'a', globs: 'not-array', may_import: [] }] }, 'Invalid layer'],
    [{ ...manifest, layers: [{ name: 'a', globs: ['src/**'], may_import: 'not-array' }] }, 'Invalid layer'],
    [{ ...manifest, layers: [{ name: 'a', globs: ['src/**'], may_import: ['unknown-layer'] }] }, 'Unknown may_import'],
    [{ ...manifest, aliases: [] }, 'aliases must map'],
    [{ ...manifest, aliases: 'not-an-object' }, 'aliases must map'],
    [{ ...manifest, aliases: { '': 'src' } }, 'aliases must map'],
    [{ ...manifest, aliases: { '@x/': 123 } }, 'aliases must map'],
    [{ ...manifest, external: {} }, 'external.allow must be boolean'],
    [{ ...manifest, external: { allow: 'yes' } }, 'external.allow must be boolean'],
  ])('rejects manifest shape violations: %j', (input, messageFragment) => {
    const root = project(input, { 'src/main.ts': 'export const main = true;' });
    const result = checkArchitecture({ root });
    expect(result.exitCode).toBe(2);
    expect(result.diagnostics[0].message).toContain(messageFragment);
  });

  it('does not crash when the manifest JSON is literally null', () => {
    const root = mkdtempSync(join(tmpdir(), 'pl-arch-null-manifest-'));
    temporary.push(root);
    writeFileSync(join(root, 'layers.map.json'), 'null');
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-MANIFEST-VERSION', message: 'Unsupported manifest version' }],
    });
  });

  it('does not crash when a layer entry in the array is null', () => {
    const root = project({ ...manifest, layers: [null] }, { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ message: 'Layer names must be unique non-empty strings' }],
    });
  });

  it('does not crash when the manifest external key is explicitly null', () => {
    const root = project({ ...manifest, external: null }, { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-INVALID-MANIFEST', message: 'Manifest external.allow must be boolean' }],
    });
  });

  it('accepts a manifest with no aliases key at all (defaults to empty object)', () => {
    const { aliases, ...withoutAliases } = manifest;
    const root = project(withoutAliases, { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('accepts may_import referencing a layer declared later in the array', () => {
    const root = project({
      ...manifest,
      layers: [
        { name: 'app', globs: ['src/app/**'], may_import: ['domain'] },
        { name: 'domain', globs: ['src/domain/**'], may_import: [] },
      ],
    }, {
      'src/app/main.ts': "import { x } from '../domain/x';",
      'src/domain/x.ts': 'export const x = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('rejects unmatched and overlapping file ownership', () => {
    const unmatched = project({ ...manifest, layers: [{ name: 'x', globs: ['lib/**'], may_import: [] }] },
      { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root: unmatched })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNMATCHED-LAYER', dependency: '', message: 'No layer owns src/main.ts' }],
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
      diagnostics: [{ rule_id: 'PL-ARCH-AMBIGUOUS-LAYER', dependency: '', message: 'Multiple layers own src/main.ts' }],
    });
  });

  it('matches a file when ANY of a layer\'s multiple globs match, not only when ALL do', () => {
    const root = project({
      ...manifest,
      layers: [{ name: 'app', globs: ['src/never-matches/**', 'src/**'], may_import: ['app'] }],
    }, { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });
});

describe('glob compilation', () => {
  it.each([
    ['src/[abc].ts', 'char class'],
    ['src/{a,b}.ts', 'brace group'],
    ['src/file!.ts', 'bang'],
    ['', 'empty'],
  ])('rejects unsupported glob syntax: %s (%s)', (glob) => {
    const root = project({ ...manifest, layers: [{ name: 'app', globs: [glob], may_import: [] }] },
      { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNSUPPORTED-GLOB' }],
    });
  });

  it('rejects a ** segment combined with other characters in the same path segment', () => {
    const root = project({ ...manifest, layers: [{ name: 'app', globs: ['src/**foo/*.ts'], may_import: [] }] },
      { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNSUPPORTED-GLOB' }],
    });
  });

  it('treats a trailing ** as matching zero or more path segments including the empty tail', () => {
    const root = project({ ...manifest, layers: [{ name: 'app', globs: ['src/**'], may_import: [] }] },
      { 'src/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  // NOTE: compileGlob joins segments with '/', and a non-trailing '**' segment
  // already expands to a pattern ending in '/' (`(?:[^/]+/)*`) — the join then
  // inserts a second, redundant '/' before the next literal segment. That
  // makes a mid-path '**' (e.g. 'src/**/leaf.ts') structurally unable to
  // match any real path, at any directory depth. Documenting actual behavior
  // here rather than the presumably-intended "zero or more directories"
  // semantics, since fixing it is outside the scope of this mutation-testing pass.
  it('a mid-path ** never matches, at any directory depth (compileGlob join inserts a redundant slash)', () => {
    const zeroDepth = project({ ...manifest, layers: [{ name: 'app', globs: ['src/**/leaf.ts'], may_import: [] }] }, {
      'src/leaf.ts': 'export const leaf = true;',
    });
    expect(checkArchitecture({ root: zeroDepth })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNMATCHED-LAYER' }],
    });

    const oneDepth = project({ ...manifest, layers: [{ name: 'app', globs: ['src/**/leaf.ts'], may_import: [] }] }, {
      'src/deep/leaf.ts': 'export const leaf = true;',
    });
    expect(checkArchitecture({ root: oneDepth })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNMATCHED-LAYER' }],
    });
  });

  it('escapes regex-special characters in a literal glob segment', () => {
    const root = project({ ...manifest, layers: [{ name: 'app', globs: ['src/file.name.ts'], may_import: [] }] }, {
      'src/file.name.ts': 'export const value = true;',
      // A file that would match if '.' were treated as a regex wildcard but must not here.
      'src/fileXname.ts': 'export const other = true;',
    });
    const result = checkArchitecture({ root });
    expect(result).toMatchObject({ exitCode: 2 });
    expect(result.diagnostics.some((d: { rule_id: string; file: string }) =>
      d.rule_id === 'PL-ARCH-UNMATCHED-LAYER' && d.file === 'src/fileXname.ts')).toBe(true);
  });

  it('expands a single * to match within one path segment only, not across slashes', () => {
    const root = project({ ...manifest, layers: [{ name: 'app', globs: ['src/*.ts'], may_import: [] }] }, {
      'src/main.ts': 'export const main = true;',
      'src/nested/deep.ts': 'export const deep = true;',
    });
    const result = checkArchitecture({ root });
    expect(result.diagnostics.some((d: { rule_id: string; file: string }) =>
      d.rule_id === 'PL-ARCH-UNMATCHED-LAYER' && d.file === 'src/nested/deep.ts')).toBe(true);
  });
});

describe('source root discovery and file walking', () => {
  it('recurses into nested subdirectories, not just the top level', () => {
    const root = project(manifest, {
      'src/a/b/c/deep.ts': 'export const deep = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('discovers additional source roots from wildcard layer globs outside src/', () => {
    const root = project({
      ...manifest,
      layers: [{ name: 'app', globs: ['lib/**'], may_import: ['app'] }],
    }, { 'lib/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('does not discover a source root for a layer glob whose prefix escapes the project root', () => {
    const root = project({
      ...manifest,
      layers: [{ name: 'app', globs: ['../outside/**'], may_import: ['app'] }],
    }, { 'src/main.ts': 'export const main = true;' });
    // The escaping prefix contributes no root; the conventional src/ root still
    // applies, so main.ts is discovered but owned by no layer (no matching glob).
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNMATCHED-LAYER' }],
    });
  });

  it('does not add a source root for a non-existent wildcard prefix directory', () => {
    const root = project({
      ...manifest,
      layers: [{ name: 'app', globs: ['nowhere/**'], may_import: ['app'] }],
    }, {});
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-NO-SOURCES' }],
    });
  });

  it('extracts the wildcard prefix directory for a glob with no trailing /**, not just the pattern with it', () => {
    const root = project({
      ...manifest,
      layers: [{ name: 'app', globs: ['lib/*.ts'], may_import: ['app'] }],
    }, { 'lib/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('treats a wildcard-prefixed glob with no directory component as rooted at the project root', () => {
    const root = project({
      ...manifest,
      layers: [{ name: 'app', globs: ['*.ts'], may_import: ['app'] }],
    }, { 'main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('extracts the full directory for a glob with no wildcard character at all', () => {
    const root = project({
      ...manifest,
      layers: [{ name: 'app', globs: ['lib/main.ts'], may_import: ['app'] }],
    }, { 'lib/main.ts': 'export const main = true;' });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
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

  it('skips block comments including ones that would otherwise contain an import', () => {
    expect(scanImports(`
      /* import './ignored-block-comment'; require('./also-ignored') */
      import { x } from './real';
    `)).toEqual(['./real']);
  });

  it('throws on an unterminated block comment', () => {
    expect(() => scanImports('/* never closed')).toThrow('Unterminated block comment');
  });

  it('throws on an unterminated string literal', () => {
    expect(() => scanImports("const x = 'never closed")).toThrow('Unterminated string');
  });

  it('throws on an unterminated template literal', () => {
    expect(() => scanImports('const x = `never closed')).toThrow('Unterminated template');
  });

  it('does not treat a single "/" (division) as starting a comment', () => {
    expect(scanImports("const x = a/b; import './y';")).toEqual(['./y']);
  });

  it('handles a comment that runs to the exact end of the source with no trailing newline', () => {
    expect(scanImports("import './y'; // trailing comment")).toEqual(['./y']);
  });

  it('throws on a string with a trailing unescaped backslash right at end of source', () => {
    expect(() => scanImports(`'${'\\'}`)).toThrow('Unterminated string');
  });

  it('throws on a template literal with a trailing unescaped backslash right at end of source', () => {
    expect(() => scanImports(`\`${'\\'}`)).toThrow('Unterminated template');
  });

  it('skips an escaped backslash inside a template literal without ending it early', () => {
    expect(scanImports("const t = `a\\\\`; import './y';")).toEqual(['./y']);
  });

  it('treats a backslash-escaped backtick inside a template literal as part of the template', () => {
    expect(scanImports("const t = `a\\`b`; import './y';")).toEqual(['./y']);
  });

  it('handles a template literal spanning the specifier position without treating it as a string', () => {
    expect(() => scanImports("import(`dynamic-${name}`)")).toThrow('string literal');
  });

  it('ignores a require property reference that is never called', () => {
    expect(scanImports('const fn = obj.require; import \'./after\';')).toEqual(['./after']);
  });

  it('does not throw when a dot-preceded require is the very last token (out-of-bounds lookahead)', () => {
    expect(scanImports('obj.require')).toEqual([]);
  });

  it('does not treat an arbitrary dot-preceded call as a require violation', () => {
    expect(scanImports("obj.foo('./ignored'); import './after';")).toEqual(['./after']);
  });

  it('supports a require call using double-quoted or single-quoted specifiers alike', () => {
    expect(scanImports('const a = require("./double"); const b = require(\'./single\');'))
      .toEqual(['./double', './single']);
  });

  it('handles escaped characters inside an ordinary (non-import) string without breaking tokenization', () => {
    expect(scanImports("const s = 'line1\\nline2'; import './after';")).toEqual(['./after']);
  });

  it('rejects a bare export statement that never reaches a from clause', () => {
    expect(() => scanImports('export { x }')).not.toThrow();
    expect(scanImports('export { x }')).toEqual([]);
  });

  it('stops scanning an export-from search when an "import" keyword interrupts it first', () => {
    expect(scanImports("export { x } import './real';")).toEqual(['./real']);
  });

  it('stops scanning an export-from search when another "export" keyword interrupts it first', () => {
    expect(scanImports("export { x } export './real2';")).not.toContain('./real2');
  });

  it('stops scanning a bare-import from-search when an "export" keyword interrupts it first', () => {
    expect(() => scanImports("import defaultThing export './real';")).toThrow('string literal');
  });

  it('stops scanning a bare-import from-search when another "import" keyword interrupts it first', () => {
    expect(() => scanImports("import defaultThing import './real';")).toThrow('string literal');
  });

  it('rejects a bare import that runs off the end of the token stream without a from clause', () => {
    expect(() => scanImports('import defaultThing')).toThrow('string literal');
  });

  it('treats "import." (import.meta) as not an import statement', () => {
    expect(scanImports("import.meta.url; import './real';")).toEqual(['./real']);
  });

  it('rejects a dynamic import() with a trailing token after the string before the closing paren', () => {
    expect(() => scanImports("import('./x', extra)")).toThrow('string literal');
  });

  it('rejects a require(...) with a trailing token after the string before the closing paren', () => {
    expect(() => scanImports("require('./x', extra)")).toThrow('string literal');
  });

  it('rejects a bare import terminated by a semicolon before reaching a from clause', () => {
    expect(() => scanImports('import defaultThing;')).toThrow('string literal');
  });

  it('does not match "from" when the token immediately after it is not a string literal', () => {
    expect(() => scanImports('import x from unquoted;')).toThrow('string literal');
    expect(() => scanImports('export { x } from unquoted;')).not.toThrow();
    expect(scanImports('export { x } from unquoted;')).toEqual([]);
  });

  it('continues past an export clause with no from at all, without throwing', () => {
    expect(scanImports("export { x }; import './real';")).toEqual(['./real']);
  });

  it('scans every supported source extension', () => {
    const files = Object.fromEntries(
      ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs'].map((extension) =>
        [`src/file.${extension}`, 'export const value = true;']),
    );
    expect(checkArchitecture({ root: project(manifest, files) })).toMatchObject({ exitCode: 0 });
  });

  it.each(['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs'])(
    'discovers a %s file as the sole source file, not silently skipping it',
    (extension) => {
      const root = project(manifest, { [`src/file.${extension}`]: 'export const value = true;' });
      expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
    },
  );
});

describe('bounded resolution and deterministic diagnostics', () => {
  it('fails closed when configured layer roots contain no source files', () => {
    const root = project(manifest, {});
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{
        rule_id: 'PL-ARCH-NO-SOURCES', file: '', dependency: '',
        message: 'Configured layer roots contain no source files',
      }],
    });
  });

  it('falls back to a default rule_id when a manifest parse error has no .rule (malformed JSON)', () => {
    const root = mkdtempSync(join(tmpdir(), 'pl-arch-badjson-'));
    temporary.push(root);
    writeFileSync(join(root, 'layers.map.json'), '{ not valid json');
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-INVALID-MANIFEST' }],
    });
  });

  it('falls back to a default rule_id when a source-scan error has no .rule (unterminated string)', () => {
    const root = project(manifest, { 'src/broken.ts': "const s = 'never closed" });
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNSUPPORTED-SYNTAX', message: 'Unterminated string' }],
    });
  });

  it('sorts the dependencies list by file then specifier', () => {
    const root = project(manifest, {
      'src/b.ts': "import './x'; import './a';",
      'src/a.ts': "import './b';",
    });
    const result = checkArchitecture({ root });
    const pairs = (result.dependencies as { file: string; specifier: string }[]).map((d) => `${d.file}:${d.specifier}`);
    const sorted = [...pairs].sort();
    expect(pairs).toEqual(sorted);
    expect(pairs.length).toBeGreaterThan(1);
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

  it('picks the longest matching alias prefix when more than one alias could match', () => {
    const root = project({ ...manifest, aliases: { '@domain/': 'src/domain', '@domain/sub/': 'src/other' } }, {
      'src/main.ts': "import { value } from '@domain/sub/value';",
      'src/other/value.ts': 'export const value = true;',
      'src/domain/sub/value.ts': 'export const wrong = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('picks the longest alias even when it is declared before the shorter one (sort, not declaration order)', () => {
    const root = project({ ...manifest, aliases: { '@domain/sub/': 'src/other', '@domain/': 'src/domain' } }, {
      'src/main.ts': "import { value } from '@domain/sub/value';",
      'src/other/value.ts': 'export const value = true;',
      'src/domain/sub/value.ts': 'export const wrong = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('resolves an alias matching by exact equality, not only by prefix', () => {
    const root = project({ ...manifest, aliases: { '@domain': 'src/domain/index' } }, {
      'src/main.ts': "import { value } from '@domain';",
      'src/domain/index.ts': 'export const value = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('reports an unresolved alias distinctly from an unresolved relative import', () => {
    const aliasRoot = project({ ...manifest, aliases: { '@missing/': 'src/nowhere' } }, {
      'src/main.ts': "import { x } from '@missing/x';",
    });
    expect(checkArchitecture({ root: aliasRoot })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNRESOLVED-ALIAS', message: 'Cannot resolve internal import @missing/x' }],
    });

    const relativeRoot = project(manifest, {
      'src/main.ts': "import { x } from './missing';",
    });
    expect(checkArchitecture({ root: relativeRoot })).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-ARCH-UNRESOLVED-IMPORT', message: 'Cannot resolve internal import ./missing' }],
    });
  });

  it('resolves an extensionless import to an index file inside a directory', () => {
    const root = project(manifest, {
      'src/main.ts': "import { value } from './lib';",
      'src/lib/index.ts': 'export const value = true;',
    });
    expect(checkArchitecture({ root })).toMatchObject({ exitCode: 0 });
  });

  it('leaves an unrecognized bare specifier as an external dependency', () => {
    const root = project(manifest, {
      'src/main.ts': "import { z } from 'left-pad';",
    });
    const result = checkArchitecture({ root });
    expect(result).toMatchObject({ exitCode: 0 });
    expect(result.dependencies).toContainEqual(
      expect.objectContaining({ specifier: 'left-pad', dependency: 'left-pad' }),
    );
  });

  it('flags an external import as a violation when external.allow is false', () => {
    const root = project({ ...manifest, external: { allow: false } }, {
      'src/main.ts': "import { z } from 'left-pad';",
    });
    expect(checkArchitecture({ root })).toMatchObject({
      exitCode: 1,
      diagnostics: [{ rule_id: 'PL-ARCH-EXTERNAL-IMPORT' }],
    });
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
      diagnostics: [{ rule_id: 'PL-ARCH-PATH-ESCAPE', message: 'Resolved path escapes project root' }],
    });

    // Escaping AND pointing at a file that doesn't exist there: the escape must
    // still be caught at the candidate-path check, not misreported as a plain
    // unresolved import once resolveFile fails to find anything.
    writeFileSync(join(root, 'src', 'app', 'main.ts'), "import '../../../does-not-exist';");
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

describe('pl-arch-check CLI', () => {
  it('rejects an unknown CLI argument', () => {
    const result = spawnSync(process.execPath, [SCRIPT, '--bogus'], { encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Unknown argument: --bogus');
  });

  it('does not run the CLI block when imported as a module rather than executed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pl-arch-import-'));
    temporary.push(dir);
    const probe = join(dir, 'probe.mjs');
    writeFileSync(probe, `import '${SCRIPT.replace(/\\/g, '\\\\')}';\nprocess.stdout.write('imported-ok');\n`);
    const result = spawnSync(process.execPath, [probe], { encoding: 'utf8' });
    expect(result.stdout).toBe('imported-ok');
    expect(result.status).toBe(0);
  });
});

describe('pl-arch-check CLI entrypoint guard (in-process)', () => {
  async function importFresh(bustTag: string) {
    return import(`${pathToFileURL(SCRIPT).href}?bust=${bustTag}`);
  }

  async function runCliInProcess(bustTag: string, extraArgs: string[]) {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    process.argv = [originalArgv[0], SCRIPT, ...extraArgs];
    process.exitCode = undefined;
    try {
      await importFresh(bustTag);
      return { exitCode: process.exitCode, stdout: stdoutSpy.mock.calls.map((c) => c[0]).join(''), stderr: stderrSpy.mock.calls.map((c) => c[0]).join('') };
    } finally {
      stdoutSpy.mockRestore();
      stderrSpy.mockRestore();
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  }

  it('runs the CLI block and writes text diagnostics when argv[1] resolves to this module', async () => {
    const root = project(manifest, {});
    const result = await runCliInProcess('main-true', ['--root', root]);
    expect(result.exitCode).toBe(2);
    expect(result.stdout).toContain('PL-ARCH-NO-SOURCES');
    expect(result.stdout).not.toContain('{');
  });

  it('writes JSON diagnostics when --format json is given', async () => {
    const root = project(manifest, {});
    const result = await runCliInProcess('main-json', ['--root', root, '--format', 'json']);
    expect(result.exitCode).toBe(2);
    const parsed = JSON.parse(result.stdout);
    expect(parsed[0]).toMatchObject({ rule_id: 'PL-ARCH-NO-SOURCES' });
  });

  it('honors an explicit --manifest path instead of the default layers.map.json', async () => {
    const root = project(manifest, { 'src/main.ts': 'export const main = true;' });
    const altManifestPath = join(root, 'alt.manifest.json');
    writeFileSync(altManifestPath, JSON.stringify(manifest));
    const result = await runCliInProcess('main-manifest', ['--root', root, '--manifest', altManifestPath]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('defaults --manifest to <root>/layers.map.json when --manifest is omitted', async () => {
    const root = project(manifest, { 'src/main.ts': 'export const main = true;' });
    const result = await runCliInProcess('main-default-manifest', ['--root', root]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('reports an unknown CLI argument via the catch block with exit 2', async () => {
    const result = await runCliInProcess('unknown-arg', ['--bogus']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toBe('Unknown argument: --bogus\n');
  });

  it('defaults --root to the current working directory when --root is omitted', async () => {
    const root = project(manifest, {});
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
    try {
      const result = await runCliInProcess('main-cwd-default', []);
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toContain('PL-ARCH-NO-SOURCES');
    } finally {
      cwdSpy.mockRestore();
    }
  });

  it('does not run the CLI block when argv[1] is empty', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0]];
    process.exitCode = undefined;
    try {
      await importFresh('main-no-argv1');
      expect(process.exitCode).toBeUndefined();
    } finally {
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });

  it('does not run the CLI block when argv[1] resolves to a different module', async () => {
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    process.argv = [originalArgv[0], '/not/this/module.mjs'];
    process.exitCode = undefined;
    try {
      await importFresh('main-false');
      expect(process.exitCode).toBeUndefined();
    } finally {
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
    }
  });
});
