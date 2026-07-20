#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  rmdirSync,
  statSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
const KERNEL_COMMANDS = {
  arch: join(SCRIPT_DIR, 'pl-arch-check.mjs'),
  contract: join(SCRIPT_DIR, 'pl-contract-check.mjs'),
  scenario: join(SCRIPT_DIR, 'gen-scenarios.mjs'),
};
const HOSTS = new Set(['codex', 'claude-code']);
const RULE_ID_PATTERN = /\bPL-[A-Z]+(?:-[A-Z0-9]+)+\b/g;

const slash = (value) => String(value).replaceAll('\\', '/');
const inside = (root, value) => {
  const rel = relative(root, value);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};

function structuralError(rule_id, message) {
  return Object.assign(new Error(message), { rule: rule_id });
}

/** Loads and validates the shared fixture manifest driving both hosts. */
export function loadManifest(path, { fixtureRoot }) {
  const canonicalFixtureRoot = realpathSync(resolve(fixtureRoot));
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw structuralError('PL-ADAPTER-MANIFEST-PARSE', `Unable to parse fixture manifest: ${error.message}`);
  }
  if (raw?.version !== '1') throw structuralError('PL-ADAPTER-MANIFEST-VERSION', 'Unsupported fixture manifest version');
  if (!Array.isArray(raw.cases) || raw.cases.length === 0) throw structuralError('PL-ADAPTER-MANIFEST-EMPTY', 'Fixture manifest cases must be non-empty');

  const ids = new Set();
  const cases = raw.cases.map((entry) => {
    const keys = Object.keys(entry ?? {}).sort();
    const allowed = ['args', 'command', 'expected', 'fixture', 'id'];
    if (keys.join(',') !== allowed.join(',')) {
      throw structuralError('PL-ADAPTER-MANIFEST-CASE-SHAPE', `Fixture case has unexpected fields: ${keys.join(', ')}`);
    }
    if (typeof entry.id !== 'string' || entry.id.trim() === '') {
      throw structuralError('PL-ADAPTER-MANIFEST-CASE-ID', 'Fixture case id must be a non-empty string');
    }
    if (ids.has(entry.id)) throw structuralError('PL-ADAPTER-MANIFEST-DUPLICATE-ID', `Duplicate fixture case id: ${entry.id}`);
    ids.add(entry.id);
    if (!KERNEL_COMMANDS[entry.command]) {
      throw structuralError('PL-ADAPTER-MANIFEST-COMMAND', `Fixture case ${entry.id} references unknown command: ${entry.command}`);
    }
    const fixtureRootAbs = resolve(dirname(path), entry.fixture);
    if (!existsSync(fixtureRootAbs) || !inside(canonicalFixtureRoot, realpathSync(fixtureRootAbs))) {
      throw structuralError('PL-ADAPTER-MANIFEST-PATH-ESCAPE', `Fixture case ${entry.id} fixture path escapes the shared fixture root: ${entry.fixture}`);
    }
    const expectedAbs = resolve(dirname(path), entry.expected);
    if (!existsSync(expectedAbs) || !inside(canonicalFixtureRoot, realpathSync(expectedAbs))) {
      throw structuralError('PL-ADAPTER-MANIFEST-EXPECTED-MISSING', `Fixture case ${entry.id} expected reference is missing or escapes the shared fixture root: ${entry.expected}`);
    }
    if (!Array.isArray(entry.args) || entry.args.some((value) => typeof value !== 'string')) {
      throw structuralError('PL-ADAPTER-MANIFEST-ARGS', `Fixture case ${entry.id} args must be an array of strings`);
    }
    return { id: entry.id, command: entry.command, fixtureRoot: fixtureRootAbs, args: entry.args, expectedPath: expectedAbs };
  });

  return { version: '1', cases };
}

/** Loads and validates a host adapter descriptor. Descriptors carry no kernel rule ids. */
export function loadDescriptor(path) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw structuralError('PL-ADAPTER-DESCRIPTOR-PARSE', `Unable to parse host descriptor: ${error.message}`);
  }
  if (raw?.version !== '1') throw structuralError('PL-ADAPTER-DESCRIPTOR-VERSION', `Unsupported descriptor version in ${path}`);
  if (!HOSTS.has(raw.host)) throw structuralError('PL-ADAPTER-DESCRIPTOR-HOST', `Unknown descriptor host in ${path}: ${raw.host}`);
  if (raw.invocation !== 'pl-kernel') throw structuralError('PL-ADAPTER-DESCRIPTOR-INVOCATION', `Unsupported descriptor invocation in ${path}: ${raw.invocation}`);
  if (raw.display !== 'passthrough') throw structuralError('PL-ADAPTER-DESCRIPTOR-DISPLAY', `Unsupported descriptor display mode in ${path}: ${raw.display}`);
  if (typeof raw.entry !== 'string' || raw.entry.trim() === '' || isAbsolute(raw.entry)) {
    throw structuralError('PL-ADAPTER-DESCRIPTOR-ENTRY', `Descriptor entry must be a non-empty project-relative path in ${path}`);
  }
  return { version: '1', host: raw.host, invocation: raw.invocation, entry: raw.entry, display: raw.display };
}

