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

  it('feature → ["Think","Plan","Build","Review","Test","Ship"]', () => {
    expect(getPhaseList('feature')).toEqual(['Think', 'Plan', 'Build', 'Review', 'Test', 'Ship']);
  });

  it('hotfix → ["Think","Build","Ship"]', () => {
    expect(getPhaseList('hotfix')).toEqual(['Think', 'Build', 'Ship']);
  });

  it('chore → ["Build","Ship"]', () => {
    expect(getPhaseList('chore')).toEqual(['Build', 'Ship']);
  });

  it('patch → ["Build","Test","Ship"]', () => {
    expect(getPhaseList('patch')).toEqual(['Build', 'Test', 'Ship']);
  });

  it('spike → ["Think","Build","Reflect"]', () => {
    expect(getPhaseList('spike')).toEqual(['Think', 'Build', 'Reflect']);
  });

  it('ops → ["Think","Build","Review","Ship"]', () => {
    expect(getPhaseList('ops')).toEqual(['Think', 'Build', 'Review', 'Ship']);
  });
});
