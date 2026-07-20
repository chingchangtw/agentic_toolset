import { describe, expect, it, vi } from 'vitest';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

// @ts-expect-error Phase-A command intentionally ships as portable JavaScript.
import { checkEventCoverage, compileScenarios } from '../../scripts/gen-scenarios.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/gen-scenarios.mjs', import.meta.url));

function tenRelations() {
  const commands = Array.from({ length: 10 }, (_, index) => `Command ${index + 1}`);
  const domain_events = Array.from({ length: 10 }, (_, index) => `Event ${index + 1}`);
  const aggregates = Array.from({ length: 10 }, (_, index) => `Aggregate ${index + 1}`);
  return {
    commands,
    domain_events,
    aggregates,
    ownership_relations_v1: commands.map((command, index) => ({
      command,
      aggregate: aggregates[index],
      event: domain_events[index],
    })),
  };
}

describe('scenario generation', () => {
  it('emits ten deterministic skeletons without mutating legacy arrays', () => {
    const input = tenRelations();
    const before = structuredClone(input);
    const result = compileScenarios(input);
    expect(result.exitCode).toBe(0);
    expect(result.coverageChecked).toBe(false);
    expect(result.output.match(/^#### Scenario:/gm)).toHaveLength(10);
    expect(input).toEqual(before);
  });

  it('matches the duplicate-ownership golden diagnostic', () => {
    const root = fileURLToPath(new URL('../fixtures/pl-sample-app/ownership-failing/', import.meta.url));
    const input = JSON.parse(readFileSync(join(root, 'exploration.json'), 'utf8'));
    const expected = JSON.parse(readFileSync(join(root, 'expected.json'), 'utf8'));
    expect(compileScenarios(input)).toMatchObject({ exitCode: 2, diagnostics: expected });
  });

  it('rejects missing ownership, unknown versions, and non-exact references', () => {
    const missing = tenRelations();
    missing.ownership_relations_v1.pop();
    expect(compileScenarios(missing)).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-SCENARIO-OWNERSHIP' }],
    });

    const unknown = { ...tenRelations(), ownership_relations_v2: [] };
    expect(compileScenarios(unknown)).toMatchObject({
      exitCode: 2,
      diagnostics: [{ rule_id: 'PL-SCENARIO-OWNERSHIP' }],
    });

    const wrong = tenRelations();
    wrong.ownership_relations_v1[0].aggregate = 'Not an aggregate';
    expect(compileScenarios(wrong)).toMatchObject({ exitCode: 2 });
  });

  it('does not throw when the model itself is missing (optional-chained legacy-key lookup)', () => {
    const result = compileScenarios(null);
    expect(result.exitCode).toBe(2);
    expect(result.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ rule_id: 'PL-SCENARIO-OWNERSHIP', message: expect.stringContaining('domain_events') }),
      expect.objectContaining({ rule_id: 'PL-SCENARIO-OWNERSHIP', message: expect.stringContaining('commands') }),
      expect.objectContaining({ rule_id: 'PL-SCENARIO-OWNERSHIP', message: expect.stringContaining('aggregates') }),
    ]));
  });

  it.each(['domain_events', 'commands', 'aggregates'] as const)(
    'flags %s individually for each invalid shape',
    (key) => {
      const emptyArray = tenRelations();
      emptyArray[key] = [];
      expect(compileScenarios(emptyArray).diagnostics)
        .toContainEqual(expect.objectContaining({ message: expect.stringContaining(key) }));

      const nonString = tenRelations();
      nonString[key] = [...nonString[key].slice(0, -1), 123 as unknown as string];
      expect(compileScenarios(nonString).diagnostics)
        .toContainEqual(expect.objectContaining({ message: expect.stringContaining(key) }));

      const blank = tenRelations();
      blank[key] = [...blank[key].slice(0, -1), '   '];
      expect(compileScenarios(blank).diagnostics)
        .toContainEqual(expect.objectContaining({ message: expect.stringContaining(key) }));

      const multiline = tenRelations();
      multiline[key] = [...multiline[key].slice(0, -1), 'a\nb'];
      expect(compileScenarios(multiline).diagnostics)
        .toContainEqual(expect.objectContaining({ message: expect.stringContaining(key) }));

      const duplicate = tenRelations();
      duplicate[key] = [...duplicate[key].slice(0, -1), duplicate[key][0]];
      expect(compileScenarios(duplicate).diagnostics)
        .toContainEqual(expect.objectContaining({ message: expect.stringContaining(key) }));
    },
  );

  it('anchors the unknown-version regex to the full ownership_relations_v<digits> key', () => {
    // Missing ^: an unrelated key ending the same way must not be flagged.
    const suffixOnly = { ...tenRelations(), weird_ownership_relations_v2: [] };
    expect(compileScenarios(suffixOnly).diagnostics
      .some((d: { message: string }) => d.message.includes('Unsupported ownership relation version'))).toBe(false);

    // \d+ (not \d): multi-digit versions must still be caught.
    const multiDigit = { ...tenRelations(), ownership_relations_v10: [] };
    expect(compileScenarios(multiDigit).diagnostics).toContainEqual(
      expect.objectContaining({ message: 'Unsupported ownership relation version: ownership_relations_v10' }),
    );

    // Missing $: trailing garbage after the digits must not be flagged.
    const suffixGarbage = { ...tenRelations(), ownership_relations_v2x: [] };
    expect(compileScenarios(suffixGarbage).diagnostics
      .some((d: { message: string }) => d.message.includes('Unsupported ownership relation version'))).toBe(false);
  });

  it('requires ownership_relations_v1 to be an array even when other keys are valid', () => {
    const noRelations = tenRelations();
    delete (noRelations as { ownership_relations_v1?: unknown }).ownership_relations_v1;
    expect(compileScenarios(noRelations).diagnostics).toContainEqual(
      expect.objectContaining({ message: 'ownership_relations_v1 must be an array' }),
    );
  });

  it('flags a relation object with the wrong field types or an unknown command/event/aggregate reference', () => {
    const badShape = tenRelations();
    badShape.ownership_relations_v1[0] = { command: 1, aggregate: 'x', event: 'y' } as never;
    expect(compileScenarios(badShape)).toMatchObject({
      exitCode: 2,
      diagnostics: [{ message: 'Each command and event must have exactly one ownership relation' }],
    });

    const nullRelation = tenRelations();
    nullRelation.ownership_relations_v1[0] = null as never;
    expect(compileScenarios(nullRelation)).toMatchObject({ exitCode: 2 });

    const unknownCommand = tenRelations();
    unknownCommand.ownership_relations_v1[0].command = 'Not a command';
    expect(compileScenarios(unknownCommand)).toMatchObject({ exitCode: 2 });

    const unknownEvent = tenRelations();
    unknownEvent.ownership_relations_v1[0].event = 'Not an event';
    expect(compileScenarios(unknownEvent)).toMatchObject({ exitCode: 2 });
  });

  it('flags a command or event reused across more than one ownership relation', () => {
    const doubleUsed = tenRelations();
    doubleUsed.ownership_relations_v1[1] = { ...doubleUsed.ownership_relations_v1[0] };
    expect(compileScenarios(doubleUsed)).toMatchObject({
      exitCode: 2,
      diagnostics: [{ message: 'Each command and event must have exactly one ownership relation' }],
    });
  });
});