/**
 * Scans adapter-owned descriptor/template files for embedded kernel rule ids
 * or host-specific expected-output filenames. Both are boundary violations:
 * normative rule behavior must live only in the Phase A kernel.
 */
export function checkAdapterBoundary(paths) {
  const violations = [];
  for (const path of paths) {
    const text = readFileSync(path, 'utf8');
    const matches = new Set([...text.matchAll(RULE_ID_PATTERN)].map((match) => match[0]));
    for (const ruleId of matches) {
      violations.push({ version: '1', rule_id: 'PL-ADAPTER-BOUNDARY', severity: 'error', file: slash(relative(process.cwd(), path)), dependency: '', message: `Adapter-owned file embeds kernel rule id ${ruleId}` });
    }
  }
  return violations;
}

/** Runs one kernel command as a real subprocess and returns a raw (unnormalized) result. */
function runKernelCommand(command, { root, args }) {
  const script = KERNEL_COMMANDS[command];
  const finalArgs = command === 'scenario'
    ? [...args, '--format', 'json']
    : [...args, '--root', root, '--format', 'json'];
  const result = spawnSync(process.execPath, [script, ...finalArgs], { encoding: 'utf8', cwd: root });
  return { exit_code: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

/**
 * Normalizes a raw kernel result into a versioned, host-tagged observation.
 * Structured JSON stdout is parsed; text output (e.g. a pre-JSON parse
 * failure) is kept as a normalized string. Diagnostic path fields are
 * slash-normalized so Windows and POSIX runs compare identically.
 */
export function normalizeObservation({ host, case_id, command, exit_code, stdout, stderr }) {
  let parsedStdout = stdout;
  const trimmed = stdout.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      parsedStdout = Array.isArray(parsed)
        ? parsed.map((item) => (item && typeof item === 'object' ? { ...item, file: slash(item.file ?? ''), dependency: slash(item.dependency ?? '') } : item))
        : parsed;
    } catch {
      parsedStdout = trimmed;
    }
  } else {
    parsedStdout = trimmed;
  }
  return { version: '1', host, case_id, command, exit_code, stdout: parsedStdout, stderr: stderr.trim() };
}

/** Installs a host adapter's template into an isolated consumer root; records generated paths. */
export function installAdapter(descriptor, templatesRoot, consumerRoot) {
  const source = resolve(templatesRoot, descriptor.host, descriptor.entry);
  const destination = resolve(consumerRoot, descriptor.entry);
  const root = resolve(consumerRoot);
  if (!inside(root, destination)) {
    throw structuralError('PL-ADAPTER-INSTALL-PATH-ESCAPE', `Descriptor entry escapes the consumer root: ${descriptor.entry}`);
  }
  const createdDirs = [];
  for (let dir = dirname(destination); inside(root, dir) && dir !== root && !existsSync(dir); dir = dirname(dir)) {
    createdDirs.push(dir);
  }
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination);
  return { generated: [destination], createdDirs: createdDirs.sort((a, b) => b.length - a.length) };
}

/** Removes every path an installAdapter() call generated, including directories it created. */
export function rollbackAdapter(installManifest) {
  for (const path of installManifest.generated) rmSync(path, { force: true });
  for (const dir of installManifest.createdDirs ?? []) {
    try { rmdirSync(dir); } catch { /* not empty, or already removed */ }
  }
}

function baselineHash(root) {
  if (!existsSync(root)) return '';
  const entries = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      const stat = statSync(full);
      entries.push(`${slash(relative(root, full))}:${stat.isDirectory() ? 'dir' : stat.size}`);
      if (stat.isDirectory()) walk(full);
    }
  };
  walk(root);
  return entries.join('\n');
}

export function compareObservations(a, b) {
  const differences = [];
  const fields = new Set([...Object.keys(a), ...Object.keys(b)].filter((key) => key !== 'host'));
  for (const field of fields) {
    if (JSON.stringify(a[field]) !== JSON.stringify(b[field])) differences.push(field);
  }
  return differences;
}

