#!/usr/bin/env node

import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { lexSource } from './pl-arch-check.mjs';

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs']);
const CONTRACTS = new Set(['requires', 'ensures', 'invariant']);
const TESTS = new Set(['it', 'test']);
const ID = /\b[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+\b/g;
const slash = (value) => value.replaceAll('\\', '/');
const diagnostic = (rule_id, file, message) => ({
  version: '1', rule_id, severity: 'error', file, dependency: '', message,
});

const inside = (root, value) => {
  const rel = relative(root, value);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};

function expand(paths, root) {
  const files = [];
  const escaped = [];
  const visited = new Set();
  const walk = (path) => {
    const canonical = realpathSync(path);
    if (!inside(root, canonical)) {
      escaped.push(canonical);
      return;
    }
    if (visited.has(canonical)) return;
    visited.add(canonical);
    const stat = statSync(canonical);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(canonical).sort()) walk(join(canonical, entry));
    } else if (EXTENSIONS.has(extname(canonical))) files.push(canonical);
  };
  for (const path of paths) walk(path);
  return { files: [...new Set(files)].sort((a, b) => slash(a).localeCompare(slash(b))), escaped };
}

function secondArgumentString(tokens, start) {
  if (tokens[start + 1]?.value !== '(') return null;
  let depth = 0;
  let commas = 0;
  for (let index = start + 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.value === '(' || token.value === '[' || token.value === '{') depth += 1;
    else if (token.value === ')' || token.value === ']' || token.value === '}') depth -= 1;
    else if (token.value === ',' && depth === 1) commas += 1;
    else if (commas === 1 && depth === 1) return token.type === 'string' ? token.value : null;
    if (depth === 0) break;
  }
  return null;
}

function findCallEnd(tokens, openIndex) {
  let depth = 0;
  for (let index = openIndex; index < tokens.length; index += 1) {
    if (tokens[index].value === '(') depth += 1;
    else if (tokens[index].value === ')' && --depth === 0) return index;
  }
  return null;
}

