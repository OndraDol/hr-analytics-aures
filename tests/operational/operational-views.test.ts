import { describe, expect, it } from 'vitest';
import { ANALYTICS_TOPICS } from '@/lib/analytics/cross-cutting';
import {
  OPERATIONAL_VIEWS,
  buildOperationalDashboard,
} from '@/lib/analytics/operational-views';
import { mockDataProvider } from '@/lib/data/mock-provider';
import { SECTION_CATALOG } from '@/lib/sections/catalog';

const PERIOD = { from: '2026-01-01', to: '2026-03-31' };

describe('operational views', () => {
  it('builds the M7 operational model for every operational view', async () => {
    const dashboards = await Promise.all(
      OPERATIONAL_VIEWS.map((view) => buildOperationalDashboard(mockDataProvider, view, PERIOD)),
    );

    expect(dashboards).toHaveLength(5);
    expect(dashboards.map((dashboard) => dashboard.slug)).toEqual([
      'hired-fired',
      'org-chart',
      'vacation-balances',
      'enps-latest',
      'esg',
    ]);

    for (const dashboard of dashboards) {
      expect(dashboard.href).toBe(`/operativa/${dashboard.slug}`);
      expect(dashboard.metrics).toHaveLength(4);
      expect(dashboard.primaryBreakdown.rows.length).toBeGreaterThan(0);
      expect(dashboard.table.rows.length).toBeGreaterThan(0);
      expect(dashboard.actions.length).toBeGreaterThanOrEqual(3);
      expect(dashboard.relatedLinks.length).toBeGreaterThanOrEqual(3);
      expect(dashboard.insightCs.length).toBeGreaterThan(60);
    }
  });

  it('keeps section cross-links on implemented M6/M7 routes', () => {
    const analyticsHrefs = new Set(ANALYTICS_TOPICS.map((topic) => topic.href));
    const operationalHrefs = new Set(OPERATIONAL_VIEWS.map((view) => view.href));

    for (const section of SECTION_CATALOG) {
      for (const link of section.relatedAnalytics) {
        expect(analyticsHrefs.has(link.href), `${section.slug} analytics link ${link.href}`).toBe(true);
      }
      for (const link of section.relatedOperational) {
        expect(operationalHrefs.has(link.href), `${section.slug} operational link ${link.href}`).toBe(true);
      }
    }
  });

  it('marks all ESG datapoints with explicit data quality', async () => {
    const esgView = OPERATIONAL_VIEWS.find((view) => view.slug === 'esg');
    expect(esgView).toBeDefined();

    const dashboard = await buildOperationalDashboard(mockDataProvider, esgView!, PERIOD);

    expect(dashboard.table.rows).toHaveLength(21);
    expect(dashboard.table.rows.every((row) => row.dataQuality)).toBe(true);
    expect(dashboard.table.rows.some((row) => row.dataQuality === 'mock')).toBe(true);
    expect(dashboard.table.rows.some((row) => row.dataQuality === 'blocked')).toBe(true);
  });
});
