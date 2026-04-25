export interface ProjectMilestone {
  id: string;
  title: string;
  percent: number;
  completed: boolean;
}

export interface ProjectProgress {
  percent: number;
  labelCs: string;
  completedPercent: number;
  totalPercent: number;
  completedCount: number;
  totalCount: number;
  baselineBeforeFinalFeaturesPercent: number;
  milestones: ProjectMilestone[];
}

export const PROJECT_BASELINE_BEFORE_FINAL_FEATURES_PERCENT = 82;

export const PROJECT_MILESTONES: ProjectMilestone[] = [
  { id: 'm0-foundation', title: 'M0 Foundation', percent: 5, completed: true },
  { id: 'm1-data', title: 'M1 Data layer', percent: 10, completed: true },
  { id: 'm2-kpi-core', title: 'M2 KPI core', percent: 12, completed: true },
  { id: 'm3-retention', title: 'M3 Retention reference', percent: 10, completed: true },
  { id: 'm4-executive', title: 'M4 Executive dashboard', percent: 10, completed: true },
  { id: 'm5-sections', title: 'M5 Full sections', percent: 12, completed: true },
  { id: 'm6-drilldowns', title: 'M6 Cross-cutting analytics', percent: 8, completed: true },
  { id: 'm7-operational', title: 'M7 Operational views', percent: 7, completed: true },
  { id: 'm8-copilot', title: 'M8 AI Copilot', percent: 8, completed: true },
  { id: 'm9-polish', title: 'M9 Polish & demo setup', percent: 10, completed: true },
  { id: 'pdf-briefing', title: 'PDF briefing export', percent: 8, completed: true },
];

export function getProjectProgress(
  milestones: readonly ProjectMilestone[] = PROJECT_MILESTONES,
): ProjectProgress {
  const totalPercent = milestones.reduce((total, milestone) => total + milestone.percent, 0);
  const completedPercent = milestones.reduce(
    (total, milestone) => total + (milestone.completed ? milestone.percent : 0),
    0,
  );
  const percent = totalPercent > 0 ? Math.round((completedPercent / totalPercent) * 100) : 0;
  const completedCount = milestones.filter((milestone) => milestone.completed).length;
  const labelCs =
    percent >= 100
      ? 'Prezentační prototyp v1 dokončen'
      : `Prezentační prototyp v1: ${percent} % dokončeno`;

  return {
    percent,
    labelCs,
    completedPercent,
    totalPercent,
    completedCount,
    totalCount: milestones.length,
    baselineBeforeFinalFeaturesPercent: PROJECT_BASELINE_BEFORE_FINAL_FEATURES_PERCENT,
    milestones: [...milestones],
  };
}
