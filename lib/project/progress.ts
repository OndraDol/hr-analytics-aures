export interface ProjectMilestone {
  id: string;
  title: string;
  percent: number;
  completed: boolean;
}

export interface ProjectProgress {
  percent: number;
  v1Percent: number;
  v2Percent: number;
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

export const V2_PROJECT_MILESTONES: ProjectMilestone[] = [
  { id: 'm12-decision-support', title: 'M12 Decision Support Layer', percent: 18, completed: true },
  { id: 'm13-visual-identity', title: 'M13 AURES Visual Identity', percent: 18, completed: true },
  { id: 'm14-charts-motion', title: 'M14 Charts & Motion', percent: 18, completed: true },
  { id: 'm15-drilldown-intelligence', title: 'M15 Drill-Down Intelligence', percent: 18, completed: true },
  { id: 'm16-pdf-esg-polish', title: 'M16 PDF + ESG Polish', percent: 18, completed: true },
  { id: 'm17-stabilization', title: 'M17 Stabilizace v2', percent: 10, completed: true },
];

export function getProjectProgress(
  milestones: readonly ProjectMilestone[] = PROJECT_MILESTONES,
  version: 'v1' | 'v2' = 'v1',
): ProjectProgress {
  const activeMilestones = version === 'v2' && milestones === PROJECT_MILESTONES ? V2_PROJECT_MILESTONES : milestones;
  const totalPercent = activeMilestones.reduce((total, milestone) => total + milestone.percent, 0);
  const completedPercent = activeMilestones.reduce(
    (total, milestone) => total + (milestone.completed ? milestone.percent : 0),
    0,
  );
  const percent = totalPercent > 0 ? Math.round((completedPercent / totalPercent) * 100) : 0;
  const completedCount = activeMilestones.filter((milestone) => milestone.completed).length;
  const v1Percent = progressPercent(PROJECT_MILESTONES);
  const v2Percent = progressPercent(V2_PROJECT_MILESTONES);
  const labelCs =
    version === 'v2'
      ? `v2 Perfection Pass: ${percent} % dokončeno`
      : percent >= 100
      ? 'Prezentační prototyp v1 dokončen'
      : `Prezentační prototyp v1: ${percent} % dokončeno`;

  return {
    percent,
    v1Percent,
    v2Percent,
    labelCs,
    completedPercent,
    totalPercent,
    completedCount,
    totalCount: activeMilestones.length,
    baselineBeforeFinalFeaturesPercent: PROJECT_BASELINE_BEFORE_FINAL_FEATURES_PERCENT,
    milestones: [...activeMilestones],
  };
}

function progressPercent(milestones: readonly ProjectMilestone[]): number {
  const total = milestones.reduce((sum, milestone) => sum + milestone.percent, 0);
  const completed = milestones.reduce((sum, milestone) => sum + (milestone.completed ? milestone.percent : 0), 0);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
