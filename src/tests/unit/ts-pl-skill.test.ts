import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../skills/ts-pl/', import.meta.url));
const normal = readFileSync(join(root, 'SKILL.md'), 'utf8');
const caveman = readFileSync(join(root, 'SKILL_caveman.md'), 'utf8');

function contract(content: string) {
  const match = content.match(/<!-- PL-KERNEL-CONTRACT:START -->[\s\S]*?<!-- PL-KERNEL-CONTRACT:END -->/);
  if (!match) throw new Error('missing PL kernel contract block');
  return match[0];
}

describe('ts-pl host-neutral skill', () => {
  it('keeps command, diagnostic, rule-id, and activation contracts byte-identical', () => {
    expect(contract(normal)).toBe(contract(caveman));
    for (const command of ['pl-arch-check', 'pl-contract-check', 'gen-scenarios']) {
      expect(contract(normal)).toContain(`COMMAND ${command}`);
    }
    for (const field of ['version', 'rule_id', 'severity', 'file', 'dependency', 'message']) {
      expect(contract(normal)).toContain(field);
    }
    expect(contract(normal)).toContain('EXIT: 0 compliant; 1 rule violation; 2 invalid input');
    expect(contract(normal)).toContain('ACTIVATION: none');
  });

  it('ships all kernel references without Phase-B integration instructions', () => {
    for (const reference of ['layers-map.md', 'contracts.md', 'scenario-compile.md']) {
      expect(existsSync(join(root, 'references', reference))).toBe(true);
    }
    const content = `${normal}\n${caveman}`;
    expect(content).not.toMatch(/dependency-cruiser|eslint|consumer scaffold|adapter setup|hook installation/i);
    expect(content).toContain('Codex/Claude parity is not claimed');
  });
});