/**
 * Runs every fixture case through both host descriptors, installs/rolls back
 * each adapter around the run, and compares normalized observations.
 * Returns { exitCode, observations, diagnostics } where diagnostics carry
 * PL-ADAPTER-PARITY (behavioral mismatch, exit 1) or boundary violations
 * (structural, exit 2).
 */
export function runConformance({ manifest, descriptors, templatesRoot, consumerRootFactory }) {
  const diagnostics = [];
  const observations = [];
  let structuralFailure = false;

  for (const kase of manifest.cases) {
    const perHostObservations = {};
    for (const descriptor of descriptors) {
      const consumerRoot = consumerRootFactory(kase.id, descriptor.host);
      mkdirSync(consumerRoot, { recursive: true });
      const before = baselineHash(consumerRoot);
      let installManifest;
      try {
        installManifest = installAdapter(descriptor, templatesRoot, consumerRoot);
      } catch (error) {
        structuralFailure = true;
        diagnostics.push({ version: '1', rule_id: error.rule ?? 'PL-ADAPTER-INSTALL', severity: 'error', file: kase.id, dependency: descriptor.host, message: error.message });
        continue;
      }
      const raw = runKernelCommand(kase.command, { root: kase.fixtureRoot, args: kase.args });
      const observation = normalizeObservation({ host: descriptor.host, case_id: kase.id, command: kase.command, ...raw });
      observations.push(observation);
      perHostObservations[descriptor.host] = observation;
      rollbackAdapter(installManifest);
      const after = baselineHash(consumerRoot);
      if (before !== after) {
        structuralFailure = true;
        diagnostics.push({ version: '1', rule_id: 'PL-ADAPTER-ROLLBACK', severity: 'error', file: kase.id, dependency: descriptor.host, message: 'Adapter rollback left residual generated files' });
      }
    }

    const hosts = Object.keys(perHostObservations);
    if (hosts.length === 2) {
      const [first, second] = hosts;
      const differences = compareObservations(perHostObservations[first], perHostObservations[second]);
      for (const field of differences) {
        diagnostics.push({ version: '1', rule_id: 'PL-ADAPTER-PARITY', severity: 'error', file: kase.id, dependency: field, message: `Hosts ${first} and ${second} disagree on ${field} for case ${kase.id}` });
      }
    }
  }

  const exitCode = structuralFailure ? 2 : diagnostics.length ? 1 : 0;
  return { exitCode, observations, diagnostics };
}

function parseArgs(args) {
  const options = { manifest: null, descriptors: [], templatesRoot: null, format: 'text' };
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === '--manifest') options.manifest = resolve(args[++index]);
    else if (key === '--descriptor') options.descriptors.push(resolve(args[++index]));
    else if (key === '--templates-root') options.templatesRoot = resolve(args[++index]);
    else if (key === '--format') options.format = args[++index];
    else throw new Error(`Unknown argument: ${key}`);
  }
  if (!options.manifest || options.descriptors.length !== 2 || !options.templatesRoot) {
    throw new Error('--manifest, exactly two --descriptor, and --templates-root are required');
  }
  return options;
}

export function isMainModule(moduleUrl, argv1) {
  return moduleUrl === pathToFileURL(argv1 ?? '').href;
}

if (isMainModule(import.meta.url, process.argv[1])) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const fixtureRoot = resolve(dirname(options.manifest), '..');
    const manifest = loadManifest(options.manifest, { fixtureRoot });
    const descriptors = options.descriptors.map((path) => loadDescriptor(path));
    const boundaryViolations = checkAdapterBoundary([...options.descriptors, ...descriptors.map((d) => resolve(options.templatesRoot, d.host, d.entry))]);
    if (boundaryViolations.length) {
      process.stdout.write(options.format === 'json' ? `${JSON.stringify(boundaryViolations, null, 2)}\n` : boundaryViolations.map((v) => `${v.rule_id} ${v.file}: ${v.message}`).join('\n') + '\n');
      process.exitCode = 2;
    } else {
      let seq = 0;
      const result = runConformance({
        manifest,
        descriptors,
        templatesRoot: options.templatesRoot,
        consumerRootFactory: (caseId, host) => join(process.env.TMPDIR ?? '/tmp', `pl-adapter-conformance-${process.pid}-${seq++}-${caseId}-${host}`),
      });
      process.stdout.write(options.format === 'json' ? `${JSON.stringify(result.diagnostics, null, 2)}\n` : result.diagnostics.map((d) => `${d.rule_id} ${d.file}: ${d.message}`).join('\n') + (result.diagnostics.length ? '\n' : ''));
      process.exitCode = result.exitCode;
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
