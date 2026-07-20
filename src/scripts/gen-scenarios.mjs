#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const diagnostic = (rule_id, file, message) => ({
  version: '1', rule_id, severity: 'error', file, dependency: '', message,
});

function modelFrom(input) {
  return input?.exploration_output ?? input;
}

function validate(model, file) {
  const invalid = [];
  const legacyKeys = ['domain_events', 'commands', 'aggregates'];
  for (const key of legacyKeys) {
    if (!Array.isArray(model?.[key]) || model[key].length === 0
      || model[key].some((value) => typeof value !== 'string' || value.trim() === '' || /[\r\n]/.test(value))
      || new Set(model[key]).size !== model[key].length) {
      invalid.push(diagnostic('PL-SCENARIO-OWNERSHIP', file, `${key} must remain a non-empty array of unique, non-empty single-line strings`));
    }
  }
  const unknownVersion = Object.keys(model ?? {})
    .find((key) => /^ownership_relations_v\d+$/.test(key) && key !== 'ownership_relations_v1');
  if (unknownVersion) invalid.push(diagnostic('PL-SCENARIO-OWNERSHIP', file, `Unsupported ownership relation version: ${unknownVersion}`));
  if (!Array.isArray(model?.ownership_relations_v1)) {
    invalid.push(diagnostic('PL-SCENARIO-OWNERSHIP', file, 'ownership_relations_v1 must be an array'));
  }
  if (invalid.length) return invalid;

  const commands = new Set(model.commands);
  const events = new Set(model.domain_events);
  const aggregates = new Set(model.aggregates);
  const commandCounts = new Map(model.commands.map((value) => [value, 0]));
  const eventCounts = new Map(model.domain_events.map((value) => [value, 0]));
  let exactReferences = true;
  for (const relation of model.ownership_relations_v1) {
    if (!relation || typeof relation.command !== 'string' || typeof relation.aggregate !== 'string'
      || typeof relation.event !== 'string' || !commands.has(relation.command)
      || !events.has(relation.event) || !aggregates.has(relation.aggregate)) {
      exactReferences = false;
      continue;
    }
    commandCounts.set(relation.command, commandCounts.get(relation.command) + 1);
    eventCounts.set(relation.event, eventCounts.get(relation.event) + 1);
  }
  if (!exactReferences || [...commandCounts.values(), ...eventCounts.values()].some((count) => count !== 1)) {
    invalid.push(diagnostic('PL-SCENARIO-OWNERSHIP', file,
      'Each command and event must have exactly one ownership relation'));
  }
  return invalid;
}

export function compileScenarios(input, { file = 'exploration.json' } = {}) {
  const model = modelFrom(input);
  const diagnostics = validate(model, file);
  if (diagnostics.length) return { exitCode: 2, diagnostics, output: '', coverageChecked: false };
  const output = model.ownership_relations_v1.map(({ command, aggregate, event }) => [
    `#### Scenario: ${command} on ${aggregate}`,
    '- **GIVEN** <FILL: precondition>',
    `- **WHEN** ${command}`,
    `- **THEN** <FILL: assert ${event}>`,
  ].join('\n')).join('\n\n') + (model.ownership_relations_v1.length ? '\n' : '');
  return { exitCode: 0, diagnostics: [], output, coverageChecked: false };
}

export function checkEventCoverage(input, scenarioText, { file = 'exploration.json' } = {}) {
  const model = modelFrom(input);
  const diagnostics = validate(model, file);
  if (diagnostics.length) return { exitCode: 2, diagnostics, output: '', coverageChecked: true };
  const thenClauses = scenarioText.split(/\r?\n/)
    .filter((line) => /^\s*-\s+\*\*THEN\*\*/.test(line))
    .map((line) => line.replace(/^\s*-\s+\*\*THEN\*\*\s*/, '').trim())
    .filter((line) => !line.includes('<FILL:'));
  const missing = model.domain_events.filter((event) => !thenClauses.includes(event));
  const violations = missing.map((event) => diagnostic('PL-SCENARIO-MISSING-EVENT', file,
    `Domain event ${event} appears in no completed scenario THEN clause`));
  return { exitCode: violations.length ? 1 : 0, diagnostics: violations, output: '', coverageChecked: true };
}

function parseArgs(args) {
  const options = { input: null, scenarios: null, format: 'text' };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--input') options.input = resolve(args[++index]);
    else if (args[index] === '--scenarios') options.scenarios = resolve(args[++index]);
    else if (args[index] === '--format') options.format = args[++index];
    else throw new Error(`Unknown argument: ${args[index]}`);
  }
  if (!options.input) throw new Error('--input is required');
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const input = JSON.parse(readFileSync(options.input, 'utf8'));
    const context = { file: basename(options.input) };
    const result = options.scenarios
      ? checkEventCoverage(input, readFileSync(options.scenarios, 'utf8'), context)
      : compileScenarios(input, context);
    if (!options.scenarios && options.format !== 'json' && result.exitCode === 0) process.stdout.write(result.output);
    else process.stdout.write(options.format === 'json'
      ? `${JSON.stringify(result.diagnostics, null, 2)}\n`
      : result.diagnostics.map((item) => `${item.rule_id} ${item.file}: ${item.message}`).join('\n') + (result.diagnostics.length ? '\n' : ''));
    process.exitCode = result.exitCode;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