describe('completed scenario coverage', () => {
  const input = {
    commands: ['Start Loan', 'Return Item'],
    domain_events: ['Loan Started', 'Item Returned'],
    aggregates: ['Loan', 'Item'],
    ownership_relations_v1: [
      { command: 'Start Loan', aggregate: 'Loan', event: 'Loan Started' },
      { command: 'Return Item', aggregate: 'Item', event: 'Item Returned' },
    ],
  };

  it('reports each event missing from completed THEN clauses', () => {
    expect(checkEventCoverage(input, `
      #### Scenario: start
      - **WHEN** Start Loan
      - **THEN** Loan Started
    `)).toMatchObject({
      exitCode: 1,
      coverageChecked: true,
      diagnostics: [{ rule_id: 'PL-SCENARIO-MISSING-EVENT', message: expect.stringContaining('Item Returned') }],
    });
  });

  it('passes only when every completed THEN clause covers all events', () => {
    expect(checkEventCoverage(input, `
      - **THEN** Loan Started
      - **THEN** Item Returned
    `)).toEqual({ exitCode: 0, diagnostics: [], output: '', coverageChecked: true });
  });

  it('does not treat generated placeholders as completed coverage', () => {
    const generated = compileScenarios(input);
    expect(checkEventCoverage(input, generated.output)).toMatchObject({
      exitCode: 1,
      diagnostics: [
        { rule_id: 'PL-SCENARIO-MISSING-EVENT', message: expect.stringContaining('Loan Started') },
        { rule_id: 'PL-SCENARIO-MISSING-EVENT', message: expect.stringContaining('Item Returned') },
      ],
    });
  });

  it('returns diagnostics unchecked when the model itself is invalid', () => {
    const result = checkEventCoverage(null, '- **THEN** anything');
    expect(result.exitCode).toBe(2);
    expect(result.coverageChecked).toBe(true);
    expect(result.diagnostics[0]).toMatchObject({ rule_id: 'PL-SCENARIO-OWNERSHIP' });
  });

  it('requires the THEN marker at the start of the line, not merely present anywhere in it', () => {
    // Missing ^ in the detection regex would match this line even though the
    // dash is not the first non-whitespace character.
    expect(checkEventCoverage(input, 'prefix text - **THEN** Loan Started\n- **THEN** Item Returned'))
      .toMatchObject({ exitCode: 1 });
  });

  it('recognizes a THEN clause with more than one space after the dash', () => {
    // \s (single) instead of \s+ would fail to match two spaces here.
    expect(checkEventCoverage(input, '-  **THEN** Loan Started\n- **THEN** Item Returned'))
      .toEqual({ exitCode: 0, diagnostics: [], output: '', coverageChecked: true });
  });

  it('matches event assertions exactly and rejects empty identifiers', () => {
    const overlapping = {
      commands: ['Create'],
      domain_events: ['Order'],
      aggregates: ['Order'],
      ownership_relations_v1: [{ command: 'Create', aggregate: 'Order', event: 'Order' }],
    };
    expect(checkEventCoverage(overlapping, '- **THEN** OrderCreated')).toMatchObject({ exitCode: 1 });

    const invalid = structuredClone(overlapping);
    invalid.domain_events = [''];
    invalid.ownership_relations_v1[0].event = '';
    expect(compileScenarios(invalid)).toMatchObject({ exitCode: 2 });
  });
});

