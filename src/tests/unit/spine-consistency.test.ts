import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { getPhaseList } from '../../utils/phase-routing';

const PROFILES = readFileSync(
  fileURLToPath(new URL('../../skills/ts-project-planner/references/work-unit-profiles.md', import.meta.url)),
  'utf8'
);

const NEW_TYPES: Record<string, string> = {
  Feature: 'feature',
  Hotfix: 'hotfix',
  'Chore & Tech Debt': 'chore',
  Patch: 'patch',
  Spike: 'spike',
  'Ops/Infra': 'ops',
};

function activePhasesFor(sectionTitle: string): string[] {
  // Match "## <Title> (...)" then the next "Active phases:   a → b → c" line.
  const escaped = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sectionRe = new RegExp(`## ${escaped}[^\\n]*\\n[\\s\\S]*?Active phases:\\s*([^\\n]+)`);
  const match = PROFILES.match(sectionRe);
  if (!match) throw new Error(`No "Active phases:" line found for section "${sectionTitle}" in work-unit-profiles.md`);
  return match[1].split('→').map((p) => p.trim().toLowerCase()).filter(Boolean);
}

describe('phase-routing.ts vs work-unit-profiles.md — new work types stay in lockstep', () => {
  for (const [sectionTitle, routingKey] of Object.entries(NEW_TYPES)) {
    it(`${routingKey}: spine matches between phase-routing.ts and work-unit-profiles.md`, () => {
      const fromCode = getPhaseList(routingKey as Parameters<typeof getPhaseList>[0]).map((p) => p.toLowerCase());
      const fromDocs = activePhasesFor(sectionTitle);
      expect(fromDocs).toEqual(fromCode);
    });
  }
});
