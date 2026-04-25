import { describe, expect, it } from 'vitest';
import { ANALYTICS_TOPICS, buildCrossCuttingDashboard } from '@/lib/analytics/cross-cutting';
import { mockDataProvider } from '@/lib/data/mock-provider';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

describe('cross-cutting analytics dashboards', () => {
  it('builds the M6 drill-down model for every analytics topic', async () => {
    const dashboards = await Promise.all(
      ANALYTICS_TOPICS.map((topic) => buildCrossCuttingDashboard(mockDataProvider, topic, PERIOD)),
    );

    expect(dashboards).toHaveLength(4);
    expect(dashboards.map((dashboard) => dashboard.slug)).toEqual([
      'attrition',
      'recruitment-funnel',
      'compensation-pay-gap',
      'absence-coverage',
    ]);

    for (const dashboard of dashboards) {
      expect(dashboard.href).toBe(`/analytika/${dashboard.slug}`);
      expect(dashboard.metrics).toHaveLength(4);
      expect(dashboard.primaryBreakdown.rows.length).toBeGreaterThan(0);
      expect(dashboard.secondaryBreakdown.rows.length).toBeGreaterThan(0);
      expect(dashboard.table.rows.length).toBeGreaterThan(0);
      expect(dashboard.actions.length).toBeGreaterThanOrEqual(3);
      expect(dashboard.relatedLinks.length).toBeGreaterThanOrEqual(3);
      expect(dashboard.insightCs.length).toBeGreaterThan(60);
    }
  });

  it('exposes recruitment funnel bottleneck and stage data', async () => {
    const topic = ANALYTICS_TOPICS.find((item) => item.slug === 'recruitment-funnel');
    expect(topic).toBeDefined();

    const dashboard = await buildCrossCuttingDashboard(mockDataProvider, topic!, PERIOD);
    const stageLabels = dashboard.primaryBreakdown.rows.map((row) => row.label);

    expect(stageLabels).toContain('Longlist');
    expect(stageLabels).toContain('Hired');
    expect(dashboard.metrics.some((metric) => metric.label === 'Bottleneck')).toBe(true);
  });
});
