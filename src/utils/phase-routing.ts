// 'poc' is intentionally absent: PoC is Discovery-only and never initializes a
// deliver spine. 'epic' is retained for existing iteration.json state (plan
// slices), though it is no longer an end-user WORK_TYPE.
export function getPhaseList(
  epicType:
    | 'epic'
    | 'feature'
    | 'bugfix'
    | 'hotfix'
    | 'refactor'
    | 'chore'
    | 'patch'
    | 'spike'
    | 'ops'
): string[] {
  switch (epicType) {
    case 'bugfix':
    case 'hotfix':
      return ['Think', 'Build', 'Ship'];
    case 'chore':
      return ['Build', 'Ship'];
    case 'patch':
      return ['Build', 'Test', 'Ship'];
    case 'spike':
      return ['Think', 'Build', 'Reflect'];
    case 'ops':
      return ['Think', 'Build', 'Review', 'Ship'];
    case 'feature':
      return ['Think', 'Plan', 'Build', 'Review', 'Test', 'Ship'];
    case 'refactor':
      return ['Think', 'Plan', 'Build', 'Review', 'Ship', 'Reflect'];
    case 'epic':
      return ['Think', 'Plan', 'Build', 'Review', 'Test', 'Ship', 'Reflect'];
  }
}
