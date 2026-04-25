import { describe, expect, it } from 'vitest';
import { buildActionBacklog } from '@/lib/actions/action-backlog';
import { ANALYTICS_TOPICS } from '@/lib/analytics/cross-cutting';
import { buildExecutiveDashboard } from '@/lib/analytics/executive-dashboard';
import { OPERATIONAL_VIEWS } from '@/lib/analytics/operational-views';
import { buildExecutiveBriefing } from '@/lib/briefing/executive-briefing';
import { mockDataProvider } from '@/lib/data/mock-provider';
import { SECTION_CATALOG } from '@/lib/sections/catalog';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

describe('demo flow smoke', () => {
  it('builds the main presentation route models and keeps internal links routable', async () => {
    const [dashboard, backlog, briefing] = await Promise.all([
      buildExecutiveDashboard(mockDataProvider, PERIOD),
      buildActionBacklog(mockDataProvider, PERIOD),
      buildExecutiveBriefing(mockDataProvider, PERIOD),
    ]);
    const knownRoutes = new Set([
      '/',
      '/akce',
      '/briefing',
      ...SECTION_CATALOG.map((section) => section.href),
      ...ANALYTICS_TOPICS.map((topic) => topic.href),
      ...OPERATIONAL_VIEWS.map((view) => view.href),
    ]);

    expect(dashboard.sectionScorecards).toHaveLength(SECTION_CATALOG.length);
    expect(dashboard.topAlerts.length).toBeGreaterThan(0);
    expect(backlog.items.length).toBeGreaterThan(0);
    expect(briefing.projectProgress.percent).toBe(100);

    for (const scorecard of dashboard.sectionScorecards) {
      expect(knownRoutes.has(scorecard.section.href)).toBe(true);
    }

    for (const item of backlog.items) {
      expect(knownRoutes.has(item.href)).toBe(true);
    }
  });
});
