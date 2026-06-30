import { describe, it, expect } from 'vitest';
import { getPhaseList } from '@utils/phase-routing';

describe('getPhaseList — phase sequences by epic type', () => {
  it('bugfix → ["Think","Build","Ship"]', () => {
    expect(getPhaseList('bugfix')).toEqual(['Think', 'Build', 'Ship']);
  });

  it('refactor → ["Think","Plan","Build","Review","Ship","Reflect"]', () => {
    expect(getPhaseList('refactor')).toEqual(['Think', 'Plan', 'Build', 'Review', 'Ship', 'Reflect']);
  });

  it('epic → ["Think","Plan","Build","Review","Test","Ship","Reflect"]', () => {
    expect(getPhaseList('epic')).toEqual(['Think', 'Plan', 'Build', 'Review', 'Test', 'Ship', 'Reflect']);
  });
});
