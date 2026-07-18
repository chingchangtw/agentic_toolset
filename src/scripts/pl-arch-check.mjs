#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs';
import {
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs'];

const slash = (value) => value.replaceAll('\\', '/');
const projectPath = (root, value) => slash(relative(root, value));
const inside = (root, value) => {
  const rel = relative(root, value);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};
const diagnostic = (rule_id, file, dependency, message) => ({
  version: '1', rule_id, severity: 'error', file, dependency, message,
});

function compileGlob(glob) {
  const normalized = slash(glob);
  const segments = normalized.split('/');
  if (!normalized || /[?\[\]{}!]/.test(normalized)
    || segments.some((part) => part.includes('**') && part !== '**')) {
    throw new Error(`Unsupported glob: ${glob}`);
  }
  const pattern = segments.map((part, index) => {
    if (part === '**') return index === segments.length - 1 ? '.*' : '(?:[^/]+/)*';
    return part.replace(/[.+^$()|\\]/g, '\\$&').replaceAll('*', '[^/]*');
  }).join('/');
  return new RegExp(`^${pattern}$`);
}

function validateManifest(raw) {
  if (raw?.version !== '1') throw Object.assign(new Error('Unsupported manifest version'), { rule: 'PL-ARCH-MANIFEST-VERSION' });
  if (!Array.isArray(raw.layers) || raw.layers.length === 0) throw new Error('Manifest layers must be non-empty');
  const names = new Set(raw.layers.map((layer) => layer?.name));
  if (names.size !== raw.layers.length || names.has(undefined) || names.has('')) throw new Error('Layer names must be unique non-empty strings');
  const layers = raw.layers.map((layer) => {
    if (!Array.isArray(layer.globs) || !Array.isArray(layer.may_import)) throw new Error(`Invalid layer ${layer.name}`);
    if (layer.may_import.some((name) => !names.has(name))) throw new Error(`Unknown may_import layer in ${layer.name}`);
    let globs;
    try { globs = layer.globs.map(compileGlob); }
    catch (error) { throw Object.assign(error, { rule: 'PL-ARCH-UNSUPPORTED-GLOB' }); }
    return { ...layer, patterns: layer.globs, globs };
  });
  const aliases = raw.aliases ?? {};
  if (!aliases || Array.isArray(aliases) || typeof aliases !== 'object'
    || Object.entries(aliases).some(([key, value]) => !key || typeof value !== 'string')) {
    throw new Error('Manifest aliases must map non-empty keys to paths');
  }
  if (typeof raw.external?.allow !== 'boolean') throw new Error('Manifest external.allow must be boolean');
  return { layers, aliases, external: raw.external };
}

function walkSources(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && SOURCE_EXTENSIONS.includes(extname(entry.name))) files.push(path);
    }
  };
  walk(root);
  return files.sort((a, b) => slash(a).localeCompare(slash(b)));
}

function configuredSourceRoots(root, layers) {
  const roots = new Set();
  const conventional = join(root, 'src');
  if (existsSync(conventional)) roots.add(realpathSync(conventional));
  for (const layer of layers) {
    for (const pattern of layer.patterns) {
      const normalized = slash(pattern);
      const wildcard = normalized.search(/[*?\[]/);
      let prefix = (wildcard === -1 ? normalized.replace(/\/[^/]+$/, '') : normalized.slice(0, wildcard));
      prefix = prefix.replace(/\/+$/, '');
      const candidate = resolve(root, prefix || '.');
      if (inside(root, candidate) && existsSync(candidate)) roots.add(realpathSync(candidate));
    }
  }
  return [...roots].sort((a, b) => slash(a).localeCompare(slash(b)));
}

export function lexSource(source) {
  const tokens = [];
  for (let index = 0; index < source.length;) {
    const char = source[index];
    if (/\s/.test(char)) { index += 1; continue; }
    if (char === '/' && source[index + 1] === '/') {
      index = source.indexOf('\n', index + 2);
      if (index < 0) break;
      continue;
    }
    if (char === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2);
      if (end < 0) throw new Error('Unterminated block comment');
      index = end + 2;
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      let value = '';
      let closed = false;
      let escaped = false;
      index += 1;
      while (index < source.length) {
        if (source[index] === '\\') {
          if (index + 1 >= source.length) break;
          escaped = true;
          value += source[index + 1];
          index += 2;
        } else if (source[index] === quote) {
          index += 1;
          closed = true;
          break;
        } else {
          value += source[index++];
        }
      }
      if (!closed) throw new Error('Unterminated string');
      tokens.push({ type: 'string', value, escaped });
      continue;
    }
    if (char === '`') {
      let closed = false;
      index += 1;
      while (index < source.length) {
        if (source[index] === '\\') index += 2;
        else if (source[index] === '`') { index += 1; closed = true; break; }
        else index += 1;
      }
      if (!closed) throw new Error('Unterminated template');
      tokens.push({ type: 'template', value: '' });
      continue;
    }
    if (/[A-Za-z_$]/.test(char)) {
      let end = index + 1;
      while (end < source.length && /[\w$]/.test(source[end])) end += 1;
      tokens.push({ type: 'identifier', value: source.slice(index, end) });
      index = end;
      continue;
    }
    tokens.push({ type: 'punctuation', value: char });
    index += 1;
  }
  return tokens;
}

