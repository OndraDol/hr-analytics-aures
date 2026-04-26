import { AppShell } from '@/components/layout/app-shell';
import { MotionStack } from '@/components/layout/motion-stack';
import { RetentionPage } from '@/components/retention/retention-page';
import { mockAIInsightProvider } from '@/lib/ai/insight-provider';
import { buildKpiCardModel } from '@/lib/analytics/kpi-engine';
import { buildRetentionSummary } from '@/lib/analytics/retention-summary';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export default async function RetentionSectionPage() {
  const [fluctuation, criticalFluctuation, enps, succession, summary] = await Promise.all([
    buildKpiCardModel(mockDataProvider, 'FLUCT', { period: PERIOD }, mockAIInsightProvider),
    buildKpiCardModel(mockDataProvider, 'FLUCT_CRIT', { period: PERIOD }, mockAIInsightProvider),
    buildKpiCardModel(mockDataProvider, 'ENPS', { period: PERIOD }, mockAIInsightProvider),
    buildKpiCardModel(mockDataProvider, 'SUCCESSION', { period: PERIOD }, mockAIInsightProvider),
    buildRetentionSummary(mockDataProvider, PERIOD),
  ]);

  return (
    <AppShell activeHref="/sekce/retention" sectionLabel="Sekce V" sectionTitle="Retention & fluktuace">
      <MotionStack>
        <RetentionPage
          fluctuation={fluctuation}
          criticalFluctuation={criticalFluctuation}
          enps={enps}
          succession={succession}
          summary={summary}
        />
      </MotionStack>
    </AppShell>
  );
}
