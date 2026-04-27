import { AppShell } from '@/components/layout/app-shell';
import { MotionStack } from '@/components/layout/motion-stack';
import { HealthScoreHero } from '@/components/dashboard/health-score-hero';
import { HypothesesPanel } from '@/components/dashboard/hypotheses-panel';
import { SectionScorecards } from '@/components/dashboard/section-scorecards';
import { TopAlerts } from '@/components/dashboard/top-alerts';
import { buildExecutiveDashboard } from '@/lib/analytics/executive-dashboard';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

export default async function Home() {
  const dashboard = await buildExecutiveDashboard(mockDataProvider, PERIOD);

  return (
    <AppShell activeHref="/" sectionLabel="Vedení" sectionTitle="HR Overview · Q1 2026">
      <main className="px-5 py-6 md:px-8">
        <MotionStack>
          <HealthScoreHero data={dashboard} />
          <div className="mt-6">
            <TopAlerts
              alerts={dashboard.topAlerts}
              evaluations={dashboard.allEvaluations}
              changes={dashboard.changes}
            />
          </div>
          {dashboard.hypotheses.length > 0 ? (
            <div className="mt-4">
              <HypothesesPanel hypotheses={dashboard.hypotheses} />
            </div>
          ) : null}
          <div className="mt-6">
            <SectionScorecards scorecards={dashboard.sectionScorecards} />
          </div>
        </MotionStack>
      </main>
    </AppShell>
  );
}
