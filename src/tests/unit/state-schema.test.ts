import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const FIXTURES_DIR = fileURLToPath(
  new URL('../../../tests/orchestration/fixtures/iteration-state', import.meta.url)
);

const REQUIRED_ITERATION_FIELDS = [
  'project',
  'release',
  'release_goal',
  'epics',
  'active_epic',
  'iteration_start',
  'writer_lock',
  'active_phase',
  'dial',
];

const REQUIRED_ROUTER_FIELDS = ['current_phase', 'schema_version'];

const FIXTURE_NAMES = [
  'bugfix-high.json',
  'bugfix-mid.json',
  'bugfix-low.json',
  'refactor-high.json',
  'refactor-mid.json',
  'refactor-low.json',
  'epic-high.json',
  'epic-mid.json',
  'epic-low.json',
];

describe('state-schema — REQUIRED_ITERATION_FIELDS', () => {
  for (const filename of FIXTURE_NAMES) {
    it(`${filename} has all required iteration fields`, () => {
      const raw = readFileSync(join(FIXTURES_DIR, filename), 'utf8');
      const data = JSON.parse(raw);
      for (const field of REQUIRED_ITERATION_FIELDS) {
        expect(data, `Missing field ${field} in fixture ${filename}`).toHaveProperty(field);
      }
    });
  }
});

describe('state-schema — REQUIRED_ROUTER_FIELDS exported for reference', () => {
  it('REQUIRED_ROUTER_FIELDS declares current_phase and schema_version', () => {
    expect(REQUIRED_ROUTER_FIELDS).toContain('current_phase');
    expect(REQUIRED_ROUTER_FIELDS).toContain('schema_version');
  });
});
