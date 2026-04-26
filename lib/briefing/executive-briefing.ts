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
  coverData: {
    titleCs: string;
    subtitleCs: string;
    generatedLabelCs: string;
  };
  pages: { id: string; titleCs: string }[];
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
    coverData: {
      titleCs: 'Executive briefing Q1 2026',
      subtitleCs: 'Board-ready HR Analytics podklad pro rozhodnutí a prioritizaci.',
      generatedLabelCs: 'Q1 2026 snapshot · mock data',
    },
    pages: [
      { id: 'cover', titleCs: 'Cover' },
      { id: 'health', titleCs: 'Health score' },
      { id: 'alerts', titleCs: 'Top alerts' },
      { id: 'changes', titleCs: 'Monthly changes' },
      { id: 'sections', titleCs: 'Sections I-VIII' },
    ],
  };
}
