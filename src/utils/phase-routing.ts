export function getPhaseList(epicType: 'bugfix' | 'refactor' | 'epic'): string[] {
  switch (epicType) {
    case 'bugfix':
      return ['Think', 'Build', 'Ship'];
    case 'refactor':
      return ['Think', 'Plan', 'Build', 'Review', 'Ship', 'Reflect'];
    case 'epic':
      return ['Think', 'Plan', 'Build', 'Review', 'Test', 'Ship', 'Reflect'];
  }
}
