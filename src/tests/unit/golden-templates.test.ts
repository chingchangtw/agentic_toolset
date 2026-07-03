import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const GOLDEN_TEMPLATES_MODULE = new URL('../../../scripts/lib/golden-templates.mjs', import.meta.url);

const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

function makeFixtureTree() {
  const dir = mkdtempSync(join(tmpdir(), 'golden-templates-test-'));
  const sourceRoot = join(dir, 'src', 'project_root_structure');
  mkdirSync(join(sourceRoot, '.claude'), { recursive: true });
  mkdirSync(join(sourceRoot, '.github'), { recursive: true });
  writeFileSync(join(sourceRoot, 'CLAUDE.md'), 'root claude content\n');
  writeFileSync(join(sourceRoot, 'AGENTS.md'), 'agents content\n');
  writeFileSync(join(sourceRoot, '.claude', 'CLAUDE.md'), 'dotted claude content\n');
  writeFileSync(join(sourceRoot, '.claude', 'goverance_CLAUDE.md'), 'governance content\n');
  writeFileSync(join(sourceRoot, '.github', 'copilot-instructions.md'), 'copilot content\n');
  tmpDirs.push(dir);
  return dir;
}

async function loadModuleInFixture(fixtureDir: string) {
  // golden-templates.mjs resolves ROOT relative to its own file location, so
  // exercise it against a temp fixture tree by loading it from within that tree.
  const modulePath = join(fixtureDir, 'scripts', 'lib', 'golden-templates.mjs');
  mkdirSync(join(fixtureDir, 'scripts', 'lib'), { recursive: true });
  writeFileSync(modulePath, readFileSync(GOLDEN_TEMPLATES_MODULE, 'utf8'));
  return import(`${modulePath}?t=${Date.now()}-${Math.random()}`);
}

describe('syncGoldenTemplates', () => {
  it('copies assets/golden/.claude/CLAUDE.md byte-identical to src/project_root_structure/.claude/CLAUDE.md', async () => {
    const fixtureDir = makeFixtureTree();
    const goldenRoot = join(
      fixtureDir,
      'src',
      'skills',
      'ondemand',
      'ts-project-init-advisor',
      'assets',
      'golden'
    );

    const { syncGoldenTemplates } = await loadModuleInFixture(fixtureDir);
    syncGoldenTemplates();

    const srcContent = readFileSync(join(fixtureDir, 'src', 'project_root_structure', '.claude', 'CLAUDE.md'));
    const destContent = readFileSync(join(goldenRoot, '.claude', 'CLAUDE.md'));
    expect(destContent.equals(srcContent)).toBe(true);
    expect(existsSync(join(goldenRoot, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(join(goldenRoot, 'AGENTS.md'))).toBe(true);
    expect(existsSync(join(goldenRoot, '.github', 'copilot-instructions.md'))).toBe(true);
  });
});

describe('checkGoldenParity', () => {
  it('returns [] when all 5 files are fully synced', async () => {
    const fixtureDir = makeFixtureTree();
    const { syncGoldenTemplates, checkGoldenParity } = await loadModuleInFixture(fixtureDir);
    syncGoldenTemplates();
    expect(checkGoldenParity()).toEqual([]);
  });

  it('reports reason "missing" for an absent golden copy', async () => {
    const fixtureDir = makeFixtureTree();
    const { syncGoldenTemplates, checkGoldenParity } = await loadModuleInFixture(fixtureDir);
    syncGoldenTemplates();
    rmSync(
      join(fixtureDir, 'src', 'skills', 'ondemand', 'ts-project-init-advisor', 'assets', 'golden', 'AGENTS.md')
    );
    expect(checkGoldenParity()).toEqual([{ file: 'AGENTS.md', reason: 'missing' }]);
  });

  it('reports reason "content-mismatch" for a single-character drift', async () => {
    const fixtureDir = makeFixtureTree();
    const { syncGoldenTemplates, checkGoldenParity } = await loadModuleInFixture(fixtureDir);
    syncGoldenTemplates();
    const goldenClaudeMd = join(
      fixtureDir, 'src', 'skills', 'ondemand', 'ts-project-init-advisor', 'assets', 'golden', 'CLAUDE.md'
    );
    writeFileSync(goldenClaudeMd, 'x' + readFileSync(goldenClaudeMd, 'utf8'));
    expect(checkGoldenParity()).toEqual([{ file: 'CLAUDE.md', reason: 'content-mismatch' }]);
  });
});
