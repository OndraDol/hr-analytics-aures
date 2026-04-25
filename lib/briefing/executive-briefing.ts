import { buildExecutiveDashboard, type ExecutiveDashboardData } from '@/lib/analytics/executive-dashboard';
import type { DataProvider, Period } from '@/lib/data/provider';
import { getProjectProgress, type ProjectProgress } from '@/lib/project/progress';

export interface ExecutiveBriefingStatusCounts {
  green: number;
  amber: number;
  red: number;
}

export interface ExecutiveBriefingData {
  dashboard: ExecutiveDashboardData;
  projectProgress: ProjectProgress;
  statusCounts: ExecutiveBriefingStatusCounts;
  generatedLabelCs: string;
}

export async function buildExecutiveBriefing(
  provider: DataProvider,
  period: Period,
): Promise<ExecutiveBriefingData> {
  const dashboard = await buildExecutiveDashboard(provider, period);
  const statusCounts = dashboard.allEvaluations.reduce<ExecutiveBriefingStatusCounts>(
    (counts, evaluation) => ({
      ...counts,
      [evaluation.status]: counts[evaluation.status] + 1,
    }),
    { green: 0, amber: 0, red: 0 },
  );

  return {
    dashboard,
    projectProgress: getProjectProgress(),
    statusCounts,
    generatedLabelCs: 'Q1 2026 snapshot · mock data',
  };
}