export function checkContracts({ root, sourceFiles, testFiles }) {
  const canonicalRoot = realpathSync(resolve(root));
  const declarations = [];
  const tests = [];
  const invalid = [];
  const evidenceViolations = [];
  const sources = expand(sourceFiles.map((path) => resolve(path)), canonicalRoot);
  const testInputs = expand(testFiles.map((path) => resolve(path)), canonicalRoot);
  for (const path of [...sources.escaped, ...testInputs.escaped]) {
    invalid.push(diagnostic('PL-CONTRACT-PATH-ESCAPE', slash(relative(canonicalRoot, path)), 'Contract evidence must stay inside project root'));
  }
  if (invalid.length) return { exitCode: 2, diagnostics: invalid };

  for (const file of sources.files) {
    const rel = slash(relative(canonicalRoot, file));
    const tokens = lexSource(readFileSync(file, 'utf8'));
    const aliases = new Set(CONTRACTS);
    for (let index = 0; index < tokens.length - 2; index += 1) {
      if (CONTRACTS.has(tokens[index].value) && tokens[index + 1]?.value === 'as'
        && tokens[index + 2]?.type === 'identifier') aliases.add(tokens[index + 2].value);
      if (tokens[index].type === 'identifier' && tokens[index + 1]?.value === '='
        && aliases.has(tokens[index + 2]?.value)) aliases.add(tokens[index].value);
    }
    for (let index = 0; index < tokens.length; index += 1) {
      if (tokens[index].type !== 'identifier' || !aliases.has(tokens[index].value)
        || tokens[index + 1]?.value !== '(') continue;
      const id = secondArgumentString(tokens, index);
      if (!id) invalid.push(diagnostic('PL-CONTRACT-UNSUPPORTED-SYNTAX', rel, 'Contract id must be a string literal'));
      else declarations.push({ id, file: rel });
    }
  }

  for (const file of testInputs.files) {
    const rel = slash(relative(canonicalRoot, file));
    const tokens = lexSource(readFileSync(file, 'utf8'));
    for (let index = 0; index < tokens.length; index += 1) {
      if (tokens[index].type !== 'identifier' || !TESTS.has(tokens[index].value)
        || tokens[index + 1]?.value !== '(' || tokens[index + 2]?.type !== 'string') continue;
      const ids = tokens[index + 2].value.match(ID) ?? [];
      const callEnd = findCallEnd(tokens, index + 1);
      const bodyTokens = tokens.slice(index + 3, callEnd ?? tokens.length);
      const hasEvidence = bodyTokens.some((token) => token.type === 'identifier' && token.value !== 'async');
      for (const id of ids) tests.push({ id, file: rel });
      if (ids.length && !hasEvidence) {
        evidenceViolations.push(diagnostic('PL-CONTRACT-EMPTY-TEST', rel, `Violation test ${ids.join(', ')} has an empty callback`));
      }
    }
  }

  if (declarations.length === 0 && tests.length === 0) {
    return {
      exitCode: 2,
      diagnostics: [diagnostic('PL-CONTRACT-NO-EVIDENCE', '', 'At least one contract declaration and violation test are required')],
    };
  }

  const violations = [...evidenceViolations];
  const declarationCounts = new Map();
  for (const item of declarations) declarationCounts.set(item.id, (declarationCounts.get(item.id) ?? 0) + 1);
  const testIds = new Set(tests.map((item) => item.id));
  for (const item of declarations) {
    if (declarationCounts.get(item.id) > 1
      && !violations.some((entry) => entry.rule_id === 'PL-CONTRACT-DUPLICATE-ID' && entry.message.includes(item.id))) {
      violations.push(diagnostic('PL-CONTRACT-DUPLICATE-ID', item.file, `Contract id ${item.id} is declared more than once`));
    }
    if (!testIds.has(item.id)
      && !violations.some((entry) => entry.rule_id === 'PL-CONTRACT-MISSING-TEST' && entry.message.includes(item.id))) {
      violations.push(diagnostic('PL-CONTRACT-MISSING-TEST', item.file, `Contract ${item.id} has no violation test`));
    }
  }
  const declaredIds = new Set(declarations.map((item) => item.id));
  for (const item of tests) {
    if (!declaredIds.has(item.id)
      && !violations.some((entry) => entry.rule_id === 'PL-CONTRACT-ORPHAN-TEST' && entry.message.includes(item.id))) {
      violations.push(diagnostic('PL-CONTRACT-ORPHAN-TEST', item.file, `Violation test ${item.id} has no contract declaration`));
    }
  }

  const diagnostics = [...invalid, ...violations].sort((a, b) =>
    `${a.file}\0${a.rule_id}\0${a.message}`.localeCompare(`${b.file}\0${b.rule_id}\0${b.message}`));
  return { exitCode: invalid.length ? 2 : violations.length ? 1 : 0, diagnostics };
}

function parseArgs(args) {
  const options = { root: process.cwd(), sources: [], tests: [], format: 'text' };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--root') options.root = resolve(args[++index]);
    else if (args[index] === '--source') options.sources.push(resolve(args[++index]));
    else if (args[index] === '--test') options.tests.push(resolve(args[++index]));
    else if (args[index] === '--format') options.format = args[++index];
    else throw new Error(`Unknown argument: ${args[index]}`);
  }
  if (!options.sources.length || !options.tests.length) throw new Error('At least one --source and --test are required');
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = checkContracts({ root: options.root, sourceFiles: options.sources, testFiles: options.tests });
    process.stdout.write(options.format === 'json'
      ? `${JSON.stringify(result.diagnostics, null, 2)}\n`
      : result.diagnostics.map((item) => `${item.rule_id} ${item.file}: ${item.message}`).join('\n') + (result.diagnostics.length ? '\n' : ''));
    process.exitCode = result.exitCode;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