export function scanImports(source) {
  const tokens = lexSource(source);
  const dependencies = [];
  const unsupported = () => Object.assign(new Error('Dynamic import/require must use a string literal'), { rule: 'PL-ARCH-UNSUPPORTED-SYNTAX' });
  const moduleSpecifier = (token) => {
    if (token?.type !== 'string') throw unsupported();
    if (token.escaped) throw Object.assign(new Error('Direct imports cannot use an escaped module specifier'), { rule: 'PL-ARCH-UNSUPPORTED-SYNTAX' });
    return token.value;
  };
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== 'identifier') continue;
    if (token.value === 'import') {
      const next = tokens[index + 1];
      if (next?.value === '.') continue;
      if (next?.value === '(') {
        if (tokens[index + 2]?.type !== 'string' || tokens[index + 3]?.value !== ')') throw unsupported();
        dependencies.push(moduleSpecifier(tokens[index + 2]));
        index += 3;
      } else if (next?.type === 'string') {
        dependencies.push(moduleSpecifier(next));
        index += 1;
      } else {
        let cursor = index + 1;
        while (cursor < tokens.length && tokens[cursor].value !== ';'
          && tokens[cursor].value !== 'import' && tokens[cursor].value !== 'export') {
          if (tokens[cursor].value === 'from' && tokens[cursor + 1]?.type === 'string') {
            dependencies.push(moduleSpecifier(tokens[cursor + 1]));
            index = cursor + 1;
            break;
          }
          cursor += 1;
        }
        if (cursor >= tokens.length || tokens[cursor]?.value !== 'from') throw unsupported();
      }
    } else if (token.value === 'export') {
      let cursor = index + 1;
      while (cursor < tokens.length && tokens[cursor].value !== ';'
        && tokens[cursor].value !== 'import' && tokens[cursor].value !== 'export') {
        if (tokens[cursor].value === 'from' && tokens[cursor + 1]?.type === 'string') {
          dependencies.push(moduleSpecifier(tokens[cursor + 1]));
          index = cursor + 1;
          break;
        }
        cursor += 1;
      }
    } else if (token.value === 'require' && tokens[index - 1]?.value !== '.') {
      if (tokens[index + 1]?.value !== '(') {
        throw Object.assign(new Error('Direct require(...) calls are required'), { rule: 'PL-ARCH-UNSUPPORTED-SYNTAX' });
      }
      if (tokens[index + 2]?.type !== 'string' || tokens[index + 3]?.value !== ')') throw unsupported();
      dependencies.push(moduleSpecifier(tokens[index + 2]));
      index += 3;
    } else if (token.value === 'require' && tokens[index - 1]?.value === '.' && tokens[index + 1]?.value === '(') {
      throw Object.assign(new Error('Direct require(...) calls are required'), { rule: 'PL-ARCH-UNSUPPORTED-SYNTAX' });
    }
  }
  return dependencies;
}

function resolveFile(candidate) {
  const choices = [candidate, ...SOURCE_EXTENSIONS.map((extension) => candidate + extension),
    ...SOURCE_EXTENSIONS.map((extension) => join(candidate, `index${extension}`))];
  return choices.find((path) => existsSync(path) && statSync(path).isFile()) ?? null;
}

function resolveImport(root, sourceFile, specifier, aliases) {
  let candidate;
  let internal = false;
  let alias = false;
  if (specifier.startsWith('.')) {
    candidate = resolve(dirname(sourceFile), specifier);
    internal = true;
  } else {
    const key = Object.keys(aliases).sort((a, b) => b.length - a.length)
      .find((name) => specifier === name || specifier.startsWith(name));
    if (!key) return { external: true };
    candidate = resolve(root, aliases[key], specifier.slice(key.length).replace(/^[/\\]/, ''));
    internal = true;
    alias = true;
  }
  if (internal && !inside(root, candidate)) return { error: 'PL-ARCH-PATH-ESCAPE' };
  const file = resolveFile(candidate);
  if (!file) return { error: alias ? 'PL-ARCH-UNRESOLVED-ALIAS' : 'PL-ARCH-UNRESOLVED-IMPORT' };
  const canonical = realpathSync(file);
  if (!inside(root, canonical)) return { error: 'PL-ARCH-PATH-ESCAPE' };
  return { file: canonical };
}

