import { describe, it, expect } from 'vitest';
import { buildExecutiveDashboard } from '@/lib/analytics/executive-dashboard';
import { FixtureDataProvider } from '@/tests/analytics/fixture-provider';
import { SECTION_CATALOG } from '@/lib/sections/catalog';

const period = { from: '2025-01-01', to: '2025-01-31' };

describe('buildExecutiveDashboard', () => {
  it('builds health score, hero KPI, alerts, changes, and section scorecards', async () => {
    const dashboard = await buildExecutiveDashboard(new FixtureDataProvider(), period);

    expect(dashboard.healthScore).toBeGreaterThanOrEqual(0);
    expect(dashboard.healthScore).toBeLessThanOrEqual(100);
    expect(dashboard.heroKpis.map((evaluation) => evaluation.code)).toEqual([
      'HR_STATS',
      'FLUCT',
      'ENPS',
    ]);
    expect(dashboard.topAlerts.length).toBeGreaterThan(0);
    expect(dashboard.topAlerts[0]!.severityScore).toBeGreaterThan(0);
    expect(dashboard.topAlerts[0]!.thresholdDistanceCs.length).toBeGreaterThan(0);
    expect(dashboard.topAlerts.every((alert) => alert.rank >= 1 && alert.rank <= 5)).toBe(true);
    expect(dashboard.topAlerts[0]!.rank).toBe(1);
    expect(dashboard.topAlerts[0]!.owner.length).toBeGreaterThan(0);
    expect(dashboard.topAlerts[0]!.ageDays).toBeGreaterThan(0);
    expect(dashboard.sectionScorecards).toHaveLength(SECTION_CATALOG.length);
    expect(dashboard.aiSummaryCs.length).toBeGreaterThan(30);
  });

  it('orders top alerts by status severity and priority', async () => {
    const dashboard = await buildExecutiveDashboard(new FixtureDataProvider(), period);
    const first = dashboard.topAlerts[0];

    expect(first).toBeDefined();
    expect(['red', 'amber']).toContain(first!.status);
  });
});