describe('gen-scenarios CLI', () => {
  function withInputFile(model: unknown, run: (dir: string, inputPath: string) => void) {
    const dir = mkdtempSync(join(tmpdir(), 'gen-scenarios-cli-'));
    const inputPath = join(dir, 'exploration.json');
    writeFileSync(inputPath, JSON.stringify(model));
    try {
      run(dir, inputPath);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it('rejects an unknown CLI argument', () => {
    withInputFile(tenRelations(), (_dir, inputPath) => {
      const result = spawnSync(process.execPath, [SCRIPT, '--input', inputPath, '--bogus'], { encoding: 'utf8' });
      expect(result.status).toBe(2);
      expect(result.stderr).toContain('Unknown argument: --bogus');
    });
  });

  it('requires --input', () => {
    const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('--input is required');
  });

  it('writes the compiled scenario text to stdout with exit 0 in text format', () => {
    withInputFile(tenRelations(), (_dir, inputPath) => {
      const result = spawnSync(process.execPath, [SCRIPT, '--input', inputPath], { encoding: 'utf8' });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('#### Scenario:');
    });
  });

  it('writes diagnostics as JSON when --format json is given and the input is invalid', () => {
    withInputFile({ commands: [], domain_events: [], aggregates: [] }, (_dir, inputPath) => {
      const result = spawnSync(process.execPath, [SCRIPT, '--input', inputPath, '--format', 'json'], { encoding: 'utf8' });
      expect(result.status).toBe(2);
      const parsed = JSON.parse(result.stdout);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]).toMatchObject({ rule_id: 'PL-SCENARIO-OWNERSHIP' });
    });
  });

  it('writes diagnostics as plain text when the input is invalid and --format is not json', () => {
    withInputFile({ commands: [], domain_events: [], aggregates: [] }, (_dir, inputPath) => {
      const result = spawnSync(process.execPath, [SCRIPT, '--input', inputPath], { encoding: 'utf8' });
      expect(result.status).toBe(2);
      expect(result.stdout).toContain('PL-SCENARIO-OWNERSHIP');
      expect(result.stdout).not.toContain('{');
    });
  });

  it('checks event coverage against --scenarios and reports missing events as JSON', () => {
    withInputFile(tenRelations(), (dir, inputPath) => {
      const scenariosPath = join(dir, 'scenarios.md');
      writeFileSync(scenariosPath, '- **THEN** Event 1');
      const result = spawnSync(
        process.execPath,
        [SCRIPT, '--input', inputPath, '--scenarios', scenariosPath, '--format', 'json'],
        { encoding: 'utf8' },
      );
      expect(result.status).toBe(1);
      const parsed = JSON.parse(result.stdout);
      expect(parsed.length).toBe(9);
      expect(parsed[0]).toMatchObject({ rule_id: 'PL-SCENARIO-MISSING-EVENT' });
    });
  });

  it('reports full event coverage with exit 0 and no stdout output in text format', () => {
    withInputFile(tenRelations(), (dir, inputPath) => {
      const scenariosPath = join(dir, 'scenarios.md');
      const events = tenRelations().domain_events.map((event) => `- **THEN** ${event}`).join('\n');
      writeFileSync(scenariosPath, events);
      const result = spawnSync(
        process.execPath,
        [SCRIPT, '--input', inputPath, '--scenarios', scenariosPath],
        { encoding: 'utf8' },
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toBe('');
    });
  });

  it('reports a bad JSON parse failure via the catch block, exit code 2', () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-scenarios-cli-'));
    const inputPath = join(dir, 'exploration.json');
    writeFileSync(inputPath, '{ not valid json');
    try {
      const result = spawnSync(process.execPath, [SCRIPT, '--input', inputPath], { encoding: 'utf8' });
      expect(result.status).toBe(2);
      expect(result.stderr.length).toBeGreaterThan(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not run the CLI block when imported as a module rather than executed', () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-scenarios-import-'));
    const probe = join(dir, 'probe.mjs');
    writeFileSync(probe, `import '${SCRIPT.replace(/\\/g, '\\\\')}';\nprocess.stdout.write('imported-ok');\n`);
    const result = spawnSync(process.execPath, [probe], { encoding: 'utf8' });
    expect(result.stdout).toBe('imported-ok');
    expect(result.status).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('gen-scenarios CLI entrypoint guard (in-process)', () => {
  // Mirrors pl-scope-guard.test.ts: Stryker's vitest-runner only activates
  // mutants within the same process, so the top-level guard condition needs
  // in-process coverage via dynamic import, not just spawnSync assertions.
  async function importFresh(bustTag: string) {
    return import(`${pathToFileURL(SCRIPT).href}?bust=${bustTag}`);
  }

  it('runs the CLI block when argv[1] resolves to this module', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-scenarios-inproc-'));
    const inputPath = join(dir, 'exploration.json');
    writeFileSync(inputPath, JSON.stringify(tenRelations()));
    const originalArgv = process.argv;
    const originalExitCode = process.exitCode;
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    process.argv = [originalArgv[0], SCRIPT, '--input', inputPath];
    process.exitCode = undefined;
    try {
      await importFresh('main-true');
      expect(process.exitCode).toBe(0);
      expect(writeSpy).toHaveBeenCalled();
    } finally {
      writeSpy.mockRestore();
      process.argv = originalArgv;
      process.exitCode = originalExitCode;
      rmSync(dir, { recursive: true, force: true });
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

  it('parses --input, --scenarios, and --format together and reports missing-event JSON diagnostics', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-scenarios-inproc-'));
    const inputPath = join(dir, 'exploration.json');
    const scenariosPath = join(dir, 'scenarios.md');
    writeFileSync(inputPath, JSON.stringify(tenRelations()));
    writeFileSync(scenariosPath, '- **THEN** Event 1');
    try {
      const result = await runCliInProcess('combined-flags', [
        '--input', inputPath, '--scenarios', scenariosPath, '--format', 'json',
      ]);
      expect(result.exitCode).toBe(1);
      const parsed = JSON.parse(result.stdout);
      expect(parsed.length).toBe(9);
      expect(parsed[0]).toMatchObject({ rule_id: 'PL-SCENARIO-MISSING-EVENT' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes invalid-model diagnostics as plain text with exit 2 when format is not json', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-scenarios-inproc-'));
    const inputPath = join(dir, 'exploration.json');
    writeFileSync(inputPath, JSON.stringify({ commands: [], domain_events: [], aggregates: [] }));
    try {
      const result = await runCliInProcess('invalid-text', ['--input', inputPath]);
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toContain('PL-SCENARIO-OWNERSHIP');
      expect(result.stdout).not.toContain('{');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes invalid-model diagnostics as JSON with exit 2 when format is json', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-scenarios-inproc-'));
    const inputPath = join(dir, 'exploration.json');
    writeFileSync(inputPath, JSON.stringify({ commands: [], domain_events: [], aggregates: [] }));
    try {
      const result = await runCliInProcess('invalid-json', ['--input', inputPath, '--format', 'json']);
      expect(result.exitCode).toBe(2);
      const parsed = JSON.parse(result.stdout);
      expect(parsed[0]).toMatchObject({ rule_id: 'PL-SCENARIO-OWNERSHIP' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports an unknown CLI argument via the catch block with exit 2', async () => {
    const result = await runCliInProcess('unknown-arg', ['--bogus']);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toBe('Unknown argument: --bogus\n');
  });

  it('reports a missing --input via the catch block with exit 2', async () => {
    const result = await runCliInProcess('missing-input', []);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toBe('--input is required\n');
  });
});