export function checkArchitecture({ root, manifest = join(root, 'layers.map.json') }) {
  const invalid = [];
  const violations = [];
  const dependencies = [];
  const canonicalRoot = realpathSync(root);
  let config;
  try {
    config = validateManifest(JSON.parse(readFileSync(manifest, 'utf8')));
  } catch (error) {
    invalid.push(diagnostic(error.rule ?? 'PL-ARCH-INVALID-MANIFEST', projectPath(canonicalRoot, manifest), '', error.message));
    return { exitCode: 2, diagnostics: invalid, dependencies };
  }

  const files = [...new Set(configuredSourceRoots(canonicalRoot, config.layers).flatMap(walkSources))];
  if (files.length === 0) {
    invalid.push(diagnostic('PL-ARCH-NO-SOURCES', '', '', 'Configured layer roots contain no source files'));
  }
  const ownership = new Map();
  for (const file of files) {
    const rel = projectPath(canonicalRoot, file);
    const matches = config.layers.filter((layer) => layer.globs.some((glob) => glob.test(rel)));
    if (matches.length === 0) invalid.push(diagnostic('PL-ARCH-UNMATCHED-LAYER', rel, '', `No layer owns ${rel}`));
    else if (matches.length > 1) invalid.push(diagnostic('PL-ARCH-AMBIGUOUS-LAYER', rel, '', `Multiple layers own ${rel}`));
    else ownership.set(file, matches[0]);
  }

  for (const file of files) {
    const fromLayer = ownership.get(file);
    if (!fromLayer) continue;
    const rel = projectPath(canonicalRoot, file);
    let imports;
    try { imports = scanImports(readFileSync(file, 'utf8')); }
    catch (error) {
      invalid.push(diagnostic(error.rule ?? 'PL-ARCH-UNSUPPORTED-SYNTAX', rel, '', error.message));
      continue;
    }
    for (const specifier of imports) {
      const resolved = resolveImport(canonicalRoot, file, specifier, config.aliases);
      if (resolved.external) {
        dependencies.push({ file: rel, specifier, dependency: specifier });
        if (!config.external.allow) violations.push(diagnostic('PL-ARCH-EXTERNAL-IMPORT', rel, specifier, `External import ${specifier} is forbidden`));
        continue;
      }
      if (resolved.error) {
        invalid.push(diagnostic(resolved.error, rel, specifier,
          resolved.error === 'PL-ARCH-PATH-ESCAPE' ? 'Resolved path escapes project root' : `Cannot resolve internal import ${specifier}`));
        continue;
      }
      const dependency = projectPath(canonicalRoot, resolved.file);
      dependencies.push({ file: rel, specifier, dependency });
      const toLayer = ownership.get(resolved.file);
      if (!toLayer) continue;
      if (!fromLayer.may_import.includes(toLayer.name)) {
        violations.push(diagnostic('PL-ARCH-FORBIDDEN-IMPORT', rel, dependency,
          `Layer ${fromLayer.name} may not import ${toLayer.name}`));
      }
    }
  }

  const diagnostics = [...invalid, ...violations].sort((a, b) =>
    `${a.file}\0${a.rule_id}\0${a.dependency}`.localeCompare(`${b.file}\0${b.rule_id}\0${b.dependency}`));
  dependencies.sort((a, b) => `${a.file}\0${a.specifier}`.localeCompare(`${b.file}\0${b.specifier}`));
  return { exitCode: invalid.length ? 2 : violations.length ? 1 : 0, diagnostics, dependencies };
}

function parseArgs(args) {
  const options = { root: process.cwd(), manifest: null, format: 'text' };
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === '--root') options.root = resolve(args[++index]);
    else if (key === '--manifest') options.manifest = resolve(args[++index]);
    else if (key === '--format') options.format = args[++index];
    else throw new Error(`Unknown argument: ${key}`);
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = checkArchitecture({ root: options.root, manifest: options.manifest ?? join(options.root, 'layers.map.json') });
    const output = options.format === 'json'
      ? `${JSON.stringify(result.diagnostics, null, 2)}\n`
      : result.diagnostics.map((item) => `${item.rule_id} ${item.file}: ${item.message}`).join('\n') + (result.diagnostics.length ? '\n' : '');
    process.stdout.write(output);
    process.exitCode = result.exitCode;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
