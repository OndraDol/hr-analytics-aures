import { describe, expect, it } from 'vitest';
import { buildSectionDashboard } from '@/lib/analytics/section-summaries';
import { mockDataProvider } from '@/lib/data/mock-provider';
import { SECTION_CATALOG } from '@/lib/sections/catalog';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

describe('section dashboards', () => {
  it('builds complete dashboard data for every non-retention section', async () => {
    const sections = SECTION_CATALOG.filter((section) => section.slug !== 'retention');
    const dashboards = await Promise.all(
      sections.map((section) => buildSectionDashboard(mockDataProvider, section, PERIOD)),
    );

    expect(dashboards).toHaveLength(7);
    for (const dashboard of dashboards) {
      expect(dashboard.kpis.map((model) => model.evaluation.code)).toContain(dashboard.section.primaryKpi);
      expect(dashboard.metrics.length).toBeGreaterThanOrEqual(4);
      expect(dashboard.primaryBreakdown.rows.length).toBeGreaterThan(0);
      expect(dashboard.secondaryBreakdown.rows.length).toBeGreaterThan(0);
      expect(dashboard.table.rows.length).toBeGreaterThan(0);
      expect(dashboard.actions.length).toBeGreaterThanOrEqual(3);
      expect(dashboard.executiveSignalCs.length).toBeGreaterThan(40);
    }
  });

  it('exposes generated recruitment facts through the provider', async () => {
    const requisitions = await mockDataProvider.getRequisitions(PERIOD);
    const funnel = await mockDataProvider.getFunnelCounts(PERIOD);

    expect(requisitions.length).toBeGreaterThan(0);
    expect(funnel.length).toBeGreaterThan(0);
    expect(requisitions.some((row) => row.critical)).toBe(true);
    expect(funnel.map((row) => row.stage)).toContain('hired');
  });
});
