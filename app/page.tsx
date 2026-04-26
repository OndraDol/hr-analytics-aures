import { AppShell } from '@/components/layout/app-shell';
import { MotionStack } from '@/components/layout/motion-stack';
import { ExecutiveSummary } from '@/components/dashboard/executive-summary';
import { HealthScoreHero } from '@/components/dashboard/health-score-hero';
import { SectionScorecards } from '@/components/dashboard/section-scorecards';
import { TopAlerts } from '@/components/dashboard/top-alerts';
import { WhatChanged } from '@/components/dashboard/what-changed';
import { buildExecutiveDashboard } from '@/lib/analytics/executive-dashboard';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export default async function Home() {
  const dashboard = await buildExecutiveDashboard(mockDataProvider, PERIOD);

  return (
    <AppShell activeHref="/" sectionLabel="Executive" sectionTitle="HR Analytics - Q1 2026">
      <main className="px-5 py-6 md:px-8">
        <MotionStack>
          <HealthScoreHero data={dashboard} />
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <TopAlerts alerts={dashboard.topAlerts} />
            <div className="space-y-6">
              <WhatChanged changes={dashboard.changes} hypotheses={dashboard.hypotheses} />
              <ExecutiveSummary summary={dashboard.aiSummaryCs} />
            </div>
          </div>
          <div className="mt-6">
            <SectionScorecards scorecards={dashboard.sectionScorecards} />
          </div>
        </MotionStack>
      </main>
    </AppShell>
  );
}
